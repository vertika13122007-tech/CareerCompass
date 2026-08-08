import uuid
import os
import shutil
import logging
import logging
import fitz
from app.models.Resume import Resume
from app.models.User import User
from sqlalchemy.orm import Session
from fastapi import UploadFile
from fastapi import HTTPException,status
from fastapi.encoders import jsonable_encoder
from app.schemas.resume import ResumeResponse, ResumeUpload, ResumeDeleteResponse
from app.services.resume_parser import parse_resume

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
    parsed_resume:dict,
    db:Session
):
    resume = Resume(
        user_id=user_id,
        original_filename=original_filename,
        stored_filename=stored_filename,
        file_path=file_path,
        extracted_text=extracted_text,
        parsed_resume=parsed_resume
    )

    db.add(resume)
    return resume

def _update_resume(
    original_filename:str,
    stored_filename:str,
    file_path:str,
    extracted_text:str | None,
    parsed_resume: dict,
    resume: Resume
): 
    resume.original_filename = original_filename
    resume.stored_filename = stored_filename
    resume.file_path = file_path
    resume.extracted_text = extracted_text
    resume.parsed_resume = parsed_resume

    return resume


def _extract_text_from_pdf(
        file_path: str
) -> str :
    
    try:
        with fitz.open(file_path) as document:

            all_text = []

            for page in document:

                page_text = page.get_text()

                if page_text.strip():
                    all_text.append(page_text)


            return "\n".join(all_text)
    
    except Exception:
        logger.exception("There was a problem in opening the file.")

        raise HTTPException(
            status_code=status.HTTP_401_BAD_REQUEST,
            detail="There was a problem in openeing the file."
        )
    

def _clean_resume_text(
        all_text: str
) -> str :
    
    new_text = []

    all_text = all_text.replace("\r\n","\n")

    lines = all_text.split("\n")
    
    previous_line_empty = False

    for line in lines:
        
        line = line.strip()

        if not line :

            if previous_line_empty == True:
                continue

            else:
                new_text.append(line)
                previous_line_empty = True

        else:
            new_text.append(line)
            previous_line_empty = False
    
    return "\n".join(new_text)


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
    except Exception:

        logger.exception("Failed to save uploaded resume")

        raise HTTPException(
            status_code=500,
            detail="Failed to upload resume."
        )
    
    try:
        raw_text = _extract_text_from_pdf(file_path)
        cleaned_text = _clean_resume_text(raw_text)

        # Parse the resume text
        raw_parsed_resume = parse_resume(cleaned_text)

        # Convert Pydantic models to standard JSON-serializable dictionaries
        safe_parsed_resume = jsonable_encoder(raw_parsed_resume)

    except Exception:
        if os.path.exists(file_path):
            os.remove(file_path)

        logger.exception("Failed to extract text from the resume.")

        raise HTTPException(
            status_code=500,
            detail="Failed to process uploaded resume."
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
            extracted_text=cleaned_text,
            parsed_resume=safe_parsed_resume,
            db=db
        )

    else:
        resume = _update_resume(
            original_filename=file.filename,
            stored_filename=stored_filename,
            file_path=file_path,
            extracted_text=cleaned_text,
            parsed_resume=safe_parsed_resume,
            resume=resume
        )

    try:
        db.commit()

    except Exception:
        db.rollback()

        if os.path.exists(file_path):
            os.remove(file_path)

        logger.exception("Database transcation failed.")

        import traceback
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail="Failed to save resume."
        )

    db.refresh(resume)
    
    
    try:
        if old_file_path and os.path.exists(old_file_path):
            os.remove(old_file_path)
    except Exception:
        logger.exception("Failed to delete previous resume.")

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