from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.ActivityLog import ActivityLog

router = APIRouter(prefix="/activity", tags=["Activity"])


@router.get("/recent")
def get_recent_activity(db: Session = Depends(get_db)):
    # Assuming user_id=1
    activities = (
        db.query(ActivityLog)
        .filter(ActivityLog.user_id == 1)
        .order_by(ActivityLog.created_at.desc())
        .limit(5)
        .all()
    )
    return activities
