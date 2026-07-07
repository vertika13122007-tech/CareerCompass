from pydantic import BaseModel
from pydantic import ConfigDict
from enum import Enum


class WorkMode(str,Enum):
    REMOTE = "Remote"
    HYBRID = "Hybrid"
    ON_SITE = "On-Site"


class EmploymentType(str, Enum):
    INTERNSHIP = "Internship"
    FULL_TIME = "Full-time"
    PART_TIME = "Part-Time"
    CONTACT = "Contract"


class JobPreferenceCreateRequest(BaseModel):
    preferred_roles: str
    preferred_locations: str | None = None
    preferred_industries: str | None = None
    work_mode: WorkMode | None = None
    employment_type: EmploymentType | None = None
    expected_salary_lpa: float | None = None

    model_config = ConfigDict(from_attributes=True)


class JobPreferenceUpdateRequest(BaseModel):
    preferred_roles: str | None = None
    preferred_locations: str | None = None
    preferred_industries: str | None = None
    work_mode: WorkMode | None = None
    employment_type: EmploymentType | None = None
    expected_salary_lpa: float | None = None

    model_config = ConfigDict(from_attributes=True)


class JobPreferenceResponse(BaseModel):
    preferred_roles: str | None = None
    preferred_locations: str | None = None
    preferred_industries: str | None = None
    work_mode: WorkMode | None = None
    employment_type: EmploymentType | None = None
    expected_salary_lpa: float | None = None

    model_config = ConfigDict(from_attributes=True)