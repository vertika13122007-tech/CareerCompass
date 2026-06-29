from fastapi import FastAPI
from app.database import Base, engine
from app.models import User
from app.models.PendingUser import PendingUser
from app.models.PasswordResetOTP import PasswordResetOTP
from app.models.Profile import Profile
from app.routers.auth import router as auth_router
from app.routers.profile import router as profile_router

app = FastAPI();
app.include_router(auth_router)
app.include_router(profile_router)

Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return{
        "message":"CareerCompass AI API Running"
    }
