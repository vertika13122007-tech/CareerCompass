from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.database import Base, engine
from app.models import User
from app.models.PendingUser import PendingUser
from app.models.PasswordResetOTP import PasswordResetOTP
from app.models.Profile import Profile
from app.models.Resume import Resume
from app.models.DocumentHistory import DocumentHistory
from app.models.ChatSession import ChatSession
from app.routers.auth import router as auth_router
from app.routers.profile import router as profile_router
from app.routers.resume import router as resume_router
from app.routers.job_preference import router as job_pref_router
from app.routers.ai import router as ai_router
from fastapi.middleware.cors import CORSMiddleware

from app.services.ai.local_ml import LocalMLService

ml_models = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load the ML models here
    print("🚀 Loading ML models into memory...")
    ml_models["local_ml"] = LocalMLService()
    yield
    # Clean up resources on shutdown
    print("🛑 Cleaning up ML models...")
    ml_models.clear()


app = FastAPI(lifespan=lifespan)
app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(resume_router)
app.include_router(job_pref_router)
app.include_router(ai_router)


Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "message": "CareerCompass AI API Running"
    }

