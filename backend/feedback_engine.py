import os
import re
from typing import Dict, Any, Optional
from textblob import TextBlob

# sentence-transformers for semantic similarity
try:
    from sentence_transformers import SentenceTransformer, util as sbert_util
    SBERT = SentenceTransformer("all-MiniLM-L6-v2")
    print("✅ Loaded SentenceTransformer (all-MiniLM-L6-v2).")
except Exception as e:
    SBERT = None
    print("⚠️ SBERT not available:", e)

# Transformers sentiment fallback
try:
    from transformers import pipeline
    sentiment_pipeline = pipeline("sentiment-analysis")
    print("✅ Loaded sentiment pipeline.")
except Exception as e:
    sentiment_pipeline = None
    print("⚠️ Sentiment pipeline unavailable, falling back to TextBlob.", e)

FILLER_WORDS = set(["um", "uh", "like", "you know", "actually", "basically", "literally", "sort of", "kinda", "stuff", "hmm", "erm"])
SLANG_WORDS = set(["yeah", "gonna", "wanna", "gotta", "bro", "dude", "lol", "btw", "cuz", "ain't"])


def _count_words(text: str):
    return len([w for w in re.findall(r"\b\w+\b", text)])


def _detect_fillers(text: str):
    found = re.findall(r"\b(" + "|".join(re.escape(w) for w in FILLER_WORDS) + r")\b", text, flags=re.I)
    return [w.lower() for w in found]


def _detect_slang(text: str):
    found = re.findall(r"\b(" + "|".join(re.escape(w) for w in SLANG_WORDS) + r")\b", text, flags=re.I)
    return [w.lower() for w in found]


def semantic_similarity_score(candidate: str, reference: Optional[str]):
    if not reference:
        return None
    if not SBERT:
        cset = set(re.findall(r"\w+", candidate.lower()))
        rset = set(re.findall(r"\w+", reference.lower()))
        inter = len(cset & rset)
        union = max(1, len(rset))
        frac = inter / union
        return round(min(10, frac * 10), 1)
    try:
        emb1 = SBERT.encode(candidate, convert_to_tensor=True)
        emb2 = SBERT.encode(reference, convert_to_tensor=True)
        cos = sbert_util.cos_sim(emb1, emb2).item()
        score = max(0.0, (cos + 1) / 2 * 10)
        return round(min(10, score), 2)
    except Exception as e:
        print("Semantic scoring failed:", e)
        return None


def sentiment_analysis(text: str):
    if sentiment_pipeline:
        try:
            res = sentiment_pipeline(text)[0]
            label = res.get("label", "")
            base_score = res.get("score", 0.5)
            score = 8 if label.lower().startswith("pos") else 5 if label.lower().startswith("neu") else 3
            return {"label": label.capitalize(), "confidence": round(base_score, 3), "mapped_score": score}
        except Exception as e:
            print("Sentiment pipeline error:", e)
    blob = TextBlob(text)
    polarity = blob.sentiment.polarity
    label = "Positive" if polarity > 0.2 else "Negative" if polarity < -0.2 else "Neutral"
    mapped = 8 if polarity > 0.2 else 3 if polarity < -0.2 else 5
    return {"label": label, "polarity": round(polarity, 3), "mapped_score": mapped}


def compute_fluency_score(text: str):
    sentences = [s.strip() for s in re.split(r"[.!?]+", text) if s.strip()]
    avg_len = sum(len(s.split()) for s in sentences) / max(1, len(sentences))
    punctuation = len(re.findall(r"[,.!?;:]", text))
    score = (min(1, avg_len / 18) * 6) + (min(1, punctuation / 5) * 4)
    return round(min(10, max(0, score)), 1)


def compute_grammar_score(text: str):
    try:
        blob = TextBlob(text)
        corrected = str(blob.correct())
        diff_chars = sum(1 for a, b in zip(text.lower(), corrected.lower()) if a != b)
        norm = diff_chars / max(1, len(text))
        score = max(0, 10 - norm * 50)
        return round(min(10, score), 1), corrected
    except Exception as e:
        print("Grammar check fallback:", e)
        return 7.5, text


