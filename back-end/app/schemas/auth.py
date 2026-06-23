from pydantic import BaseModel, ConfigDict, EmailStr

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr

    model_config = ConfigDict(from_attributes=True)
    
class SignupResponse(BaseModel):
    message: str

class VerifyEmailResponse(BaseModel):
    message: str

class LoginResponse(BaseModel):
    message: str
    access_token: str
    token_type: str
    user: UserResponse