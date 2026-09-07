from typing import List, Literal, Optional

from pydantic import BaseModel


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class CitizenLocation(BaseModel):
    """
    Trusted location from the backend/JWT-authenticated
    citizen profile.

    This is NOT automatically the problem location.
    """

    address: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None


class ReportRequest(BaseModel):
    """
    Conversation sent from Express to FastAPI.
    """

    messages: List[ChatMessage]

    citizen_location: Optional[CitizenLocation] = None


class ProblemLocation(BaseModel):
    """
    Actual location where the problem is occurring.

    This must NOT be confused with the citizen's
    registered location.
    """

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


class ReportResponse(BaseModel):
    status: Literal[
        "NEEDS_MORE_INFO",
        "IRRELEVANT",
        "READY",
        "CANCELLED"
    ]

    question: Optional[str] = None
    problem: Optional[Problem] = None
  