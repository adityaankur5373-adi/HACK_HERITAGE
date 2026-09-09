from typing import Optional

from pydantic import BaseModel, Field


# ==========================================================
# STORE REPORT VECTOR
# ==========================================================

class StoreReportRequest(BaseModel):
    """
    Request sent from Node.js backend when a report
    is submitted and needs to be stored in Qdrant.
    """

    id: str

    title: str

    description: str

    category: str

    priority: str

    address: Optional[str] = None

    city: Optional[str] = None

    district: Optional[str] = None

    state: Optional[str] = None

    pincode: Optional[str] = None


# ==========================================================
# SEARCH SIMILAR REPORTS
# ==========================================================

class SimilarReportRequest(BaseModel):

    embedding: list[float]

    limit: int = Field(
        default=5,
        ge=1,
        le=20
    )


# ==========================================================
# VECTOR SEARCH RESULT
# ==========================================================

class SimilarReportResponse(BaseModel):

    reportId: Optional[str] = None

    title: Optional[str] = None

    category: Optional[str] = None

    district: Optional[str] = None

    state: Optional[str] = None

    status: Optional[str] = None

    score: float


# ==========================================================
# SEARCH RESPONSE
# ==========================================================

class SimilarReportsResponse(BaseModel):

    success: bool

    results: list[SimilarReportResponse]