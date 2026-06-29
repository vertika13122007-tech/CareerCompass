from app.models.Profile import Profile
from app.models.User import User
from app.schemas.profile import ProfileResponse,CreateProfileRequest,UpdateProfileRequest
from fastapi import HTTPException,status
from sqlalchemy.orm import Session

def _get_profile_by_user_id(
        user_id: int,
        db
):
    profile = (
        db.query(Profile)
            .filter(Profile.user_id == user_id)
            .first()
    ) 

    return profile

def _create_profile(
        user_id: int,
        request, 
        db
):
    profile = Profile(
        user_id=user_id,

        college_name=request.college_name,
        degree=request.degree,
        branch=request.branch,

        graduation_year=request.graduation_year,
        cgpa=request.cgpa,

        career_goal=request.career_goal,

        skills=request.skills,
        interests=request.interests,

        phone_number=request.phone_number,
        bio=request.bio,

        linkedin_url=request.linkedin_url,
        github_url=request.github_url
    )

    db.add(profile)

    return profile

def _update_profile(
        profile: Profile,
        request: UpdateProfileRequest
):

    update_data = request.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(profile, field, value)

    return profile


def create_profile_service(
    request: CreateProfileRequest,
    logged_in_user: User,
    db: Session,
):
    profile = _get_profile_by_user_id(
        logged_in_user.id,
        db
    )

    if profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profile already exists."
        )

    profile = _create_profile(
        user_id=logged_in_user.id,
        request=request,
        db=db
    )

    db.commit()
    db.refresh(profile)

    return ProfileResponse.model_validate(profile)


def get_profile_service(
        logged_in_user:User,
        db:Session
):
    profile = _get_profile_by_user_id(
        logged_in_user.id,
        db
    )

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found."
        )
    
    return ProfileResponse.model_validate(profile)


def update_profile_service(
        request: UpdateProfileRequest,
        logged_in_user:User,
        db:Session
):
    profile = _get_profile_by_user_id(
        logged_in_user.id,
        db
    )

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found."
        )
    
    profile = _update_profile( profile, request)

    db.commit()
    db.refresh(profile)

    return ProfileResponse.model_validate(profile)
    