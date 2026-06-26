import bcrypt
from app.utils.otp import generate_otp
from app.utils.security import hash_password
from fastapi import HTTPException
from datetime import datetime, timedelta, timezone
from app.models.User import User
from app.models.PendingUser import PendingUser
from app.models.PasswordResetOTP import PasswordResetOTP
from app.services.email_service import send_verification_email, welcome_email, send_password_reset_email
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.schemas.user import UserCreate, VerifyOTP, UserLogin
from app.utils.jwt import create_access_token,decode_access_token
from app.schemas.auth import LoginResponse, ForgotPasswordResponse, VerifyResetOTPResponse, ResetPasswordResponse

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


def _verify_password(login_password: str,hashed_password: str) -> bool:
    login_bytes = login_password.encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(login_bytes,hashed_bytes)


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

def _authenticate_user(
    email: str,
    password: str,
    db: Session
):
    login_user = _get_user_by_email(email,db)

    if not login_user:
        raise HTTPException(
            status_code= 401,
            detail="Invalid email or Invalid password"
        )
    
    password_verified = _verify_password(
                        password,
                        login_user.hashed_password)
    
    if not password_verified :
        raise HTTPException(
            status_code=401,
            detail="Invalid email or Invalid password"
        )
    
    return login_user
    

def login_service(
        form_data: OAuth2PasswordRequestForm,
        db : Session):
    
    authenticated_user = _authenticate_user(
        form_data.username,
        form_data.password,
        db
    )
    
    data = {
        "sub":str(authenticated_user.id)
    }

    access_token = create_access_token(data)
    
    return LoginResponse(
        message="Login successful.",
        access_token=access_token,
        token_type="bearer",
        user={
            "id": authenticated_user.id,
            "name": authenticated_user.name,
            "email": authenticated_user.email
        }
    )

def _get_reset_record_by_user_id(id,db):
    reset_password_user = db.query(PasswordResetOTP).filter(PasswordResetOTP.user_id == id).first()
    return reset_password_user

def hash_otp(otp:str):
    hashed_otp = hash_password(otp)
    return hashed_otp
    
def _create_Reset_user(
    user_id,
    hashed_otp,
    otp_expires_at,
    db
):
    reset_otp = PasswordResetOTP(
        user_id=user_id,
        hashed_otp=hashed_otp,
        otp_expires_at=otp_expires_at
    )

    db.add(reset_otp)
    return reset_otp   

def _update_reset_user(
    reset_password_user,
    hashed_otp,
    otp_expires_at
):

    reset_password_user.hashed_otp = hashed_otp

    reset_password_user.otp_expires_at = otp_expires_at

    return reset_password_user


def forgot_password_service(email: str,db):

    logged_in_user = _get_user_by_email(email,db)

    if not logged_in_user :
        return ForgotPasswordResponse(
            message="If an account exists, a password reset OTP has been sent."
        )
    
    reset_passsword_user = _get_reset_record_by_user_id(logged_in_user.id,db)
    
    reset_otp = generate_otp(6)

    hashed_otp = hash_otp(reset_otp)

    otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)

    if reset_passsword_user:
        reset_passsword_user = _update_reset_user(reset_passsword_user,
            hashed_otp,
            otp_expires_at)
        
    else:
        reset_passsword_user= _create_Reset_user(
        logged_in_user.id,
        hashed_otp,
        otp_expires_at,db)

    db.commit()
    db.refresh(reset_passsword_user)

    try:
        send_password_reset_email(
            logged_in_user.email,
            reset_otp
        )
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=500,
            detail="Error occured while sending email."
        )
    
    return ForgotPasswordResponse(
        message="If an account exists. A reset OTP has been sent."
    )


def _verify_otp(reset_otp: str,hashed_otp: str) -> bool:
    reset_otp_bytes = reset_otp.encode('utf-8')
    hashed_otp_bytes = hashed_otp.encode('utf-8')
    return bcrypt.checkpw(reset_otp_bytes,hashed_otp_bytes)


def verify_reset_otp_service( email: str, reset_otp:str, db):

    logged_in_user = _get_user_by_email(email,db)

    if not logged_in_user :
        raise HTTPException(
            status_code=401,
            detail="Invalid email or OTP"
        )
    
    reset_passsword_record = _get_reset_record_by_user_id(logged_in_user.id,db)

    if not reset_passsword_record:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or OTP"
        )
    
    if reset_passsword_record.otp_expires_at < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or OTP ."
        )

    otp_verified = _verify_otp(
                        reset_otp,
                        reset_passsword_record.hashed_otp)
    
    if not otp_verified :
        raise HTTPException(
            status_code=401,
            detail="Invalid email or Invalid OTP"
        )
    
    return VerifyResetOTPResponse(
        message="OTP has been successfully verified"
    )



def _update_user_password(
    user,
    hashed_password,
):
    user.hashed_password = hashed_password

    return user



def reset_password_service( email: str, reset_otp:str, new_password:str, db):

    logged_in_user = _get_user_by_email(email,db)

    if not logged_in_user :
        raise HTTPException(
            status_code=401,
            detail="Invalid email or OTP"
        )
    
    reset_passsword_record = _get_reset_record_by_user_id(logged_in_user.id,db)

    if not reset_passsword_record:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or OTP"
        )
    
    if reset_passsword_record.otp_expires_at < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or OTP ."
        )
    
    otp_verified = _verify_otp(
                        reset_otp,
                        reset_passsword_record.hashed_otp)
    
    if not otp_verified :
        raise HTTPException(
            status_code=401,
            detail="Invalid email or Invalid OTP"
        )
    
    hashed_password = hash_password(new_password)

    logged_in_user = _update_user_password(logged_in_user,hashed_password)

    db.delete(reset_passsword_record)

    db.commit()

    return ResetPasswordResponse(
        message=" Password has been updated "
    )

