from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.user import UserCreate,VerifyOTP
from app.services.auth_service import signup as signup_service
from app.services.auth_service import verify_email
from app.schemas.auth import SignupResponse,VerifyEmailResponse,LoginResponse

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
def login():
    return LoginResponse()