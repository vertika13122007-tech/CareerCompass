import json
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.User import User
from app.models.Resume import Resume
from app.models.DocumentHistory import DocumentHistory
from app.models.ChatSession import ChatSession
from app.services.ai.gemini_service import GeminiService
from app.services.ai.local_ml import LocalMLService
from app.services.resume_service import upload_resume_service


class SaveDocumentRequest(BaseModel):
    document_type: str
    job_title: str | None = "Untitled Role"
    content: str | list | dict


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
    session_id: int | None = None
    history: list[dict] = []  # e.g., [{"role": "user", "text": "hi"}, {"role": "model", "text": "hello"}]


class CreateChatSessionRequest(BaseModel):
    title: str | None = "New Chat"


class RenameChatSessionRequest(BaseModel):
    title: str


class UpdateResumeRequest(BaseModel):
    parsed_data: dict | list | str | None = None
    resume: dict | list | str | None = None


class OptimizeBulletRequest(BaseModel):
    bullet_point: str
    target_role: str = ""


class OptimizeRequest(BaseModel):
    job_description: str


class RoadmapRequest(BaseModel):
    target_role: str
    timeframe: str


class TargetRoleRequest(BaseModel):
    target_role: str


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

    try:
        doc = DocumentHistory(
            document_type="Cover Letter",
            job_title=request.job_title or "Untitled Role",
            content=cover_letter
        )
        db.add(doc)
        db.commit()
    except Exception as e:
        print(f"Failed to save cover letter to DocumentHistory: {e}")
        db.rollback()

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


@router.get("/coach/sessions")
@router.get("/sessions")
def get_chat_sessions(db: Session = Depends(get_db)):
    """
    Returns all ChatSession records ordered by updated_at descending.
    """
    sessions = db.query(ChatSession).order_by(ChatSession.updated_at.desc()).all()
    return sessions


@router.post("/coach/sessions")
@router.post("/sessions")
def create_chat_session(
    request: CreateChatSessionRequest | None = None,
    db: Session = Depends(get_db)
):
    """
    Creates a new ChatSession with a blank messages array and returns it.
    """
    title = request.title if request and request.title else "New Chat"
    new_session = ChatSession(
        title=title,
        messages=[]
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return new_session


@router.delete("/coach/sessions/{session_id}")
@router.delete("/sessions/{session_id}")
def delete_chat_session(
    session_id: int,
    db: Session = Depends(get_db)
):
    """
    Deletes a specific chat session.
    """
    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found"
        )

    db.delete(session)
    db.commit()
    return {"message": "Chat session deleted successfully", "id": session_id}


@router.patch("/coach/sessions/{session_id}")
@router.patch("/sessions/{session_id}")
def rename_chat_session(
    session_id: int,
    request: RenameChatSessionRequest,
    db: Session = Depends(get_db)
):
    """
    Renames a specific chat session.
    """
    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found"
        )

    session.title = request.title
    db.commit()
    db.refresh(session)
    return {
        "message": "Chat session renamed successfully",
        "id": session.id,
        "title": session.title,
        "session": session
    }


def _get_active_resume(db: Session) -> Resume | None:
    return (
        db.query(Resume)
        .filter(Resume.is_active == True)
        .order_by(Resume.id.desc())
        .first()
        or db.query(Resume)
        .order_by(Resume.id.desc())
        .first()
    )


@router.post("/upload")
@router.post("/upload-resume")
async def upload_resume_ai(
    file: UploadFile = File(...),
    resume_name: str = Form("Untitled Resume"),
    db: Session = Depends(get_db)
):
    """
    Uploads a new resume with a custom name, sets all other resumes to is_active=False,
    and activates the newly uploaded resume.
    """
    user = db.query(User).first()
    if not user:
        user = User(name="Default User", email="user@example.com", hashed_password="hashed_password")
        db.add(user)
        db.commit()
        db.refresh(user)

    return upload_resume_service(
        file=file,
        logged_in_user=user,
        db=db,
        resume_name=resume_name
    )


@router.post("/chat")
@router.post("/coach/chat")
def chat_with_coach(
    request: ChatMessageRequest,
    db: Session = Depends(get_db)
):
    """
    Interactive Career Coach AI chatbot endpoint that maintains chat history and candidate resume context.
    """
    session = None
    history = request.history

    if request.session_id is not None:
        session = db.query(ChatSession).filter(ChatSession.id == request.session_id).first()
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Chat session with id {request.session_id} not found."
            )
        history = session.messages or []

    # 1. Fetch the user's active resume
    resume = _get_active_resume(db)

    # 2. Extract context
    user_context = "No resume data available yet."
    if resume:
        raw_data = resume.parsed_resume or resume.extracted_text
        user_context = raw_data if isinstance(raw_data, str) else json.dumps(raw_data)

    # 3. Create a powerful system instruction
    system_instruction = f"""
    You are Kiki, an expert career coach. 
    Always tailor your advice based on the user's current background.
    Here is their current resume data: {user_context}
    """

    # 4. Pass the system instruction and chat history to Gemini service
    gemini_service = GeminiService()
    response_text = gemini_service.get_chat_response(
        message=request.message,
        history=history,
        system_instruction=system_instruction
    )

    if session:
        # Append user message and model response to session messages
        current_messages = list(session.messages or [])
        current_messages.append({"role": "user", "text": request.message})
        current_messages.append({"role": "model", "text": response_text})
        session.messages = current_messages

        # Update title snippet if still "New Chat"
        if not session.title or session.title == "New Chat":
            clean_msg = request.message.strip()
            snippet = (clean_msg[:30] + "...") if len(clean_msg) > 30 else clean_msg
            session.title = snippet or "New Chat"

        db.commit()
        db.refresh(session)

    return {
        "response": response_text,
        "reply": response_text,
        "session_id": session.id if session else None,
        "session": session
    }


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
    resume = _get_active_resume(db)
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
    resume = _get_active_resume(db)
    if not resume:
        raise HTTPException(status_code=404, detail="No resume found")
    
    raw_data = resume.parsed_resume or resume.extracted_text
    resume_data = json.loads(raw_data) if isinstance(raw_data, str) else (raw_data or {})
    
    gemini_service = GeminiService()
    result = gemini_service.optimize_resume(resume_data, request.job_description)
    return result


