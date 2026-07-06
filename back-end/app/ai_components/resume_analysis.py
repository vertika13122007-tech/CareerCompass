import os 
from dotenv import load_dotenv
import json

from google import genai

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

client = genai.Client(
    api_key=GEMINI_API_KEY
)


def analyze_resume(resume_text: str):

    prompt = f"""
You are an experienced ATS (Applicant Tracking System) and career coach.

Analyze the following resume like a modern Applicant Tracking System (ATS).

Evaluate:

1. ATS score out of 100.
2. Overall summary.
3. Strengths.
4. Weaknesses.
5. Keyword optimization:
   - Keywords already present.
   - Important keywords missing for software engineering internships.
6. Skill gap analysis:
   - Existing technical skills.
   - Skills the student should learn to become more competitive.
7. Missing resume sections.
8. Actionable improvement recommendations.

Also generate a short AI summary (maximum 4 sentences).

The summary should describe:

- Technical skills
- Best projects
- Technologies
- Career interests

This summary will later be used to personalize networking messages, referral requests, and AI career assistance.

Return ONLY valid JSON.

The JSON format should be:

{{
    "ats_score": 0,
    "ai_summary":"",
    "summary": "",
    "strengths": [],
    "weaknesses": [],
    "keyword_optimization": {{
        "present_keywords": [],
        "missing_keywords": []
    }},

    "skill_gap_analysis": {{
        "existing_skills": [],
        "recommended_skills": []
    }},
    "missing_sections": [],
    "recommendations": []
}}

Resume:

{resume_text}
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )

    text = response.text.strip()

    text = text.replace("```json", "")
    text = text.replace("```", "")
    text = text.strip()

    return json.loads(text)