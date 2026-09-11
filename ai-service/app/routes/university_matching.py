from fastapi import APIRouter, HTTPException

from app.services.groq_service import (
    generate_university_requirements
)

from app.services.university_qdrant_service import (
    search_universities_for_requirements
)


router = APIRouter(
    prefix="/api/ai",
    tags=["AI University Matching"]
)


# ==========================================================
# GENERATE UNIVERSITY REQUIREMENTS
# ==========================================================

@router.post("/university-requirements")
def university_requirements(report: dict):

    try:

        result = generate_university_requirements(
            report
        )

        return result

    except Exception as error:

        print(
            "University requirement extraction error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to generate university requirements"
        )


# ==========================================================
# MATCH UNIVERSITIES
# ==========================================================

@router.post("/match-universities")
def match_universities(data: dict):

    try:

        requirements = data.get(
            "requirements"
        )

        if not requirements:
            raise HTTPException(
                status_code=400,
                detail="University requirements are required"
            )


        # --------------------------------------------------
        # Search Qdrant using requirement embedding
        # --------------------------------------------------

        results = search_universities_for_requirements(
            requirements,
            limit=10
        )


        matches = []


        # --------------------------------------------------
        # Convert Qdrant results into API response
        # --------------------------------------------------

        for result in results:

            payload = result.payload or {}


            matches.append({

                "universityId": payload.get(
                    "universityId"
                ),

                "name": payload.get(
                    "name"
                ),

                "city": payload.get(
                    "city"
                ),

                "district": payload.get(
                    "district"
                ),

                "state": payload.get(
                    "state"
                ),

                "pincode": payload.get(
                    "pincode"
                ),

                "skills": payload.get(
                    "skills",
                    []
                ),

                "researchAreas": payload.get(
                    "researchAreas",
                    []
                ),

                "technologies": payload.get(
                    "technologies",
                    []
                ),

                "departments": payload.get(
                    "departments",
                    []
                ),

                "score": result.score

            })


        return {

            "success": True,

            "matches": matches

        }


    except HTTPException:

        raise


    except Exception as error:

        print(
            "University matching error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to match universities"
        )