@router.post("/tailor")
def tailor_resume(request: OptimizeRequest, db: Session = Depends(get_db)):
    resume = _get_active_resume(db)
    raw_data = resume.parsed_resume or resume.extracted_text if resume else {}
    resume_data = json.loads(raw_data) if isinstance(raw_data, str) else (raw_data or {})
    
    gemini_service = GeminiService()
    result = gemini_service.tailor_resume(resume_data, request.job_description)
    return result


@router.get("/current-resume")
def get_current_resume(db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.is_active == True).order_by(Resume.id.desc()).first()
    if not resume:
        resume = db.query(Resume).order_by(Resume.id.desc()).first()
    if not resume:
        raise HTTPException(status_code=404, detail="No resume found")
    
    raw_data = resume.parsed_resume or resume.extracted_text
    resume_data = json.loads(raw_data) if isinstance(raw_data, str) else (raw_data or {})
    return {
        "resume": resume_data,
        "resume_name": resume.resume_name or "Untitled Resume",
        "is_active": resume.is_active if resume.is_active is not None else True,
        "id": resume.id
    }


@router.patch("/current-resume")
def update_current_resume(
    request: UpdateResumeRequest,
    db: Session = Depends(get_db)
):
    """
    Updates the current parsed resume data in the database.
    """
    resume = db.query(Resume).filter(Resume.is_active == True).order_by(Resume.id.desc()).first()
    if not resume:
        resume = db.query(Resume).order_by(Resume.id.desc()).first()
    if not resume:
        raise HTTPException(status_code=404, detail="No resume found to update")

    data = request.parsed_data if request.parsed_data is not None else request.resume
    if data is None:
        raise HTTPException(status_code=400, detail="Missing parsed_data or resume in request body")

    resume.parsed_resume = data
    db.commit()
    db.refresh(resume)

    return {
        "message": "Resume updated successfully",
        "resume": resume.parsed_resume,
        "resume_name": resume.resume_name,
        "is_active": resume.is_active
    }


@router.post("/save-document")
def save_document(request: SaveDocumentRequest, db: Session = Depends(get_db)):
    content_str = json.dumps(request.content) if isinstance(request.content, (dict, list)) else str(request.content)
    doc = DocumentHistory(
        document_type=request.document_type,
        job_title=request.job_title or "Untitled Role",
        content=content_str
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return {"message": "Document saved successfully", "id": doc.id}


@router.get("/history")
def get_history(db: Session = Depends(get_db)):
    records = db.query(DocumentHistory).order_by(DocumentHistory.created_at.desc()).all()
    results = []
    for rec in records:
        try:
            parsed_content = json.loads(rec.content)
        except Exception:
            parsed_content = rec.content
        results.append({
            "id": rec.id,
            "document_type": rec.document_type,
            "job_title": rec.job_title,
            "content": parsed_content,
            "created_at": rec.created_at
        })
    return {"history": results}


@router.get("/ats-score")
def get_ats_score(
    db: Session = Depends(get_db)
):
    """
    Grades the currently active resume using Gemini AI based on ATS readability, impact, and formatting.
    """
    resume = (
        db.query(Resume)
        .filter(Resume.is_active == True)
        .order_by(Resume.id.desc())
        .first()
    )
    if not resume:
        resume = db.query(Resume).order_by(Resume.id.desc()).first()

    if not resume:
        return {
            "score": 0,
            "status": "No active resume",
            "feedback": ["Please upload and activate a resume."]
        }

    gemini_service = GeminiService()
    resume_content = resume.parsed_resume or resume.extracted_text or {}
    return gemini_service.grade_resume_ats(resume_content)


@router.post("/target-match")
def target_match(
    request: TargetRoleRequest,
    db: Session = Depends(get_db)
):
    """
    Compares the active resume against a target role and returns matchScore and missingSkills.
    """
    resume = (
        db.query(Resume)
        .filter(Resume.is_active == True)
        .order_by(Resume.id.desc())
        .first()
    )
    if not resume:
        resume = db.query(Resume).order_by(Resume.id.desc()).first()

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active resume found. Please upload and activate a resume first."
        )

    gemini_service = GeminiService()
    resume_content = resume.parsed_resume or resume.extracted_text or {}
    return gemini_service.match_target_role(resume_content, request.target_role)