def aggregate_scores(grammar, fluency, confidence_score, sentiment_mapped, filler_count, semantic_score=None):
    weights = {"grammar": 0.25, "fluency": 0.2, "confidence": 0.2, "sentiment": 0.15, "filler": 0.1, "semantic": 0.1}
    filler_pen = max(0, 10 - filler_count * 1.5)
    base = (grammar * weights["grammar"] +
            fluency * weights["fluency"] +
            confidence_score * weights["confidence"] +
            sentiment_mapped * weights["sentiment"] +
            filler_pen * weights["filler"])
    if semantic_score is not None:
        base = base * (1 - weights["semantic"]) + semantic_score * weights["semantic"]
    return round(min(10, max(0, base)), 2)


def generate_tips(feedback: Dict[str, Any]):
    tips = []
    if feedback["grammar"]["score"] < 7:
        tips.append("Work on grammar — read answers out loud and use short sentences.")
    if feedback["fluency_score"] < 6:
        tips.append("Practice speaking in full sentences and avoid long pauses.")
    if feedback["filler_word_count"] > 2:
        tips.append("Reduce filler words like 'um' and 'like' — try pausing instead.")
    if feedback["confidence_score"] < 6:
        tips.append("Add a short example or personal story to show confidence.")
    if feedback.get("semantic_score") is not None and feedback["semantic_score"] < 6:
        tips.append("Include key domain points. Compare your answer to model points.")
    if not tips:
        tips.append("Nice work — minor refinements can take you further.")
    return tips


def analyze_response(text: str, audio_meta: Optional[dict] = None, reference_answer: Optional[str] = None) -> Dict[str, Any]:
    if not text or not text.strip():
        return {"error": "No valid response detected.", "suggestion": "Try speaking louder or type your answer."}

    sentiment = sentiment_analysis(text)
    fillers = _detect_fillers(text)
    slang = _detect_slang(text)
    grammar_score, corrected_text = compute_grammar_score(text)
    fluency_score = compute_fluency_score(text)
    words = _count_words(text)

    if audio_meta and audio_meta.get("duration"):
        wpm = words / (audio_meta["duration"] / 60.0)
    else:
        wpm = words / 0.5 if words else 0

    confidence_score = 10 if wpm > 120 else 8 if wpm > 90 else 6 if wpm > 60 else 4 if wpm > 30 else 2

    tone = {}
    if audio_meta:
        avg_pitch = audio_meta.get("avg_pitch")
        pitch_var = audio_meta.get("pitch_var")
        rms = audio_meta.get("rms")
        nervous = (pitch_var is not None and pitch_var > 50) or (wpm < 40 and rms < 0.01)
        calm = (pitch_var is not None and pitch_var < 30 and rms > 0.01 and wpm > 60)
        tone["nervous_score"] = 8 if nervous else 3 if calm else 5
        tone["avg_pitch"] = avg_pitch
        tone["pitch_var"] = pitch_var
        tone["rms"] = rms

    semantic_score = semantic_similarity_score(text, reference_answer)
    overall = aggregate_scores(grammar_score, fluency_score, confidence_score, sentiment.get("mapped_score", 5), len(fillers), semantic_score)

    feedback = {
        "text_analyzed": text,
        "grammar": {"score": grammar_score, "suggested_text": corrected_text},
        "fluency_score": fluency_score,
        "filler_word_count": len(fillers),
        "filler_words": list(set(fillers)),
        "professionalism_warning": ", ".join(set(slang)) if slang else None,
        "confidence_score": confidence_score,
        "sentiment": sentiment,
        "semantic_score": semantic_score,
        "voice_tone": tone,
        "overall_performance": overall,
    }

    feedback["improvement_tips"] = generate_tips(feedback)
    return feedback
