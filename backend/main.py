# main.py

import os
import json
import random
import secrets
# import datetime
from datetime import datetime, timedelta

import traceback
import tempfile
from pathlib import Path
from typing import Optional, List
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from fastapi import BackgroundTasks, FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select, func
from dotenv import load_dotenv
from pydantic import BaseModel

from db_models import Base, PasswordResetToken, User, Interview, UserProgress
from schemas import (
    UserCreate, UserLogin, TokenResponse, UserResponse,
    InterviewResponse, UserDashboardResponse, InterviewHistoryResponse,
    DomainProgressResponse, ForgotPasswordRequest, ResetPasswordRequest
)
from auth import (
    hash_password, verify_password, create_access_token,
    get_current_user, get_optional_user, get_db_dependency as auth_get_db_dependency
)
from interview_logic import reduce_noise
from feedback_engine import analyze_response

from utils.email_utils import send_reset_email

from fastapi import BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from db_models import User, PasswordResetToken
from utils.email_utils import send_reset_email  # your email sending function



# =================== ENVIRONMENT SETUP ===================
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL not found in .env")

WHISPER_MODEL_NAME = os.getenv("WHISPER_MODEL", "base")

# =================== EMAIL CONFIG ===================
EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", 587))
EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")

# Frontend URL used to construct reset link (put in .env)
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
DEBUG = os.getenv("DEBUG", "false").lower() == "true"

# =================== DATABASE SETUP ===================
engine = create_async_engine(DATABASE_URL, echo=False, future=True)
AsyncSessionLocal = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


# CRITICAL FIX: Initialize auth dependency
def initialize_auth_dependency():
    """Initialize the auth module's database dependency"""
    auth_get_db_dependency.set_dependency(get_db)
    print("✅ Auth database dependency initialized")

initialize_auth_dependency()


# =================== WHISPER MODEL ===================
try:
    import whisper
    model = whisper.load_model(WHISPER_MODEL_NAME)
    WHISPER_AVAILABLE = True
    print(f"✅ Loaded Whisper model: {WHISPER_MODEL_NAME}")
except Exception as e:
    model = None
    WHISPER_AVAILABLE = False
    print("⚠️ Whisper not available:", e)

# =================== PATHS ===================
BASE_DIR = Path(__file__).resolve().parent
QUESTIONS_PATH = BASE_DIR / "models" / "questions.json"
RECORDINGS_DIR = BASE_DIR / "recordings"
RECORDINGS_DIR.mkdir(exist_ok=True)

