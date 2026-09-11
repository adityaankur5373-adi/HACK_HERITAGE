from fastapi import APIRouter, HTTPException

from app.services.industry_qdrant_service import store_industry

router = APIRouter(prefix="/api/ai", tags=["AI Industry Vector"])


@router.post("/store-industry")
def store_industry_vector(data: dict):
    industry_id = data.get("industryId")
    industry = data.get("industry")
    if not isinstance(industry_id, str) or not industry_id.strip():
        raise HTTPException(status_code=400, detail="industryId is required")
    if not isinstance(industry, dict) or not industry:
        raise HTTPException(status_code=400, detail="Industry data is required")
    try:
        point_id = store_industry(industry_id, industry)
        return {"success": True, "industryId": industry_id, "pointId": point_id}
    except Exception as error:
        print("Industry vector storage error:", error)
        raise HTTPException(status_code=500, detail="Failed to store industry embedding")
