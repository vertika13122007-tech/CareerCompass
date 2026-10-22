from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.User import User
from app.models.Resume import Resume
from app.models.JobApplication import JobApplication
from app.models.ActivityLog import ActivityLog
from app.models.Profile import Profile
from app.models.Job_Preference import JobPreference
from app.models.PasswordResetOTP import PasswordResetOTP
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

@router.delete("/account")
def delete_user_account(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Permanently deletes the currently authenticated user and all their associated data.
    """
    try:
        # Delete related records to maintain database integrity (or rely on database cascade rules)
        db.query(Resume).filter(Resume.user_id == current_user.id).delete()
        db.query(JobApplication).filter(JobApplication.user_id == current_user.id).delete()
        db.query(ActivityLog).filter(ActivityLog.user_id == current_user.id).delete()
        db.query(Profile).filter(Profile.user_id == current_user.id).delete()
        db.query(JobPreference).filter(JobPreference.user_id == current_user.id).delete()
        db.query(PasswordResetOTP).filter(PasswordResetOTP.user_id == current_user.id).delete()

        # Delete the user account
        db.delete(current_user)
        db.commit()

        return {"message": "Account successfully deleted."}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete account: {str(e)}"
        )


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

@router.patch("/password")
def change_password(
    request: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    import bcrypt
    from app.utils.security import hash_password

    login_bytes = request.current_password.encode('utf-8')
    hashed_bytes = current_user.hashed_password.encode('utf-8')
    if not bcrypt.checkpw(login_bytes, hashed_bytes):
        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect"
        )

    current_user.hashed_password = hash_password(request.new_password)
    db.commit()
    return {"message": "Password updated successfully"}

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

