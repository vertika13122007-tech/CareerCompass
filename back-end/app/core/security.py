from fastapi.security import OAuth2PasswordBearer
from app.utils.jwt import decode_access_token
from fastapi import Depends,HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.User import User

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login"
)

def get_current_user(
        token: str = Depends(oauth2_scheme),
        db: Session = Depends(get_db)
):
    payload = decode_access_token(token)

    try:
        user_id = int(payload.get("sub"))
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication credentials"
        )

    if user_id is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

    user = db.query(User).filter(
        User.id == int(user_id)
    ).first()

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication credentials"
        )

    return user