from sqlalchemy import (
    Column, 
    ForeignKey,
    String,
    DateTime,
    Float,
    func,
    Integer
)

from sqlalchemy.orm import relationship
from app.database import Base

class JobPreference(Base):
    __tablename__ = "job_preferences"

    id = Column( Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        unique=True,
        nullable=False
    )

    preferred_roles = Column( String(255) , nullable=False )

    preferred_locations = Column( String(255) , nullable=True )

    preferred_industries = Column( String(255) , nullable=True )

    work_mode = Column( String(20) , nullable=True )

    employment_type = Column( String(20) , nullable=True )

    expected_salary_lpa = Column( Float , nullable=True )

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
        back_populates="job_preference"
    )