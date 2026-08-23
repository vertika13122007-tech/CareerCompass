import json
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.User import User
from app.models.Resume import Resume
from app.services.ai.gemini_service import GeminiService
from app.services.ai.local_ml import LocalMLService


class MatchJobRequest(BaseModel):
    job_description: str
    required_skills: list[str] = []


class CoverLetterRequest(BaseModel):
    job_description: str
    company_name: str | None = None
    job_title: str | None = None
    tone: str = "professional"


class SkillGapRequest(BaseModel):
    job_description: str
    required_skills: list[str] = []


class ChatMessageRequest(BaseModel):
    message: str
    history: list[dict] = []  # e.g., [{"role": "user", "text": "hi"}, {"role": "model", "text": "hello"}]


class OptimizeBulletRequest(BaseModel):
    bullet_point: str
    target_role: str = ""


class OptimizeRequest(BaseModel):
    job_description: str


class RoadmapRequest(BaseModel):
    target_role: str
    timeframe: str


router = APIRouter(prefix="/ai", tags=["AI Engine"])


@router.post("/match-job")
def match_job(
    request: MatchJobRequest,
    logged_in_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Calculates ATS score (semantic & keyword matching) between an authenticated user's resume and a job description.
    """
    from app.main import ml_models

    resume = db.query(Resume).filter(Resume.user_id == logged_in_user.id).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No resume found. Please upload a resume first."
        )

    local_ml: LocalMLService = ml_models.get("local_ml") if ml_models else None
    if not local_ml:
        local_ml = LocalMLService()

    resume_text = resume.extracted_text or ""
    if not resume_text and isinstance(resume.parsed_resume, dict):
        resume_text = str(resume.parsed_resume)

    resume_skills = []
    if isinstance(resume.parsed_resume, dict):
        extracted_skills = (
            resume.parsed_resume.get("skills")
            or resume.parsed_resume.get("technical_skills")
            or []
        )
        if isinstance(extracted_skills, list):
            resume_skills = [str(s) for s in extracted_skills]

    scores = local_ml.get_ats_score(
        resume_text=resume_text,
        resume_skills=resume_skills,
        job_description=request.job_description,
        required_skills=request.required_skills,
    )

    return scores


@router.post("/cover-letter")
@router.post("/generate-cover-letter")
def generate_cover_letter(
    request: CoverLetterRequest,
    db: Session = Depends(get_db)
):
    """
    Generates a personalized cover letter based on the newest parsed resume and job description.
    """
    resume = db.query(Resume).order_by(Resume.id.desc()).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No resume found. Please upload a resume first."
        )

    parsed_data = resume.parsed_resume or resume.extracted_text or {}

    gemini_service = GeminiService()
    cover_letter = gemini_service.generate_cover_letter(
        resume_json=parsed_data,
        job_description=request.job_description,
        company_name=request.company_name,
        job_title=request.job_title,
        tone=request.tone,
    )

    return {"cover_letter": cover_letter}


@router.post("/analyze-gap")
def analyze_gap(
    request: SkillGapRequest,
    logged_in_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Calculates ATS score and performs AI skill gap analysis (missing skills, matching strengths, improvement suggestions).
    """
    from app.main import ml_models

    resume = db.query(Resume).filter(Resume.user_id == logged_in_user.id).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No resume found. Please upload a resume first."
        )

    local_ml: LocalMLService = ml_models.get("local_ml") if ml_models else None
    if not local_ml:
        local_ml = LocalMLService()

    resume_text = resume.extracted_text or ""
    if not resume_text and isinstance(resume.parsed_resume, dict):
        resume_text = str(resume.parsed_resume)

    resume_skills = []
    if isinstance(resume.parsed_resume, dict):
        extracted_skills = (
            resume.parsed_resume.get("skills")
            or resume.parsed_resume.get("technical_skills")
            or []
        )
        if isinstance(extracted_skills, list):
            resume_skills = [str(s) for s in extracted_skills]

    scores = local_ml.get_ats_score(
        resume_text=resume_text,
        resume_skills=resume_skills,
        job_description=request.job_description,
        required_skills=request.required_skills,
    )

    parsed_data = resume.parsed_resume or resume.extracted_text or {}

    gemini_service = GeminiService()
    analysis = gemini_service.analyze_skill_gap(
        resume_json=parsed_data,
        job_description=request.job_description,
        ats_scores=scores,
    )

    return {
        "scores": scores,
        "analysis": analysis
    }


@router.post("/chat")
def chat(
    request: ChatMessageRequest,
    db: Session = Depends(get_db)
):
    """
    Interactive Career Coach AI chatbot endpoint that maintains chat history and candidate resume context.
    """
    
    resume = db.query(Resume).order_by(Resume.id.desc()).first()
    
    if not resume:
        print("🚨 DATABASE CHECK: NO RESUME FOUND AT ALL!")
        parsed_data = {}
    else:
        print(f"✅ DATABASE CHECK: RESUME FOUND! (Resume ID: {resume.id})")
        
        raw_data = resume.parsed_resume or resume.extracted_text
        
        if isinstance(raw_data, str):
            try:
                parsed_data = json.loads(raw_data)
            except Exception:
                parsed_data = {"text": raw_data}
        else:
            parsed_data = raw_data or {}
            
        print(f"🧠 DATA PASSED TO KIKI: {str(parsed_data)[:150]}...") # Print the first 150 characters to terminal

    gemini_service = GeminiService()
    reply = gemini_service.send_chat_message(
        resume_json=parsed_data,
        message=request.message,
        history=request.history, 
    )

    return {"reply": reply}


@router.post("/optimize-bullet")
def optimize_bullet(request: OptimizeBulletRequest):
    """
    Optimizes a weak resume bullet point into 3 STAR-method versions with explanations.
    """
    gemini_service = GeminiService()
    return gemini_service.optimize_bullet(
        original_bullet=request.bullet_point,
        target_role=request.target_role,
    )


@router.post("/roadmap")
def roadmap(
    request: RoadmapRequest,
    db: Session = Depends(get_db)
):
    """
    Generates a structured learning roadmap based on the newest resume and target role.
    """
    resume = db.query(Resume).order_by(Resume.id.desc()).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No resume found. Please upload a resume first."
        )

    parsed_data = resume.parsed_resume or resume.extracted_text or {}

    gemini_service = GeminiService()
    return gemini_service.generate_roadmap(
        resume_json=parsed_data,
        target_role=request.target_role,
        timeframe=request.timeframe,
    )


@router.post("/optimize")
def optimize_resume(request: OptimizeRequest, db: Session = Depends(get_db)):
    resume = db.query(Resume).order_by(Resume.id.desc()).first()
    if not resume:
        raise HTTPException(status_code=404, detail="No resume found")
    
    raw_data = resume.parsed_resume or resume.extracted_text
    resume_data = json.loads(raw_data) if isinstance(raw_data, str) else (raw_data or {})
    
    gemini_service = GeminiService()
    result = gemini_service.optimize_resume(resume_data, request.job_description)
    return result


@router.post("/tailor")
def tailor_resume(request: OptimizeRequest, db: Session = Depends(get_db)):
    resume = db.query(Resume).order_by(Resume.id.desc()).first()
    raw_data = resume.parsed_resume or resume.extracted_text if resume else {}
    resume_data = json.loads(raw_data) if isinstance(raw_data, str) else (raw_data or {})
    
    gemini_service = GeminiService()
    result = gemini_service.tailor_resume(resume_data, request.job_description)
    return result

