from fastapi import APIRouter, HTTPException

from app.services.university_qdrant_service import (
    store_university,
)


router = APIRouter(
    prefix="/api/ai",
    tags=["AI University Vector"]
)


@router.post("/store-university")
def store_university_vector(data: dict):

    try:

        university_id = data.get("universityId")
        university = data.get("university")

        if not university_id:
            raise HTTPException(
                status_code=400,
                detail="universityId is required",
            )

        if not university:
            raise HTTPException(
                status_code=400,
                detail="University data is required",
            )

        point_id = store_university(
            university_id,
            university,
        )

        return {
            "success": True,
            "message": "University embedding stored successfully",
            "universityId": university_id,
            "pointId": point_id,
        }

    except HTTPException:
        raise

    except Exception as error:

        print(
            "University vector storage error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to store university embedding",
        )