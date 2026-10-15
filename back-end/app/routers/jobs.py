from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.JobApplication import JobApplication


class JobCreate(BaseModel):
    company_name: str
    job_title: str
    status: str = "Saved"


class JobStatusUpdate(BaseModel):
    status: str


router = APIRouter(prefix="/jobs", tags=["Jobs"])


@router.get("/stats")
def get_job_stats(db: Session = Depends(get_db)):
    # Assuming user_id=1 for now.
    user_id = 1

    saved = db.query(JobApplication).filter(JobApplication.user_id == user_id, JobApplication.status == "Saved").count()
    applied = db.query(JobApplication).filter(JobApplication.user_id == user_id, JobApplication.status == "Applied").count()
    interviewing = db.query(JobApplication).filter(JobApplication.user_id == user_id, JobApplication.status == "Interviewing").count()
    offers = db.query(JobApplication).filter(JobApplication.user_id == user_id, JobApplication.status == "Offer").count()

    return {
        "saved": saved,
        "applied": applied,
        "interviewing": interviewing,
        "offers": offers
    }


@router.get("/all")
def get_all_jobs(db: Session = Depends(get_db)):
    # Assuming user_id=1 for now
    jobs = (
        db.query(JobApplication)
        .filter(JobApplication.user_id == 1)
        .order_by(JobApplication.created_at.desc())
        .all()
    )
    return jobs


@router.post("/add")
def add_job(job: JobCreate, db: Session = Depends(get_db)):
    # Assuming user_id=1 for now
    new_job = JobApplication(
        user_id=1,
        company_name=job.company_name,
        job_title=job.job_title,
        status=job.status
    )
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return new_job


@router.patch("/{job_id}/status")
def update_job_status(job_id: int, status_update: JobStatusUpdate, db: Session = Depends(get_db)):
    job = db.query(JobApplication).filter(JobApplication.id == job_id, JobApplication.user_id == 1).first()
    if not job:
        return {"error": "Job not found"}

    job.status = status_update.status
    db.commit()
    db.refresh(job)
    return job


@router.delete("/{job_id}")
def delete_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(JobApplication).filter(JobApplication.id == job_id, JobApplication.user_id == 1).first()
    if job:
        db.delete(job)
        db.commit()
    return {"message": "Job deleted"}

