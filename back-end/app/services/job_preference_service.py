from sqlalchemy.orm import Session
from fastapi import HTTPException,status

from app.models.Job_Preference import JobPreference
from app.models.User import User
from app.schemas.job_preference import JobPreferenceCreateRequest, JobPreferenceResponse, JobPreferenceUpdateRequest


def _get_job_preference_by_user_id(
        user_id: int,
        db: Session
):
    job_preference = (
        db.query(JobPreference)
        .filter(JobPreference.user_id == user_id)
        .first()
    )
    return job_preference


def _create_job_preference(
    user_id: int,
    preferred_roles: str,
    preferred_locations: str | None,
    preferred_industries: str | None,
    work_mode: str | None,
    employment_type: str | None,
    expected_salary_lpa: float | None,
    db: Session
):
    job_preference = JobPreference(
        user_id=user_id,
        preferred_roles=preferred_roles,
        preferred_locations=preferred_locations,
        preferred_industries=preferred_industries,
        work_mode=work_mode,
        employment_type=employment_type,
        expected_salary_lpa=expected_salary_lpa,
    )

    db.add(job_preference)

    return job_preference


def _update_job_preference(
    preferred_roles: str,
    preferred_locations: str | None,
    preferred_industries: str | None,
    work_mode: str | None,
    employment_type: str | None,
    expected_salary_lpa: float | None,
    job_preference: JobPreference
):
    job_preference.preferred_roles = preferred_roles
    job_preference.preferred_locations = preferred_locations
    job_preference.preferred_industries = preferred_industries
    job_preference.work_mode = work_mode
    job_preference.employment_type = employment_type
    job_preference.expected_salary_lpa = expected_salary_lpa
    job_preference=job_preference

    return job_preference


def get_job_preference_service(
        logged_in_user : User,
        db: Session
):
    job_preference = _get_job_preference_by_user_id( 
        logged_in_user.id,
        db
    )

    if not job_preference:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job preference not found."
        )
    
    return JobPreferenceResponse.model_validate(job_preference)


def create_job_preference_service(
        request: JobPreferenceCreateRequest,
        logged_in_user: User,
        db: Session
):
    job_preference = _get_job_preference_by_user_id(
        logged_in_user.id,
        db
    )

    if job_preference:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Job preferences already exist. Use PATCH to update them."
        )
    
    job_preference = _create_job_preference(
        user_id=logged_in_user.id,
        preferred_roles=request.preferred_roles,
        preferred_locations=request.preferred_locations,
        preferred_industries=request.preferred_industries,
        work_mode=request.work_mode,
        employment_type=request.employment_type,
        expected_salary_lpa=request.expected_salary_lpa,
        db=db
    )

    db.commit()
    db.refresh(job_preference)

    return JobPreferenceResponse.model_validate(job_preference)


def update_job_preference_service(
        request: JobPreferenceUpdateRequest,
        logged_in_user:User,
        db:Session
):
    job_preference = _get_job_preference_by_user_id(
        logged_in_user.id,
        db
    )

    if not job_preference:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job preferences does not exists. Please create a one before updating."
        )
    
    update_data = request.model_dump(exclude_unset=True)
    
    for key,value in update_data.items():
        setattr( job_preference , key , value )

    job_preference = _update_job_preference(
        preferred_roles=job_preference.preferred_roles,
        preferred_locations=job_preference.preferred_locations,
        preferred_industries=job_preference.preferred_industries,
        work_mode=job_preference.work_mode,
        employment_type=job_preference.employment_type,
        expected_salary_lpa=job_preference.expected_salary_lpa,
        job_preference=job_preference
    )

    db.commit()
    db.refresh(job_preference)

    return JobPreferenceResponse.model_validate(job_preference)

