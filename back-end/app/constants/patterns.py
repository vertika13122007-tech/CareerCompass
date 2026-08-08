import re

YEAR_PATTERN = re.compile(
    r"\b(?:19|20)\d{2}\b"
)

CGPA_PATTERN = re.compile(
    r"\b(?:CGPA|GPA)\s*[:\-]?\s*(\d+(?:\.\d+)?)",
    re.IGNORECASE,
)

_MONTH_OR_NUM = r"(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?|\d{1,2})"
_DATE_TOKEN = rf"(?:{_MONTH_OR_NUM}[\/\s\.\,-]+)?(?:19|20)\d{{2}}"

DATE_RANGE_PATTERN = re.compile(
    rf"\b({_DATE_TOKEN})\s*(?:[\-\–\—]|\bto\b)\s*({_DATE_TOKEN}|\bPresent\b|\bCurrent\b|\bOngoing\b|\bNow\b)",
    re.IGNORECASE,
)
