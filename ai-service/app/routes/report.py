from fastapi import APIRouter, HTTPException

from app.schemas.report import (
    ReportRequest,
    ReportResponse,
)

from app.services.groq_service import process_report


router = APIRouter(
    prefix="/api/ai",
    tags=["AI Problem Reporting"]
)


@router.post(
    "/report",
    response_model=ReportResponse
)
def report_problem(request: ReportRequest):

    try:

        # ---------------------------------------------
        # CHECK MESSAGES
        # ---------------------------------------------

        if not request.messages:
            raise HTTPException(
                status_code=400,
                detail="Messages cannot be empty"
            )

        # ---------------------------------------------
        # CHECK LAST MESSAGE
        # ---------------------------------------------

        if not request.messages[-1].content.strip():
            raise HTTPException(
                status_code=400,
                detail="Message cannot be empty"
            )

        # ---------------------------------------------
        # CITIZEN LOCATION
        # ---------------------------------------------

        citizen_location = None

        if request.citizen_location:

            citizen_location = (
                request.citizen_location.model_dump()
            )

        # ---------------------------------------------
        # CONVERT MESSAGES
        # ---------------------------------------------

        messages = [
            {
                "role": message.role,
                "content": message.content.strip()
            }
            for message in request.messages
        ]

        # ---------------------------------------------
        # SEND CONVERSATION TO GROQ
        # ---------------------------------------------

        result = process_report(
            messages,
            citizen_location
        )

        return result

    except HTTPException:
        raise

    except Exception as error:

        print("AI Report Error:", error)

        raise HTTPException(
            status_code=500,
            detail="Failed to process the problem"
        )