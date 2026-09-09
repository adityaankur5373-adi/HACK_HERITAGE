from fastapi import APIRouter

from app.schemas.vector import (
    StoreReportRequest,
)

from app.services.embedding_service import (
    build_problem_text,
    generate_embedding,
)

from app.services.qdrant_service import (
    store_report,
)


router = APIRouter(
    prefix="/api/ai",
    tags=["Vector"]
)


@router.post("/store-report")
def store_report_vector(
    request: StoreReportRequest
):

    problem = {
        "title": request.title,

        "description": request.description,

        "category": request.category,

        "priority": request.priority,

        "location": {
            "address": request.address,
            "city": request.city,
            "district": request.district,
            "state": request.state,
            "pincode": request.pincode,
        },
    }

    text = build_problem_text(problem)

    embedding = generate_embedding(text)

    store_report(
        report_id=request.id,
        embedding=embedding,

        payload={
            "reportId": request.id,
            "title": request.title,
            "description": request.description,
            "category": request.category,
            "priority": request.priority,
            "address": request.address,
            "city": request.city,
            "district": request.district,
            "state": request.state,
            "pincode": request.pincode,
            "status": "SUBMITTED",
        },
    )

    return {
        "success": True
    }