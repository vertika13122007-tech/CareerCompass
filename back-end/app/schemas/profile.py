from pydantic import BaseModel 
from datetime import datetime

class CreateProfileRequest(BaseModel):
    college_name: str
    degree: str
    branch: str
    graduation_year: int
    cgpa: float
    career_goal: str
    skills: str | None = None
    interests: str | None = None
    phone_number: str| None = None
    bio: str | None = None
    linkedin_url: str | None = None
    github_url: str | None = None

class UpdateProfileRequest(BaseModel):
    college_name: str | None = None
    degree: str | None = None
    branch: str | None = None
    graduation_year: int | None = None
    cgpa: float | None = None
    career_goal: str | None = None
    skills: str | None = None
    interests: str | None = None
    phone_number: str| None = None
    bio: str | None = None
    linkedin_url: str | None = None
    github_url: str | None = None

class ProfileResponse(BaseModel):
    id: int
    user_id: int
    college_name: str
    degree: str
    branch: str
    graduation_year: int
    cgpa: float
    career_goal: str
    skills: str | None = None
    interests: str | None = None
    phone_number: str | None = None
    bio: str | None = None
    linkedin_url: str | None = None
    github_url: str | None = None
    created_at: datetime 
    updated_at: datetime

    class Config: 
        from_attributes = True
