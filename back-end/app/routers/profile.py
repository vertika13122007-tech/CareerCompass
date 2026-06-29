from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.User import User
from app.schemas.profile import (
    CreateProfileRequest,
    UpdateProfileRequest,
    ProfileResponse,
)
from app.services.profile_service import (
    create_profile_service,
    get_profile_service,
    update_profile_service,
)

router = APIRouter(
    prefix="/profile",
    tags=["Profile"],
)


@router.post(
    "/",
    response_model=ProfileResponse
)
def create_profile(
    request: CreateProfileRequest,
    logged_in_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return create_profile_service(
        request=request,
        logged_in_user=logged_in_user,
        db=db
    )


@router.get(
    "/",
    response_model=ProfileResponse
)
def get_profile(
    logged_in_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_profile_service(
        logged_in_user=logged_in_user,
        db=db
    )


@router.patch(
    "/",
    response_model=ProfileResponse
)
def update_profile(
    request: UpdateProfileRequest,
    logged_in_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return update_profile_service(
        request=request,
        logged_in_user=logged_in_user,
        db=db
    )