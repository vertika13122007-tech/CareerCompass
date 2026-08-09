from dotenv import load_dotenv
import os

load_dotenv()

RESEND_API_KEY = os.getenv("API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")