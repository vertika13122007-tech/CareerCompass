import re
from app.constants.skills import KNOWN_SKILLS
from app.constants.degree import KNOWN_DEGREES
from app.schemas.resume import EducationEntry, ExperienceEntry
from app.constants.patterns import (
    YEAR_PATTERN,
    CGPA_PATTERN,
    DATE_RANGE_PATTERN,
)

from app.constants.resume_section import RESUME_SECTION_HEADERS

SORTED_SKILLS = sorted(
    KNOWN_SKILLS.items(),
    key=lambda item: len(item[0]),
    reverse=True,
)

def _find_known_skills(
    text: str,
) -> list[str]:
    """
    Detect known skills inside arbitrary text using regex.
    """

    found_skills = []
    seen = set()

    text = text.lower()

    for keyword, canonical in KNOWN_SKILLS.items():

        pattern = rf"\b{re.escape(keyword)}\b"

        if re.search(pattern, text):

            if canonical not in seen:
                seen.add(canonical)
                found_skills.append(canonical)

    return found_skills

def _extract_section(
    resume_text: str,
    section_names: list[str],
) -> str:
    """
    Extracts the text belonging to a section until the next section starts.
    """

    lines = resume_text.split("\n")

    normalized_headers = {
        header.lower().strip()
        for headers in RESUME_SECTION_HEADERS.values()
        for header in headers
    }

    target_headers = {
        header.lower().strip()
        for header in section_names
    }

    collecting = False
    collected_lines = []

    for line in lines:

        current = line.strip().lower()
        current = re.sub(r"[:\-]+$","",current)

        if not collecting:
            if current in target_headers:
                collecting = True
            continue

        if current in normalized_headers:
            break

        collected_lines.append(line)

    return "\n".join(collected_lines).strip()

def _normalize_skill_list(
    skills_text: str,
) -> list[str]:

    if not skills_text:
        return []

    separators = [
        ",",
        "|",
        "•",
        "▪",
        "●",
        ";",
    ]

    for separator in separators:
        skills_text = skills_text.replace(separator, "\n")

    skills = []

    seen = set()

    for line in skills_text.split("\n"):
        skill = line.strip()
        if not skill:
            continue

        normalized = skill.lower()

        if normalized in seen:
            continue

        seen.add(normalized)

        if normalized in KNOWN_SKILLS:
            skills.append(KNOWN_SKILLS[normalized])
        else:
            skills.append(skill.title())

    return skills


def _split_education_blocks(
    education_text: str,
) -> list[str]:
    """
    Split the education section into individual education entries.
    Each entry is separated by one or more blank lines.
    Empty blocks are ignored.
    
    Leading and trailing whitespace is removed.
    """

    if not education_text:
        return []

    raw_blocks = re.split(r"\n\s*\n", education_text)

    blocks = []

    for raw_block in raw_blocks:

        block = raw_block.strip()

        if block:
            blocks.append(block)

    return blocks


def _extract_degree(
    education_block: str,
) -> str | None:
    """
    Extract the canonical degree from the first two lines of an education block.
    """

    if not education_block:
        return None

    first_two_lines = "\n".join(education_block.split("\n")[:2])

    for keyword, canonical in KNOWN_DEGREES.items():

        pattern = rf"\b{re.escape(keyword)}\b"

        if re.search(pattern, first_two_lines, re.IGNORECASE):
            return canonical

    return None


def _extract_years(
    education_block: str,
) -> tuple[int | None, int | None]:
    """
    Extract start and end years from an education block.
    """

    if not education_block:
        return None, None

    years = YEAR_PATTERN.findall(education_block)

    if not years:
        return None, None

    if len(years) == 1:
        return None, int(years[0])

    return int(years[0]), int(years[1])


def _extract_cgpa(
    education_block: str,
) -> float | None:
    """
    Extract CGPA or GPA score from an education block.
    """

    if not education_block:
        return None

    match = CGPA_PATTERN.search(education_block)

    if match:
        return float(match.group(1))

    return None


def _extract_institution(
    education_block: str,
) -> str | None:
    """
    Extract the institution name from an education block.

    Assumes that institution information is the first meaningful line
    that is not a degree, CGPA, or year.
    """

    if not education_block:
        return None

    for raw_line in education_block.split("\n"):

        line = raw_line.strip()

        if not line:
            continue

        # Skip degree line
        if _extract_degree(line) is not None:
            continue

        # Skip CGPA/GPA line
        if CGPA_PATTERN.search(line):
            continue

        # Skip lines that only contain years
        years = YEAR_PATTERN.findall(line)

        cleaned_line = YEAR_PATTERN.sub("", line).strip()

        if years and not cleaned_line:
            continue

        return line

    return None


