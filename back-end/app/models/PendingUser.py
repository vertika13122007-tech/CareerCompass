from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.database import Base

class PendingUser(Base):
    __tablename__ = "pending_users"

    id = Column(Integer, primary_key=True,index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String,nullable=False)
    otp = Column(String(6),nullable=False)
    otp_expires_at = Column(
        DateTime(timezone=True),
        nullable=False
    )
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )