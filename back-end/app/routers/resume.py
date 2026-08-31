from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session

from fastapi import HTTPException
from app.database import get_db
from app.models.User import User
from app.models.Resume import Resume
from app.dependencies.auth import get_current_user
from app.schemas.resume import ResumeResponse, ResumeDeleteResponse
from app.services.resume_service import (
    upload_resume_service,
    get_resume_service,
    delete_resume_service,
    _get_resume_by_user_id
)

router = APIRouter(
    prefix="/resume",
    tags=["Resume"],
)

from typing import Optional
from fastapi import Header

def _get_user_for_request(user_id: int, authorization: Optional[str], db: Session) -> User:
    if authorization and authorization.startswith("Bearer "):
        try:
            from app.utils.jwt import decode_access_token
            token = authorization.split(" ")[1]
            payload = decode_access_token(token)
            uid = int(payload.get("sub"))
            user = db.query(User).filter(User.id == uid).first()
            if user:
                return user
        except Exception:
            pass
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        user = db.query(User).first()
    if not user:
        user = User(name="Default User", email="user@example.com", hashed_password="hashed_password")
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    resume_name: str = Form("Untitled Resume"),
    user_id: int = 1,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    user = _get_user_for_request(user_id, authorization, db)
    return upload_resume_service(
        file=file,
        logged_in_user=user,
        db=db,
        resume_name=resume_name
    )


@router.get(
    "/",
    response_model=ResumeResponse
)
def get_resume(
    logged_in_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_resume_service(
        logged_in_user,
        db
    )
    

@router.delete(
    "/",
    response_model=ResumeDeleteResponse
)
def delete_resume(
    logged_in_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return delete_resume_service(
        logged_in_user,
        db
    )


@router.get("/latest")
def get_latest_resume(
    user_id: int = 1,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    user = _get_user_for_request(user_id, authorization, db)
    
    resume = _get_resume_by_user_id(user.id, db)
    if not resume:
        # Fallback to the latest resume in database for testing/development
        resume = db.query(Resume).order_by(Resume.created_at.desc()).first()

    if not resume:
        raise HTTPException(status_code=404, detail="No resume found")
        
    data = {}
    if resume.parsed_resume and isinstance(resume.parsed_resume, dict):
        data = dict(resume.parsed_resume)
    elif resume.parsed_resume:
        data = {"parsed": resume.parsed_resume}

    # Ensure contact_info and original_filename exist for frontend consumers
    if "contact_info" not in data or not data["contact_info"]:
        data["contact_info"] = {
            "name": user.name if user and user.name else "Candidate",
            "email": user.email if user and user.email else "candidate@example.com",
        }
    data["original_filename"] = resume.original_filename
    
    return data


@router.get("/all")
def get_all_resumes(
    user_id: int = 1,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    user = _get_user_for_request(user_id, authorization, db)
    resumes = (
        db.query(Resume)
        .filter(Resume.user_id == user.id)
        .order_by(Resume.created_at.desc())
        .all()
    )
    return [
        {
            "id": r.id,
            "resume_name": r.resume_name,
            "is_active": r.is_active,
            "created_at": r.created_at,
        }
        for r in resumes
    ]


@router.patch("/{resume_id}/activate")
def activate_resume(
    resume_id: int,
    user_id: int = 1,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    user = _get_user_for_request(user_id, authorization, db)
    
    # Set is_active = False for ALL resumes belonging to the current user
    db.query(Resume).filter(Resume.user_id == user.id).update({"is_active": False})
    
    # Query for the specific resume_id and set its is_active = True
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == user.id).first()
    if not resume:
        resume = db.query(Resume).filter(Resume.id == resume_id).first()
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found")
        resume.user_id = user.id

    resume.is_active = True
    db.commit()
    
    return {"message": "Resume activated"}