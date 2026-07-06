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

@router.post("/")
async def upload_resume(
    file: UploadFile = File(...),
    logged_in_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return upload_resume_service(
        file=file,
        logged_in_user=logged_in_user,
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