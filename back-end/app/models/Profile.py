from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    ForeignKey,
    DateTime,
    func
)
from sqlalchemy.orm import relationship

from app.database import Base


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        unique=True,
        nullable=False
    )

    phone_number = Column(String, nullable=True)

    bio = Column(String, nullable=True)

    college_name = Column(String, nullable=False)

    degree = Column(String, nullable=False)

    branch = Column(String, nullable=False)

    graduation_year = Column(Integer, nullable=False)

    cgpa = Column(Float, nullable=False)

    skills = Column(String, nullable=True)

    interests = Column(String, nullable=True)

    career_goal = Column(String, nullable=False)

    linkedin_url = Column(String, nullable=True)

    github_url = Column(String, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    user = relationship(
        "User",
        back_populates="profile"
    )