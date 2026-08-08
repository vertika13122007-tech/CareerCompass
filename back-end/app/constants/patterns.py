import re

YEAR_PATTERN = re.compile(
    r"\b(?:19|20)\d{2}\b"
)

CGPA_PATTERN = re.compile(
    r"\b(?:CGPA|GPA)\s*[:\-]?\s*(\d+(?:\.\d+)?)",
    re.IGNORECASE,
)
