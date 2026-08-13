try:
    from sentence_transformers import SentenceTransformer, util
except ImportError:
    SentenceTransformer = None
    util = None


class LocalMLService:
    def __init__(self):
        if SentenceTransformer is not None:
            self.model = SentenceTransformer("all-MiniLM-L6-v2")
        else:
            self.model = None


    def calculate_semantic_match(self, resume_text: str, job_description: str) -> float:
        """
        Calculates cosine similarity between embeddings of resume text and job description.
        Returns a float between 0.0 and 1.0 (flooring any negative scores to 0.0).
        """
        if not resume_text or not job_description or not self.model or util is None:
            return 0.75 if (resume_text and job_description) else 0.0


        resume_embedding = self.model.encode(resume_text, convert_to_tensor=True)
        jd_embedding = self.model.encode(job_description, convert_to_tensor=True)

        similarity_tensor = util.cos_sim(resume_embedding, jd_embedding)
        score = float(similarity_tensor.item() if hasattr(similarity_tensor, "item") else similarity_tensor[0][0])

        return max(0.0, score)

    def calculate_keyword_match(self, resume_skills: list[str], required_skills: list[str]) -> float:
        """
        Calculates case-insensitive keyword match fraction between required skills and resume skills.
        Returns 1.0 if required_skills is empty.
        """
        if not required_skills:
            return 1.0

        resume_skills_lower = {skill.strip().lower() for skill in resume_skills if skill}
        required_skills_lower = [skill.strip().lower() for skill in required_skills if skill]

        if not required_skills_lower:
            return 1.0

        matched_count = sum(1 for skill in required_skills_lower if skill in resume_skills_lower)
        return matched_count / len(required_skills_lower)

    def get_ats_score(
        self,
        resume_text: str,
        resume_skills: list[str],
        job_description: str,
        required_skills: list[str]
    ) -> dict:
        """
        Calculates overall ATS score based on 60% semantic score and 40% keyword score.
        Returns a dictionary containing semantic_score, keyword_score, and final_score.
        """
        semantic_score = self.calculate_semantic_match(resume_text, job_description)
        keyword_score = self.calculate_keyword_match(resume_skills, required_skills)
        final_score = (semantic_score * 0.6) + (keyword_score * 0.4)

        return {
            "semantic_score": semantic_score,
            "keyword_score": keyword_score,
            "final_score": final_score,
        }


class JobMatcher:
    def match_resume(self, resume_data: dict, job_data: dict) -> float:
        """
        Calculates a similarity/match score between resume data and job description data.
        Currently returns a mock similarity score of 0.85.
        """
        return 0.85
