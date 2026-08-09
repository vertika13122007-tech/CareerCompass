import os
from app.config import GEMINI_API_KEY

try:
    from google import genai
except ImportError:
    genai = None

if GEMINI_API_KEY and genai:
    client = genai.Client(api_key=GEMINI_API_KEY)
else:
    client = None


def generate_cover_letter(resume_json: dict, job_description: str) -> str:
    """
    Generates a cover letter based on resume JSON data and job description using Gemini API.
    Returns a mock cover letter string if GEMINI_API_KEY is missing or during placeholder phase.
    """
    if not GEMINI_API_KEY or not client:
        return (
            "Dear Hiring Manager,\n\n"
            "I am writing to express my strong interest in this position. "
            "Based on my background and experience, I am confident I would be a great fit for your team.\n\n"
            "Sincerely,\nApplicant (Mock Cover Letter)"
        )

    # Placeholder for real Gemini API call using client
    return (
        "Dear Hiring Manager,\n\n"
        "I am writing to express my strong interest in this position. "
        "Based on my background and experience, I am confident I would be a great fit for your team.\n\n"
        "Sincerely,\nApplicant (Mock Cover Letter)"
    )
