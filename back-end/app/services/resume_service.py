import uuid
import os
import shutil
import logging
import logging
from app.models.Resume import Resume
from app.models.User import User
from sqlalchemy.orm import Session
from fastapi import UploadFile
from fastapi import HTTPException,status
from app.schemas.resume import ResumeResponse, ResumeUpload, ResumeDeleteResponse

MAX_FILE_SIZE = 5 * 1024 * 1024 #5MB

logger = logging.getLogger(__name__)


def _get_resume_by_user_id(
        user_id: int,
        db: Session
):
    resume = (
        db.query(Resume)
        .filter(Resume.user_id == user_id)
        .first()
    )
    return resume

def _create_resume(
    user_id:int,
    original_filename:str,
    stored_filename:str,
    file_path:str,
    extracted_text:str | None,
    db:Session
):
    resume = Resume(
        user_id=user_id,
        original_filename=original_filename,
        stored_filename=stored_filename,
        file_path=file_path,
        extracted_text=extracted_text,
    )

    db.add(resume)
    return resume

def _update_resume(
    original_filename:str,
    stored_filename:str,
    file_path:str,
    extracted_text:str | None,
    resume: Resume
): 
    resume.original_filename = original_filename
    resume.stored_filename = stored_filename
    resume.file_path = file_path
    resume.extracted_text = extracted_text

    return resume



def upload_resume_service(
        file: UploadFile,
        logged_in_user: User,
        db: Session
):
    if file.content_type != "application/pdf" :
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed"
        )
    
    file.file.seek(0,2)
    file_size = file.file.tell()
    file.file.seek(0) 

    if file_size > MAX_FILE_SIZE :
        raise HTTPException(
            status_code=400,
            detail="Resume must be samller than 5 MB"
        )
    
    file_name, extension = os.path.splitext(file.filename)

    stored_filename = f"{uuid.uuid4()}{extension}"

    file_path = os.path.join(
        "uploads",
        "resumes",
        stored_filename
    )

    os.makedirs(
        os.path.dirname(file_path),
        exist_ok=True
    )

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file,buffer)
    except Exception as e:

        logger.exception("Failed to save uploaded resume")

        raise HTTPException(
            status_code=500,
            detail="Failed to upload resume."
        )
   

    resume = _get_resume_by_user_id(logged_in_user.id,db)

    old_file_path = None

    if resume:
        old_file_path = resume.file_path

    if resume is None:
        resume = _create_resume(
            user_id=logged_in_user.id,
            original_filename=file.filename,
            stored_filename=stored_filename,
            file_path=file_path,
            extracted_text=None,
            db=db
        )

    else:
        resume = _update_resume(
            original_filename=file.filename,
            stored_filename=stored_filename,
            file_path=file_path,
            extracted_text=None,
            resume=resume
        )

    db.commit()
    db.refresh(resume)
    
    if old_file_path and os.path.exists(old_file_path):
        os.remove(old_file_path)

    return ResumeUpload(
        message="Uploaded Sucessfully."
    )


def get_resume_service(
        logged_in_user : User,
        db: Session
):
    resume = _get_resume_by_user_id( 
        logged_in_user.id,
        db
    )

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found."
        )
    
    return ResumeResponse.model_validate(resume)


def delete_resume_service(
        logged_in_user: User,
        db: Session
):
    resume = _get_resume_by_user_id(logged_in_user.id,db)

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found."
        )
    
    old_file_path = resume.file_path

    db.delete(resume)
    db.commit()

    try:
        if os.path.exists(old_file_path):
            os.remove(old_file_path)
    except Exception:

        logger.exception("Failed to delete resume file")

    return ResumeDeleteResponse(
        message="Resume has been Deleted Successfully."
    )

