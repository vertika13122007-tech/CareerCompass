from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime

class ResumeUpload(BaseModel):
    message:str


class ResumeResponse(BaseModel):
    original_filename: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ResumeDeleteResponse(BaseModel):
    message: str


class EducationEntry(BaseModel):
    degree: str | None = None
    institution: str | None = None
    start_year: int | None = None
    end_year: int | None = None
    cgpa: float | None = None


class ExperienceEntry(BaseModel):
    job_title: str | None = None
    company: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    description: list[str] = Field(default_factory=list)


class ProjectEntry(BaseModel):
    title: str | None = None
    technologies: list[str] = Field(default_factory=list)
    description: list[str] = Field(default_factory=list)
    link: str | None = None