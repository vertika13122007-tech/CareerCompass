from pydantic import BaseModel, EmailStr
from datetime import datetime


class PendingUserBase(BaseModel):
    email: EmailStr


class PendingUserResponse(PendingUserBase):
    id: int
    otp_expires_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True