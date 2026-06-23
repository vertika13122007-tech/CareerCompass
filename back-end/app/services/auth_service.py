from app.utils.otp import generate_otp
from app.utils.security import hash_password
from fastapi import HTTPException
from datetime import datetime, timedelta, timezone
from app.models.User import User
from app.models.PendingUser import PendingUser
from app.services.email_service import send_verification_email, welcome_email
from sqlalchemy.orm import Session
from app.schemas.user import UserCreate, VerifyOTP

def _get_user_by_email(email,db):
    existing_user = db.query(User).filter(User.email == email).first()
    return existing_user


def _get_pending_user(email,db):
    pending_user = db.query(PendingUser).filter(PendingUser.email == email).first()
    return pending_user 


def _create_pending_user(
    name,
    email,
    hashed_password,
    otp,
    otp_expires_at,
    db
):
    pending_user = PendingUser(
        name=name,
        email=email,
        hashed_password=hashed_password,
        otp=otp,
        otp_expires_at=otp_expires_at
    )

    db.add(pending_user)
    return pending_user   


def _update_pending_user(
    pending_user,
    name,
    hashed_password,
    otp,
    otp_expires_at
):
    pending_user.name = name

    pending_user.hashed_password = hashed_password

    pending_user.otp = otp

    pending_user.otp_expires_at = otp_expires_at

    return pending_user


def _create_user(
    name,
    email,
    hashed_password,
    db
):
    new_user = User(
        name=name,
        email=email,
        hashed_password=hashed_password
    )


    db.add(new_user)
    return new_user

def _delete_pending_user(pending_user,db):
    db.delete(pending_user)


def signup(user: UserCreate, db: Session):

    existing_user = _get_user_by_email(user.email,db)
    pending_user = _get_pending_user(user.email,db)

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered."
        )

    otp = generate_otp(6)

    hashed_password = hash_password(user.password)

    otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)

    if pending_user:
        pending_user = _update_pending_user(pending_user,
            user.name,
            hashed_password,
            otp,
            otp_expires_at)
        
    else:

        pending_user = _create_pending_user(
            user.name,
            user.email,
            hashed_password,
            otp,
            otp_expires_at,
            db
        )
    
    db.commit()
    db.refresh(pending_user)

    try:
        send_verification_email(
            pending_user.email,
            pending_user.otp
        )
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=500,
            detail="Error occured while sending email."
        )
    
    return {
        "message": "OTP sent successfully. Please verify your email."
    }


def verify_email(user: VerifyOTP, db: Session):

    pending_user = _get_pending_user(user.email,db)

    if not pending_user :
        raise HTTPException(
            status_code=404,
            detail="No pending registration found."
        )
    
    if user.otp != pending_user.otp:
        raise HTTPException(
            status_code=400,
            detail="Invalid OTP."
        )
    
    if pending_user.otp_expires_at < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=400,
            detail="OTP expired."
        )
    
    try:
        verified_user =_create_user(
            pending_user.name,
            pending_user.email,
            pending_user.hashed_password,
            db
        )
        _delete_pending_user(pending_user,db)   
                    
        db.commit()
        db.refresh(verified_user)
    except Exception:
        db.rollback()
        raise

    try:
        welcome_email(
            verified_user.email,
            verified_user.name
        )
    except Exception as e:
        print(e) 
    
    return {
        "message": "Email has being verified successfully."
    }