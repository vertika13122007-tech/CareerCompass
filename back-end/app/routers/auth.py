from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.User import User
from app.schemas.user import UserCreate,VerifyOTP,UserProfile
from app.services.auth_service import signup as signup_service
from fastapi.security import OAuth2PasswordRequestForm
from app.services.auth_service import verify_email, login_service, forgot_password_service, verify_reset_otp_service, reset_password_service
from app.schemas.auth import (SignupResponse,VerifyEmailResponse,
                LoginResponse,ForgotPasswordResponse,ForgotPasswordRequest,
                VerifyResetOTPResponse,VerifyResetOTPRequest,
                ResetPasswordRequest,ResetPasswordResponse)
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

@router.post(
    "/forgot-password",
    response_model=ForgotPasswordResponse
)
def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    return forgot_password_service(
        request.email,
        db
    )

@router.post(
    "/verify-reset-otp",
    response_model=VerifyResetOTPResponse
)
def verify_reset_otp(
    request: VerifyResetOTPRequest,
    db: Session = Depends(get_db)
):
    return verify_reset_otp_service(
        request.email,
        request.otp,
        db
    )

@router.post(
    "/reset-password",
    response_model=ResetPasswordResponse
)
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    return reset_password_service(
        request.email,
        request.otp,
        request.new_password,
        db
    )

