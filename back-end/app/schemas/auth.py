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

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ForgotPasswordResponse(BaseModel):
    message: str

class VerifyResetOTPRequest(BaseModel):
    email: EmailStr
    otp: str

class VerifyResetOTPResponse(BaseModel):
    message: str

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp:str
    new_password: str

class ResetPasswordResponse(BaseModel):
    message: str