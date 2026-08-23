from sqlalchemy import Column, Integer, String, DateTime, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from app.database import Base


class DocumentHistory(Base):
    __tablename__ = "document_history"

    id = Column(Integer, primary_key=True, index=True)
    document_type = Column(String(100), nullable=False)  # e.g., "Cover Letter" or "Tailored Resume"
    job_title = Column(String(255), nullable=True, default="Untitled Role")
    content = Column(Text, nullable=False)  # Stores the letter text or stringified JSON of changes
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