# =================== FASTAPI APP ===================
app = FastAPI(
    title="SkillBridge Mock Interview API",
    version="1.0.0",
    description="AI-powered mock interview platform with real-time feedback",
    docs_url="/",
    redoc_url=None,
    swagger_ui_parameters={"persistAuthorization": True},
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =================== SWAGGER AUTH SETUP ===================
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    
    from fastapi.openapi.utils import get_openapi
    
    openapi_schema = get_openapi(
        title="SkillBridge Mock Interview API",
        version="1.0.0",
        description="AI-powered mock interview platform with real-time feedback",
        routes=app.routes,
    )
    
    openapi_schema["components"]["securitySchemes"] = {
        "HTTPBearer": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
    }
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

# =================== HELPERS ===================
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


async def update_user_progress(db: AsyncSession, user_id: int, domain: str, feedback: dict):
    """Update user progress after each interview"""
    result = await db.execute(
        select(UserProgress).where(
            UserProgress.user_id == user_id,
            UserProgress.domain == domain
        )
    )
    progress = result.scalar_one_or_none()

    clarity = feedback.get("clarity_score", 0) or feedback.get("fluency_score", 0)
    confidence = feedback.get("confidence_score", 0)
    grammar_data = feedback.get("grammar", {})
    grammar = grammar_data.get("score", 0) if isinstance(grammar_data, dict) else 0
    overall = feedback.get("overall_performance", 0)

    if progress:
        total = progress.total_sessions
        progress.total_sessions += 1
        progress.avg_clarity_score = ((progress.avg_clarity_score * total) + clarity) / (total + 1)
        progress.avg_confidence_score = ((progress.avg_confidence_score * total) + confidence) / (total + 1)
        progress.avg_grammar_score = ((progress.avg_grammar_score * total) + grammar) / (total + 1)
        progress.avg_overall_score = ((progress.avg_overall_score * total) + overall) / (total + 1)
        progress.last_practice_date = datetime.datetime.utcnow()
    else:
        progress = UserProgress(
            user_id=user_id,
            domain=domain,
            total_sessions=1,
            avg_clarity_score=clarity,
            avg_confidence_score=confidence,
            avg_grammar_score=grammar,
            avg_overall_score=overall,
            last_practice_date=datetime.datetime.utcnow(),
        )
        db.add(progress)

    await db.commit()





# # =================== PASSWORD RESET STORAGE ===================
# password_reset_tokens = {}

# =================== AUTH ROUTES ===================

@app.post("/auth/signup", response_model=TokenResponse)
async def signup(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    """Register new user"""
    result = await db.execute(select(User).where(User.email == user_data.email))
    existing_user = result.scalar_one_or_none()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        role="user",
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    token = create_access_token({"user_id": new_user.id, "email": new_user.email})
    return TokenResponse(access_token=token, user=UserResponse.model_validate(new_user))


@app.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    """Login user"""
    result = await db.execute(select(User).where(User.email == credentials.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"user_id": user.id, "email": user.email})
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


@app.get("/auth/me", response_model=UserResponse)
async def get_me(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get current user info"""
    return UserResponse.model_validate(current_user)


# =================== PASSWORD RESET ROUTES (DB-backend) ===================

@app.post("/auth/forgot-password")
async def forgot_password(
    request: ForgotPasswordRequest,
    background_tasks: BackgroundTasks, 
    db: AsyncSession = Depends(get_db)
):
    """
    Request password reset.
    - Creates a DB-backed reset token (expires in 1 hour)
    - In DEBUG mode: Prints link to console and returns it in response
    - In PRODUCTION mode: Sends email via BackgroundTasks
    """
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()
    
    # IMPORTANT: Always return success message (security best practice)
    # Don't reveal if email exists or not

    if not user:
        return {
            "message": "If the email exists, a reset link will be sent",
            "debug_info": "User not found" if DEBUG else None
        }
    
    # Generate secure token
    reset_token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=1)

    # Save token to database
    token_entry = PasswordResetToken(
        user_id=user.id, 
        token=reset_token, 
        expires_at=expires_at
    )
    db.add(token_entry)
    await db.commit()
    await db.refresh(token_entry)

    # Construct frontend reset link
    reset_link = f"{FRONTEND_URL}/reset-password?token={reset_token}"

    # Schedule email sending in background
    # Handle DEBUG vs PRODUCTION mode
    if DEBUG:
        # Development mode - print to console
        print("\n" + "="*80)
        print("🔐 PASSWORD RESET REQUEST (DEBUG MODE)")
        print("="*80)
        print(f"📧 Email: {user.email}")
        print(f"🔗 Reset Link: {reset_link}")
        print(f"🎟️  Token: {reset_token}")
        print(f"⏰ Expires: {expires_at.strftime('%Y-%m-%d %H:%M:%S UTC')}")
        print("="*80 + "\n")
        
        return {
            "message": "If the email exists, a reset link will be sent",
            "debug_mode": True,
            "dev_token": reset_token,
            "reset_link": reset_link,
            "expires_in": "1 hour"
        }
    else:
        # Production mode - send email in background
        background_tasks.add_task(send_reset_email, user.email, reset_link)
        
        return {
            "message": "If the email exists, a reset link will be sent",
            "debug_mode": False
        }


@app.post("/auth/reset-password")
async def reset_password(
    request: ResetPasswordRequest, 
    db: AsyncSession = Depends(get_db)
):
    """
    Reset password using token.
    - Validates token from database
    - Updates user's password
    - Deletes used token
    """
    # Find token in database
    result = await db.execute(
        select(PasswordResetToken).where(PasswordResetToken.token == request.token)
    )
    token_entry = result.scalar_one_or_none()

    if not token_entry:
        raise HTTPException(
            status_code=400, 
            detail="Invalid or expired reset token"
        )

    # Check if token expired
    if datetime.utcnow() > token_entry.expires_at:
        # Delete expired token
        await db.delete(token_entry)
        await db.commit()
        raise HTTPException(
            status_code=400, 
            detail="Reset token has expired. Please request a new one."
        )

    # Fetch user
    result = await db.execute(
        select(User).where(User.id == token_entry.user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=404, 
            detail="User not found"
        )
    
    # Update password
    user.password_hash = hash_password(request.new_password)
    user.updated_at = datetime.utcnow()
    
    # Delete used token (one-time use)
    await db.delete(token_entry)
    
    # Commit changes
    await db.commit()
    
    print(f"✅ Password reset successful for: {user.email}")
    
    return {
        "message": "Password reset successful",
        "email": user.email
    }



@app.get("/auth/verify-reset-token/{token}")
async def verify_reset_token(
    token: str, 
    db: AsyncSession = Depends(get_db)
):
    """
    Verify if reset token is valid (used by frontend before showing reset form).
    Returns user email if valid.
    """
    result = await db.execute(
        select(PasswordResetToken).where(PasswordResetToken.token == token)
    )
    token_entry = result.scalar_one_or_none()
    
    if not token_entry:
        raise HTTPException(
            status_code=400, 
            detail="Invalid or expired token"
        )

    # Check expiration
    if datetime.utcnow() > token_entry.expires_at:
        # Delete expired token
        await db.delete(token_entry)
        await db.commit()
        raise HTTPException(
            status_code=400, 
            detail="Token has expired. Please request a new reset link."
        )

    # Fetch user email
    result = await db.execute(
        select(User.email).where(User.id == token_entry.user_id)
    )
    user_email = result.scalar_one_or_none()
    
    if not user_email:
        raise HTTPException(
            status_code=404, 
            detail="User not found"
        )

    return {
        "valid": True,
        "email": user_email,
        "expires_at": token_entry.expires_at.isoformat()
    }


# =================== INTERVIEW ROUTES ===================

class QuestionResponse(BaseModel):
    question: str
    reference: Optional[str] = None


@app.get("/domains", response_model=List[str])
async def get_domains():
    data = load_questions()
    return list(data.keys())


@app.get("/question/{domain}", response_model=QuestionResponse)
async def get_question(domain: str):
    data = load_questions()
    qlist = data.get(domain)
    if not qlist:
        raise HTTPException(status_code=404, detail=f"No questions found for {domain}")
    chosen = random.choice(qlist)
    return QuestionResponse(question=chosen.get("q"), reference=chosen.get("a"))


@app.post("/interview/{domain}")
async def submit_interview(
    domain: str,
    audio_file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    try:
        data = load_questions()
        if domain not in data:
            raise HTTPException(status_code=404, detail=f"Unknown domain '{domain}'")

        question_item = random.choice(data[domain])
        question_text = question_item.get("q")
        reference = question_item.get("a")

        wav_path = RECORDINGS_DIR / f"{datetime.utcnow().timestamp()}_{audio_file.filename}"
        with open(wav_path, "wb") as f:
            f.write(await audio_file.read())

        reduce_noise(wav_path)

        transcript = ""
        if WHISPER_AVAILABLE:
            try:
                result = model.transcribe(str(wav_path))
                transcript = result.get("text", "").strip()
            except Exception as e:
                print("Whisper failed:", e)
        else:
            transcript = "(Transcription unavailable - Whisper not loaded)"

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

        feedback = analyze_response(transcript, audio_meta=audio_meta, reference_answer=reference)

        new_entry = Interview(
            user_id=current_user.id if current_user else None,
            domain=domain,
            question=question_text,
            response=transcript,
            feedback=feedback,
            audio_path=str(wav_path),
        )
        db.add(new_entry)
        await db.commit()
        await db.refresh(new_entry)

        if current_user:
            await update_user_progress(db, current_user.id, domain, feedback)

        return {
            "status": "success",
            "message": "Interview analyzed successfully",
            "id": new_entry.id,
            "feedback": feedback,
        }

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# (Continued - PDF generation and dashboard routes remain the same as before...)

@app.get("/download_report/{interview_id}")
async def download_report(interview_id: int, db: AsyncSession = Depends(get_db)):
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import inch
    from reportlab.lib import colors
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.enums import TA_CENTER

    record = await db.get(Interview, interview_id)
    if not record:
        raise HTTPException(status_code=404, detail="Interview not found")

    tmp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    pdf_path = tmp_file.name
    tmp_file.close()

    doc = SimpleDocTemplate(pdf_path, pagesize=A4,
                           leftMargin=0.75*inch, rightMargin=0.75*inch,
                           topMargin=0.75*inch, bottomMargin=0.75*inch)
    
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'CustomTitle', parent=styles['Heading1'], fontSize=24,
        textColor=colors.HexColor('#6366f1'), spaceAfter=30,
        alignment=TA_CENTER, fontName='Helvetica-Bold'
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading', parent=styles['Heading2'], fontSize=14,
        textColor=colors.HexColor('#1f2937'), spaceAfter=12,
        spaceBefore=20, fontName='Helvetica-Bold'
    )
    
    normal_style = ParagraphStyle(
        'CustomNormal', parent=styles['Normal'], fontSize=11,
        textColor=colors.HexColor('#374151'), spaceAfter=12, fontName='Helvetica'
    )
    
    story = []
    story.append(Paragraph("SkillBridge Mock Interview Report", title_style))
    story.append(Spacer(1, 0.2*inch))
    
    metadata = [
        ['Domain:', str(record.domain)],
        ['Date:', str(record.created_at.strftime('%Y-%m-%d %H:%M:%S'))],
        ['Interview ID:', str(record.id)]
    ]
    
    metadata_table = Table(metadata, colWidths=[1.5*inch, 4*inch])
    metadata_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#374151')),
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f3f4f6')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(metadata_table)
    story.append(Spacer(1, 0.3*inch))
    
    story.append(Paragraph("Question", heading_style))
    question_text = str(record.question).replace('<', '&lt;').replace('>', '&gt;')
    story.append(Paragraph(question_text, normal_style))
    story.append(Spacer(1, 0.2*inch))
    
    story.append(Paragraph("Your Response", heading_style))
    response_text = str(record.response).replace('<', '&lt;').replace('>', '&gt;')
    story.append(Paragraph(response_text, normal_style))
    story.append(Spacer(1, 0.2*inch))
    
    story.append(Paragraph("Performance Scores", heading_style))
    
    feedback = record.feedback
    scores_data = [['Metric', 'Score']]
    
    if 'fluency_score' in feedback:
        scores_data.append(['Fluency', f"{feedback['fluency_score']:.1f}/10"])
    if 'clarity_score' in feedback:
        scores_data.append(['Clarity', f"{feedback['clarity_score']:.1f}/10"])
    if 'confidence_score' in feedback:
        scores_data.append(['Confidence', f"{feedback['confidence_score']:.1f}/10"])
    if 'pacing_score' in feedback:
        scores_data.append(['Pacing', f"{feedback['pacing_score']:.1f}/10"])
    
    if 'grammar' in feedback and isinstance(feedback['grammar'], dict):
        grammar = feedback['grammar']
        if 'score' in grammar:
            scores_data.append(['Grammar', f"{grammar['score']:.1f}/10"])
    
    if len(scores_data) > 1:
        scores_table = Table(scores_data, colWidths=[2.5*inch, 1.5*inch])
        scores_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#6366f1')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'CENTER'),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 11),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e5e7eb')),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        story.append(scores_table)
        story.append(Spacer(1, 0.2*inch))
    
    story.append(Paragraph("Additional Metrics", heading_style))
    
    metrics_data = []
    if 'filler_word_count' in feedback:
        metrics_data.append(['Filler Words', str(feedback['filler_word_count'])])
    if 'duration' in feedback and feedback['duration']:
        metrics_data.append(['Duration', f"{feedback['duration']:.1f} seconds"])
    if 'word_count' in feedback:
        metrics_data.append(['Word Count', str(feedback['word_count'])])
    if 'avg_pitch' in feedback and feedback['avg_pitch']:
        metrics_data.append(['Average Pitch', f"{feedback['avg_pitch']:.0f} Hz"])
    
    if metrics_data:
        metrics_table = Table(metrics_data, colWidths=[2.5*inch, 1.5*inch])
        metrics_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'CENTER'),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e5e7eb')),
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f9fafb')),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        story.append(metrics_table)
        story.append(Spacer(1, 0.2*inch))
    
    if 'overall_feedback' in feedback and feedback['overall_feedback']:
        story.append(Paragraph("Overall Feedback", heading_style))
        feedback_text = str(feedback['overall_feedback']).replace('<', '&lt;').replace('>', '&gt;')
        story.append(Paragraph(feedback_text, normal_style))
    
    doc.build(story)
    
    return FileResponse(pdf_path, media_type="application/pdf", filename=f"Interview_{interview_id}.pdf")

# =================== DASHBOARD ROUTES ===================

@app.get("/dashboard", response_model=UserDashboardResponse)
async def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """User dashboard"""
    total_result = await db.execute(select(func.count(Interview.id)).where(Interview.user_id == current_user.id))
    total_interviews = total_result.scalar()

    domains_result = await db.execute(select(func.count(func.distinct(Interview.domain))).where(Interview.user_id == current_user.id))
    domains_practiced = domains_result.scalar()

    progress_result = await db.execute(select(func.avg(UserProgress.avg_overall_score)).where(UserProgress.user_id == current_user.id))
    avg_overall_score = progress_result.scalar() or 0.0

    recent_result = await db.execute(
        select(Interview)
        .where(Interview.user_id == current_user.id)
        .order_by(Interview.created_at.desc())
        .limit(5)
    )
    recent_interviews = recent_result.scalars().all()

    progress_by_domain_result = await db.execute(select(UserProgress).where(UserProgress.user_id == current_user.id))
    progress_by_domain = progress_by_domain_result.scalars().all()

    return UserDashboardResponse(
        user=UserResponse.model_validate(current_user),
        total_interviews=total_interviews,
        domains_practiced=domains_practiced,
        avg_overall_score=round(avg_overall_score, 2),
        recent_interviews=[
            InterviewHistoryResponse(
                id=i.id,
                domain=i.domain,
                question=i.question,
                created_at=i.created_at,
                overall_score=i.feedback.get("overall_performance") if i.feedback else None,
            )
            for i in recent_interviews
        ],
        progress_by_domain=[DomainProgressResponse.model_validate(p) for p in progress_by_domain],
    )


@app.get("/history", response_model=List[InterviewResponse])
async def get_interview_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    limit: int = 10,
    offset: int = 0,
):
    """User interview history"""
    result = await db.execute(
        select(Interview)
        .where(Interview.user_id == current_user.id)
        .order_by(Interview.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    interviews = result.scalars().all()
    return [InterviewResponse.model_validate(i) for i in interviews]