from app.database import engine, SessionLocal
from app.models.ActivityLog import ActivityLog

def upgrade():
    print("Creating activity_logs table...")
    ActivityLog.metadata.create_all(bind=engine)

    db = SessionLocal()
    if db.query(ActivityLog).count() == 0:
        print("Adding sample activities...")
        mock_logs = [
            ActivityLog(user_id=1, type="upload", text="Uploaded Fake_BTech_CSE_Resume_Demo.pdf"),
            ActivityLog(user_id=1, type="score", text="AI graded active resume: 45/100"),
            ActivityLog(user_id=1, type="job", text="Saved 'UI Developer' at Stripe")
        ]
        db.add_all(mock_logs)
        db.commit()

    db.close()
    print("Database ready!")

if __name__ == "__main__":
    upgrade()