from typing import List, Literal, Optional

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class CitizenLocation(BaseModel):
    address: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None


class ReportRequest(BaseModel):
    messages: List[ChatMessage]
    citizen_location: Optional[CitizenLocation] = None


class ProblemLocation(BaseModel):
    address: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None


class Problem(BaseModel):
    title: str
    description: str
    category: str

    priority: Literal[
        "LOW",
        "MEDIUM",
        "HIGH",
        "CRITICAL"
    ]

    location: ProblemLocation


# ---------------------------------------------
# DUPLICATE REPORT
# ---------------------------------------------

class DuplicateReport(BaseModel):
    reportId: Optional[str] = None
    title: Optional[str] = None
    category: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    status: Optional[str] = None
    score: float


# ---------------------------------------------
# DUPLICATE CHECK
# ---------------------------------------------

class DuplicateCheck(BaseModel):
    hasSimilar: bool
    matches: List[DuplicateReport] = Field(
        default_factory=list
    )


# ---------------------------------------------
# FINAL AI RESPONSE
# ---------------------------------------------
class ReportResponse(BaseModel):
    status: Literal[
        "NEEDS_MORE_INFO",
        "IRRELEVANT",
        "READY",
        "CANCELLED",
        "POSSIBLE_DUPLICATE"
    ]

    question: Optional[str] = None
    problem: Optional[Problem] = None
    duplicateCheck: Optional[DuplicateCheck] = None