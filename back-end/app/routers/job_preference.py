from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.User import User
from app.dependencies.auth import get_current_user
from app.schemas.job_preference import JobPreferenceResponse,JobPreferenceCreateRequest, JobPreferenceUpdateRequest
from app.services.job_preference_service import (
    create_job_preference_service,
    update_job_preference_service,
    get_job_preference_service
)

router = APIRouter(
    prefix="/job-preference",
    tags=["Job Preference"],
)


@router.get(
    "/",
    response_model=JobPreferenceResponse
)
def get_job_preference(
    logged_in_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_job_preference_service(
        logged_in_user,
        db
    )


@router.post(
        "/",
        response_model=JobPreferenceResponse
)
async def create_job_preference(
    request:JobPreferenceCreateRequest,
    logged_in_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return create_job_preference_service(
        request=request,
        logged_in_user=logged_in_user,
        db=db
    )


@router.patch(
    "/",
    response_model=JobPreferenceResponse
)
def update_job_preference(
    request: JobPreferenceUpdateRequest,
    logged_in_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return update_job_preference_service(
        request=request,
        logged_in_user=logged_in_user,
        db=db
    )

