from fastapi import FastAPI
from app.database import Base, engine
from app.models import User
from app.models.PendingUser import PendingUser
from app.routers.auth import router as auth_router
from app.schemas.user import UserCreate

app = FastAPI();
app.include_router(auth_router)

Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return{
        "message":"CareerCompass AI API Running"
    }
