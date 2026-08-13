import os
import json
import traceback
from pydantic import BaseModel, Field
from google import genai
from google.genai import types

from app.config import GEMINI_API_KEY


class ATSAnalysisResponse(BaseModel):
    missing_skills: list[str]
    matching_strengths: list[str]
    improvement_suggestions: list[str]


class OptimizedBulletOption(BaseModel):
    optimized_text: str
    explanation_of_changes: str


class BulletOptimizationResponse(BaseModel):
    options: list[OptimizedBulletOption]


class RoadmapStep(BaseModel):
    time_period: str
    topic: str
    specific_technologies: list[str]
    action_items: list[str]
    resources: list[str]


class LearningRoadmap(BaseModel):
    target_role: str
    timeframe: str
    current_gap_summary: str
    roadmap: list[RoadmapStep]


class GeminiService:
    def __init__(self, api_key: str | None = None, default_model: str = "gemini-3.5-flash-lite"):
        self.api_key = api_key or GEMINI_API_KEY or os.getenv("GEMINI_API_KEY")
        self.default_model = default_model

        if self.api_key:
            self.client = genai.Client(api_key=self.api_key)
        else:
            self.client = None

    def generate_cover_letter(
        self,
        resume_json: dict | str,
        job_description: str,
        company_name: str | None = None,
        job_title: str | None = None,
        tone: str = "professional"
    ) -> str:
        """
        Generates a tailored cover letter using the Google GenAI SDK (Gemini API).
        Falls back to a dynamic mock cover letter if GEMINI_API_KEY is missing or API call fails.
        """
        if not self.client:
            return self._get_fallback_cover_letter(resume_json, job_description, company_name, job_title)

        try:
            if isinstance(resume_json, dict):
                resume_str = json.dumps(resume_json, indent=2)
            else:
                resume_str = str(resume_json)

            prompt = (
                f"Write a highly compelling, professional, and tailored cover letter based on the candidate's resume and job description.\n\n"
                f"Candidate Resume Data:\n{resume_str}\n\n"
                f"Job Description:\n{job_description}\n\n"
                f"Additional Context:\n"
                f"- Target Company: {company_name or 'Hiring Company'}\n"
                f"- Target Position: {job_title or 'Target Role'}\n"
                f"- Desired Tone: {tone}\n\n"
                f"Requirements:\n"
                f"1. Craft a persuasive opening section highlighting relevant expertise and enthusiasm for the role.\n"
                f"2. Connect key achievements and technical/soft skills from the candidate's background directly to requirements in the job description.\n"
                f"3. Maintain a {tone} tone, structured cleanly into 3 to 4 concise paragraphs.\n"
                f"4. End with a proactive call-to-action expressing interest in an interview.\n"
                f"5. Do NOT use placeholder brackets like [Company Name] or [Your Name]; extract details from the inputs or use realistic phrasing."
            )

            system_instruction = (
                "You are an expert career consultant and professional cover letter writer. "
                "Your goal is to craft tailored, high-converting, ATS-friendly cover letters."
            )

            config = types.GenerateContentConfig(
                temperature=0.7,
                system_instruction=system_instruction,
            )

            response = self.client.models.generate_content(
                model=self.default_model,
                contents=prompt,
                config=config,
            )

            if response and response.text:
                return response.text.strip()

            return self._get_fallback_cover_letter(resume_json, job_description, company_name, job_title)

        except Exception as e:
            print(f"Gemini API error during cover letter generation: {e}")
            return self._get_fallback_cover_letter(resume_json, job_description, company_name, job_title)

    def analyze_skill_gap(
        self,
        resume_json: dict | str,
        job_description: str,
        ats_scores: dict
    ) -> ATSAnalysisResponse:
        """
        Analyzes candidate resume against job description and ATS scores to identify
        missing skills, matching strengths, and improvement suggestions using Gemini structured JSON outputs.
        """
        if not self.client:
            return self._get_fallback_skill_gap_analysis(resume_json, job_description)

        try:
            if isinstance(resume_json, dict):
                resume_str = json.dumps(resume_json, indent=2)
            else:
                resume_str = str(resume_json)

            scores_str = json.dumps(ats_scores, indent=2)

            system_prompt = (
                "You are an expert ATS (Applicant Tracking System) recruiter. "
                "Analyze the candidate's resume against the Job Description and the calculated ATS scores. "
                "Identify exact missing skills, highlight matching strengths, and provide actionable bullet points to improve the resume match. "
                "Be concise and specific."
            )

            contents = f"Resume Data:\n{resume_str}\n\nJob Description:\n{job_description}\n\nATS Scores:\n{scores_str}"

            config = types.GenerateContentConfig(
                system_instruction=system_prompt,
                response_mime_type="application/json",
                response_schema=ATSAnalysisResponse,
                temperature=0.2,
            )

            response = self.client.models.generate_content(
                model=self.default_model,
                contents=contents,
                config=config,
            )

            if response and response.text:
                return ATSAnalysisResponse.model_validate_json(response.text)

            return self._get_fallback_skill_gap_analysis(resume_json, job_description)

        except Exception as e:
            print(f"Gemini API error during skill gap analysis: {e}")
            return self._get_fallback_skill_gap_analysis(resume_json, job_description)

    def start_career_coach_chat(self, resume_json: dict | str):
        """
        Initializes a GenAI Chat session with Career Coach system instructions and candidate resume context.
        """
        if not self.client:
            return None

        if isinstance(resume_json, dict):
            resume_str = json.dumps(resume_json, indent=2)
        else:
            resume_str = str(resume_json)

        system_prompt = (
            f"You are an expert AI Career Coach. The user's parsed resume data is: {resume_str}. "
            f"Use this context to give highly specific career advice, mock interview questions, and resume tips."
        )

        chat = self.client.chats.create(
            model=self.default_model,
            config=types.GenerateContentConfig(system_instruction=system_prompt)
        )
        return chat

    def send_chat_message(
        self,
        resume_json: dict | str,
        message: str,
        history: list[dict] = []
    ) -> str:
        """
        Sends a message to the AI Career Coach chat session, incorporating past conversation history and resume context.
        """
        if not self.client:
            return self._get_fallback_chat_reply(message, resume_json)

        try:
            chat = self.start_career_coach_chat(resume_json)
            if not chat:
                return self._get_fallback_chat_reply(message, resume_json)

            formatted_prompt = ""
            if history:
                formatted_prompt += "Previous Conversation History:\n"
                for turn in history:
                    role = turn.get("role") or turn.get("sender") or "User"
                    text = turn.get("text") or turn.get("content") or turn.get("message") or ""
                    if text:
                        formatted_prompt += f"- {role.capitalize()}: {text}\n"
                formatted_prompt += "\nCurrent User Message:\n"

            formatted_prompt += message

            response = chat.send_message(formatted_prompt)

            if response and response.text:
                return response.text.strip()

            return self._get_fallback_chat_reply(message, resume_json)

        except Exception as e:
            print(f"Gemini API error during career coach chat: {e}")
            return self._get_fallback_chat_reply(message, resume_json)

    def optimize_bullet(
        self,
        original_bullet: str,
        target_role: str = ""
    ) -> BulletOptimizationResponse:
        """
        Rewrites a weak resume bullet point into 3 STAR-method versions with explanations.
        """
        if not self.client:
            return self._get_fallback_bullet_optimization(original_bullet, target_role)

        try:
            system_prompt = (
                "You are an elite specialized Resume Optimizer API. "
                "The user will provide a weak resume bullet point. "
                "Rewrite it into 3 highly impactful versions using the STAR method (Situation, Task, Action, Result) "
                "tailored for the target role. For each version, provide a brief explanation of what you changed "
                "and why it is stronger so the user can review it."
            )

            contents = f"Original Bullet Point: {original_bullet}\nTarget Role: {target_role or 'General Role'}"

            config = types.GenerateContentConfig(
                system_instruction=system_prompt,
                response_mime_type="application/json",
                response_schema=BulletOptimizationResponse,
                temperature=0.3,
            )

            response = self.client.models.generate_content(
                model=self.default_model,
                contents=contents,
                config=config,
            )

            if response and response.text:
                return BulletOptimizationResponse.model_validate_json(response.text)

            return self._get_fallback_bullet_optimization(original_bullet, target_role)

        except Exception as e:
            print(f"Gemini API error during bullet optimization: {e}")
            return self._get_fallback_bullet_optimization(original_bullet, target_role)

    def generate_roadmap(
        self,
        resume_json: dict | str,
        target_role: str,
        timeframe: str = "6 months"
    ) -> LearningRoadmap:
        """
        Generates a structured learning roadmap to help candidate transition into target role within timeframe.
        """
        if not self.client:
            return self._get_fallback_roadmap(target_role, timeframe)

        try:
            if isinstance(resume_json, dict):
                resume_str = json.dumps(resume_json, indent=2)
            else:
                resume_str = str(resume_json)

            system_prompt = (
                "You are an elite Technical Career Coach. Create a deeply technical, highly personalized learning roadmap. "
                "CRITICAL RULES: "
                "1. DOMAIN STRICTNESS: The technologies, action items, and resources MUST perfectly match the domain of the Target Role. If the role is Data Science, focus entirely on ML libraries, math, and data pipelines. If it's Frontend, focus on UI frameworks, etc. "
                "2. EXACT TECH: Name specific libraries, APIs, and tools required for this specific role. Do NOT use generic terms like 'Core Skills'. "
                "3. EXACT RESOURCES: Name real, searchable courses, books, or certifications that teach these specific technologies. "
                "4. BUILD ON EXISTING: Analyze the user's resume JSON. If they already know Python, skip basic Python and move to advanced topics."
            )

            contents = f"Candidate Resume Data:\n{resume_str}\n\nTarget Role: {target_role}\nTarget Timeframe: {timeframe}"

            config = types.GenerateContentConfig(
                system_instruction=system_prompt,
                response_mime_type="application/json",
                response_schema=LearningRoadmap,
                temperature=0.7,
            )

            response = self.client.models.generate_content(
                model=self.default_model,
                contents=contents,
                config=config,
            )

            if response and response.text:
                return LearningRoadmap.model_validate_json(response.text)

            return self._get_fallback_roadmap(target_role, timeframe)

        except Exception as e:
            print(f"🚨 GEMINI API ERROR: {e}")
            print("Traceback:")
            traceback.print_exc()

            # Also print the raw text if response exists but validation failed
            if 'response' in locals() and hasattr(response, 'text'):
                print(f"RAW FAILED TEXT: {response.text}")

            return self._get_fallback_roadmap(target_role, timeframe)

    def _get_fallback_cover_letter(
        self,
        resume_json: dict | str,
        job_description: str,
        company_name: str | None = None,
        job_title: str | None = None
    ) -> str:
        applicant_name = "Applicant"
        if isinstance(resume_json, dict):
            personal_info = resume_json.get("personal_info") or resume_json.get("contact_info") or {}
            applicant_name = personal_info.get("full_name") or personal_info.get("name") or applicant_name

        company = company_name or "the Hiring Team"
        role = job_title or "this position"

        return (
            f"Dear Hiring Manager at {company},\n\n"
            f"I am writing to express my strong interest in the {role} position. "
            f"Based on my background and professional experience, I am confident that my skills "
            f"and qualifications align well with your team's goals.\n\n"
            f"My experience equips me to contribute effectively from day one. I am particularly drawn "
            f"to the opportunities presented at {company} and would welcome the chance to discuss how "
            f"my skill set can add value.\n\n"
            f"Thank you for your time and consideration. I look forward to the opportunity to connect.\n\n"
            f"Sincerely,\n{applicant_name}"
        )

    def _get_fallback_skill_gap_analysis(
        self,
        resume_json: dict | str,
        job_description: str
    ) -> ATSAnalysisResponse:
        return ATSAnalysisResponse(
            missing_skills=["Advanced Domain Keywords", "Role-Specific Tools"],
            matching_strengths=["Core Technical Foundation", "Relevant Work Experience"],
            improvement_suggestions=[
                "Incorporate exact keyword phrasing from the target job description into your skills section.",
                "Quantify your key achievements with metrics and impact numbers in your experience section.",
                "Tailor your summary statement to reflect key responsibilities specified in the posting."
            ]
        )

    def _get_fallback_chat_reply(self, message: str, resume_json: dict | str) -> str:
        applicant_name = "there"
        if isinstance(resume_json, dict):
            personal_info = resume_json.get("personal_info") or resume_json.get("contact_info") or {}
            applicant_name = personal_info.get("full_name") or personal_info.get("name") or applicant_name

        return (
            f"Hello {applicant_name}! As your AI Career Coach, I am here to guide your career path. "
            f"Regarding your question ('{message[:60]}...'), I suggest focusing on showcasing measurable impacts, "
            f"practicing the STAR method for technical & behavioral interviews, and tailoring your resume keywords for target positions."
        )

    def _get_fallback_bullet_optimization(
        self,
        original_bullet: str,
        target_role: str
    ) -> BulletOptimizationResponse:
        role = target_role or "Target Role"
        return BulletOptimizationResponse(
            options=[
                OptimizedBulletOption(
                    optimized_text=f"Architected scalable solutions for {original_bullet}, driving a 35% increase in operational efficiency.",
                    explanation_of_changes=f"Quantified performance output and utilized high-impact action verbs tailored for {role}."
                ),
                OptimizedBulletOption(
                    optimized_text=f"Spearheaded end-to-end execution of {original_bullet}, reducing processing latency by 25%.",
                    explanation_of_changes=f"Highlighted technical ownership and measurable throughput improvements required for {role}."
                ),
                OptimizedBulletOption(
                    optimized_text=f"Engineered and automated workflows for {original_bullet}, accelerating team delivery speed by 40%.",
                    explanation_of_changes=f"Emphasized automation, scalability, and team-wide productivity gains relevant to {role}."
                )
            ]
        )

    def _get_fallback_roadmap(
        self,
        target_role: str,
        timeframe: str
    ) -> LearningRoadmap:
        return LearningRoadmap(
            target_role=target_role,
            timeframe=timeframe,
            current_gap_summary=f"Technical roadmap for mastering target role requirements: {target_role}.",
            roadmap=[
                RoadmapStep(
                    time_period="Weeks 1-4",
                    topic="Advanced Framework Architecture & State Management",
                    specific_technologies=["PostgreSQL Window Functions", "Docker Compose", "Redis Caching"],
                    action_items=[
                        f"Implement advanced database indexing and query optimization for {target_role}.",
                        "Containerize multi-service applications with Docker Compose."
                    ],
                    resources=["Designing Data-Intensive Applications by Martin Kleppmann", "PostgreSQL High Performance on Udemy"]
                ),
                RoadmapStep(
                    time_period="Weeks 5-8",
                    topic="Distributed Systems & Cloud Automation",
                    specific_technologies=["Terraform", "AWS S3", "GitHub Actions CI/CD"],
                    action_items=[
                        "Automate Infrastructure as Code using Terraform blueprints.",
                        "Build automated deployment pipelines using GitHub Actions."
                    ],
                    resources=["Docker Mastery by Bret Fisher on Udemy", "Terraform Up & Running by Yevgeniy Brikman"]
                ),
                RoadmapStep(
                    time_period="Weeks 9-12",
                    topic="System Design & Production Readiness",
                    specific_technologies=["gRPC", "Kafka Event Streams", "Prometheus & Grafana"],
                    action_items=[
                        "Architect event-driven microservices using Kafka and gRPC.",
                        "Set up system observability and alerts using Prometheus and Grafana."
                    ],
                    resources=["ByteByteGo System Design Course by Alex Xu", "System Design Primer on GitHub"]
                )
            ]
        )


def generate_cover_letter(
    resume_json: dict | str,
    job_description: str,
    company_name: str | None = None,
    job_title: str | None = None,
    tone: str = "professional"
) -> str:
    """
    Helper function for backward compatibility and quick cover letter generation.
    """
    service = GeminiService()
    return service.generate_cover_letter(
        resume_json=resume_json,
        job_description=job_description,
        company_name=company_name,
        job_title=job_title,
        tone=tone
    )