def _split_experience_blocks(
    experience_text: str,
) -> list[str]:
    """
    Split the experience section text into individual experience blocks separated by blank lines.
    """

    if not experience_text:
        return []

    raw_blocks = re.split(r"\n\s*\n", experience_text)

    blocks = []

    for raw_block in raw_blocks:

        block = raw_block.strip()

        if block:
            blocks.append(block)

    return blocks


def _extract_experience_dates(
    block: str,
) -> tuple[str | None, str | None]:
    """
    Extract start and end dates from an experience block using DATE_RANGE_PATTERN.
    """

    if not block:
        return None, None

    match = DATE_RANGE_PATTERN.search(block)

    if not match:
        return None, None

    start_date = match.group(1).strip() if match.group(1) else None
    end_date = match.group(2).strip() if match.group(2) else None

    return start_date, end_date


def _extract_bullets(
    block: str,
) -> list[str]:
    """
    Extract bullet point descriptions from an experience block.
    """

    if not block:
        return []

    bullets = []

    bullet_chars = ("•", "-", "*", "▪", ">", "●", "–")

    for raw_line in block.split("\n"):

        line = raw_line.strip()

        if not line:
            continue

        if line.startswith(bullet_chars):

            cleaned_line = line.lstrip("•-*▪>●– ").strip()

            if cleaned_line:
                bullets.append(cleaned_line)

    return bullets


def _extract_title_and_company(
    block: str,
) -> tuple[str | None, str | None]:
    """
    Extract job title and company from the header lines of an experience block.
    """

    if not block:
        return None, None

    bullet_chars = ("•", "-", "*", "▪", ">", "●", "–")

    remaining_lines = []

    for raw_line in block.split("\n"):

        line = raw_line.strip()

        if not line:
            continue

        if line.startswith(bullet_chars):
            continue

        if DATE_RANGE_PATTERN.search(line):
            continue

        remaining_lines.append(line)

    job_title = remaining_lines[0] if len(remaining_lines) > 0 else None
    company = remaining_lines[1] if len(remaining_lines) > 1 else None

    return job_title, company


def extract_skills(
    resume_text: str,
) -> list[str]:

    section = _extract_section(
        resume_text,
        RESUME_SECTION_HEADERS["skills"],
    )

    if not section:
        return []

    return _find_known_skills(section)


def extract_education(
    resume_text: str,
) -> list[EducationEntry]:
    """
    Extract structured education entries from resume text.
    """

    section = _extract_section(
        resume_text,
        RESUME_SECTION_HEADERS["education"],
    )

    if not section:
        return []

    blocks = _split_education_blocks(section)

    education_entries = []

    for block in blocks:

        degree = _extract_degree(block)
        institution = _extract_institution(block)
        start_year, end_year = _extract_years(block)
        cgpa = _extract_cgpa(block)

        entry = EducationEntry(
            degree=degree,
            institution=institution,
            start_year=start_year,
            end_year=end_year,
            cgpa=cgpa,
        )

        education_entries.append(entry)

    return education_entries


def extract_projects(
    resume_text: str,
) -> list:
    """
    Extract projects from resume text (placeholder stub).
    """

    return []


def extract_experience(
    resume_text: str,
) -> list[ExperienceEntry]:
    """
    Extract structured work experience entries from resume text.
    """

    section = _extract_section(
        resume_text,
        RESUME_SECTION_HEADERS["experience"],
    )

    if not section:
        return []

    blocks = _split_experience_blocks(section)

    experience_entries = []

    for block in blocks:

        start_date, end_date = _extract_experience_dates(block)
        job_title, company = _extract_title_and_company(block)
        description = _extract_bullets(block)

        entry = ExperienceEntry(
            job_title=job_title,
            company=company,
            start_date=start_date,
            end_date=end_date,
            description=description,
        )

        experience_entries.append(entry)

    return experience_entries


def extract_certifications(
    resume_text: str,
) -> list:
    """
    Extract certifications from resume text (placeholder stub).
    """

    return []


def extract_languages(
    resume_text: str,
) -> list:
    """
    Extract languages from resume text (placeholder stub).
    """

    return []


PARSERS = {
    "skills": extract_skills,
    "education": extract_education,
    "projects": extract_projects,
    "experience": extract_experience,
    "certifications": extract_certifications,
    "languages": extract_languages,
}

def parse_resume(
    resume_text: str,
) -> dict:

    parsed_resume = {}

    for key, extractor in PARSERS.items():

        parsed_resume[key] = extractor(resume_text)

    return parsed_resume