from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.User import User
from app.schemas.user import UserCreate,VerifyOTP,UserProfile
from app.services.auth_service import signup as signup_service
from fastapi.security import OAuth2PasswordRequestForm
from app.services.auth_service import verify_email, login_service
from app.schemas.auth import SignupResponse,VerifyEmailResponse,LoginResponse
from app.core.security import get_current_user

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post(
    "/signup",
     response_model=SignupResponse
)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    return signup_service(user, db)

@router.post(
    "/verify-email",
    response_model=VerifyEmailResponse
)
def verify_email_route(
    user: VerifyOTP,
    db: Session = Depends(get_db)
):
    return verify_email(user, db)

@router.post(
    "/login",
    response_model=LoginResponse
)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    return login_service(form_data,db)


@router.get(
        "/me",
        response_model=UserProfile
)
def get_me(
    current_user: User = Depends(get_current_user)
):
    return{
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email
    }