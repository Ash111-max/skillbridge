import os
import json
import random
import traceback
from pathlib import Path
import datetime
import tempfile

from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import Column, Integer, String, Text, JSON, DateTime
from dotenv import load_dotenv

from interview_logic import reduce_noise
from feedback_engine import analyze_response

# --- Load environment ---
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL not found in .env")

WHISPER_MODEL_NAME = os.getenv("WHISPER_MODEL", "base")

# --- Database setup ---
engine = create_async_engine(DATABASE_URL, echo=False, future=True)
AsyncSessionLocal = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
Base = declarative_base()


class Interview(Base):
    __tablename__ = "interviews"
    id = Column(Integer, primary_key=True, index=True)
    domain = Column(String(50))
    question = Column(Text)
    response = Column(Text)
    feedback = Column(JSON)
    audio_path = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


# --- Whisper ---
try:
    import whisper
    model = whisper.load_model(WHISPER_MODEL_NAME)
    WHISPER_AVAILABLE = True
    print(f"✅ Loaded Whisper model: {WHISPER_MODEL_NAME}")
except Exception as e:
    model = None
    WHISPER_AVAILABLE = False
    print("⚠️ Whisper not available:", e)

# --- Paths ---
BASE_DIR = Path(__file__).resolve().parent
QUESTIONS_PATH = BASE_DIR / "models" / "questions.json"
RECORDINGS_DIR = BASE_DIR / "recordings"
RECORDINGS_DIR.mkdir(exist_ok=True)

# --- App setup ---
app = FastAPI(title="SkillBridge Mock Interview", docs_url="/", redoc_url=None)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: Restrict for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Helper functions ---
def normalize_question_item(item):
    if isinstance(item, dict):
        return {
            "q": item.get("q") or item.get("question") or str(item),
            "a": item.get("a") or item.get("answer") or item.get("reference"),
        }
    return {"q": str(item), "a": None}


def load_questions():
    if not QUESTIONS_PATH.exists():
        raise FileNotFoundError("questions.json missing")
    with open(QUESTIONS_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    normalized = {d: [normalize_question_item(q) for q in qs] for d, qs in data.items()}
    return normalized


# --- API Routes ---
@app.get("/domains")
async def get_domains():
    data = load_questions()
    return list(data.keys())


@app.get("/question/{domain}")
async def get_question(domain: str):
    data = load_questions()
    qlist = data.get(domain)
    if not qlist:
        raise HTTPException(status_code=404, detail=f"No questions found for {domain}")
    return {"question": random.choice(qlist)}


@app.post("/interview/{domain}")
async def submit_interview(domain: str, audio_file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    try:
        data = load_questions()
        if domain not in data:
            raise HTTPException(status_code=404, detail=f"Unknown domain '{domain}'")

        question_item = random.choice(data[domain])
        question_text = question_item.get("q")
        reference = question_item.get("a")

        # Save uploaded audio
        wav_path = RECORDINGS_DIR / f"{datetime.datetime.utcnow().timestamp()}_{audio_file.filename}"
        with open(wav_path, "wb") as f:
            f.write(await audio_file.read())

        # Noise reduction
        reduce_noise(wav_path)

        # Transcription
        transcript = ""
        if WHISPER_AVAILABLE:
            try:
                result = model.transcribe(str(wav_path))
                transcript = result.get("text", "").strip()
            except Exception as e:
                print("Whisper failed:", e)
        else:
            transcript = "(Transcription unavailable - Whisper not loaded)"

        # Audio metrics
        import librosa, numpy as np
        audio_meta = {}
        try:
            y, sr = librosa.load(wav_path, sr=None)
            rms = float(np.mean(librosa.feature.rms(y=y)))
            pitches, mags = librosa.piptrack(y=y, sr=sr)
            pitch_values = [
                pitches[:, i][mags[:, i].argmax()]
                for i in range(pitches.shape[1])
                if pitches[:, i][mags[:, i].argmax()] > 0
            ]
            avg_pitch = float(sum(pitch_values) / len(pitch_values)) if pitch_values else None
            pitch_var = float(np.var(pitch_values)) if pitch_values else None
            duration = float(librosa.get_duration(y=y, sr=sr))
            words = len(transcript.split()) if transcript else 0
            audio_meta = {
                "duration": duration,
                "avg_pitch": avg_pitch,
                "pitch_var": pitch_var,
                "rms": rms,
                "words": words,
            }
        except Exception as e:
            print("Audio analysis failed:", e)

        # Feedback
        feedback = analyze_response(transcript, audio_meta=audio_meta, reference_answer=reference)

        # Save to DB
        new_entry = Interview(
            domain=domain,
            question=question_text,
            response=transcript,
            feedback=feedback,
            audio_path=str(wav_path),
        )
        db.add(new_entry)
        await db.commit()
        await db.refresh(new_entry)

        return {
            "status": "success",
            "message": "Interview analyzed successfully",
            "id": new_entry.id,
            "feedback": feedback,
        }

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/download_report/{interview_id}")
async def download_report(interview_id: int, db: AsyncSession = Depends(get_db)):
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import A4

    record = await db.get(Interview, interview_id)
    if not record:
        raise HTTPException(status_code=404, detail="Interview not found")

    tmp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    pdf_path = tmp_file.name
    tmp_file.close()

    c = canvas.Canvas(pdf_path, pagesize=A4)
    width, height = A4
    y = height - 50

    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, y, "SkillBridge Mock Interview Report")
    y -= 30
    c.setFont("Helvetica", 12)
    c.drawString(50, y, f"Domain: {record.domain}")
    y -= 20
    c.drawString(50, y, f"Date: {record.created_at}")
    y -= 30

    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y, "Question:")
    y -= 20
    c.setFont("Helvetica", 12)
    for line in str(record.question).splitlines():
        c.drawString(60, y, line)
        y -= 16

    y -= 10
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y, "Response:")
    y -= 20
    c.setFont("Helvetica", 12)
    for line in str(record.response).splitlines():
        c.drawString(60, y, line)
        y -= 16

    y -= 10
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y, "Feedback:")
    y -= 20

    def draw_dict(d, indent=60):
        nonlocal y
        for k, v in d.items():
            if y < 80:
                c.showPage()
                y = height - 50
            if isinstance(v, dict):
                c.drawString(indent, y, f"{k}:")
                y -= 14
                draw_dict(v, indent + 12)
            else:
                c.drawString(indent, y, f"{k}: {str(v)}")
                y -= 14

    draw_dict(record.feedback)
    c.save()

    return FileResponse(pdf_path, media_type="application/pdf", filename=f"Interview_{interview_id}.pdf")
