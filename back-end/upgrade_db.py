from app.database import engine
from sqlalchemy import text

def upgrade():
    with engine.begin() as conn:
        try:
            print("Dropping unique lock on user_id...")
            conn.execute(text("ALTER TABLE resumes DROP CONSTRAINT IF EXISTS resumes_user_id_key;"))
            print("Lock successfully dropped! Users can now have multiple resumes.")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    upgrade()