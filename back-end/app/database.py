import os
from dotenv import load_dotenv
from sqlalchemy import create_engine #for connecting the postgre with fastAPI
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

from sqlalchemy.orm import Session

def get_db():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()