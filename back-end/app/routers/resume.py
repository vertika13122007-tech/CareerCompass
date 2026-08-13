from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.User import User
from app.dependencies.auth import get_current_user
from app.schemas.resume import ResumeResponse, ResumeDeleteResponse
from app.services.resume_service import (
    upload_resume_service,
    get_resume_service,
    delete_resume_service)

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
    user_id: int = 1,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    user = _get_user_for_request(user_id, authorization, db)
    return upload_resume_service(
        file=file,
        logged_in_user=user,
        db=db
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