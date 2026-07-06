from pydantic import BaseModel, ConfigDict
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