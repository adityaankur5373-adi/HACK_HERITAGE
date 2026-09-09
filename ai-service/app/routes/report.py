from fastapi import APIRouter, HTTPException

from app.schemas.report import (
    ReportRequest,
    ReportResponse,
)

from app.services.groq_service import process_report

from app.services.duplicate_service import (
    find_similar_reports,
)


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

        # ==================================================
        # 1. VALIDATE MESSAGES
        # ==================================================

        if not request.messages:
            raise HTTPException(
                status_code=400,
                detail="Messages cannot be empty"
            )

        last_message = request.messages[-1].content.strip()

        if not last_message:
            raise HTTPException(
                status_code=400,
                detail="Message cannot be empty"
            )

        # ==================================================
        # 2. CITIZEN LOCATION
        # ==================================================

        citizen_location = None

        if request.citizen_location:

            citizen_location = (
                request.citizen_location.model_dump()
            )

        # ==================================================
        # 3. CONVERT CONVERSATION
        # ==================================================

        messages = [
            {
                "role": message.role,
                "content": message.content.strip()
            }
            for message in request.messages
        ]

        # ==================================================
        # 4. SEND CONVERSATION TO GROQ
        # ==================================================

        result = process_report(
            messages,
            citizen_location
        )

        # ==================================================
        # 5. AI NEEDS MORE INFORMATION
        # ==================================================

        if result.status == "NEEDS_MORE_INFO":

            return result

        # ==================================================
        # 6. IRRELEVANT PROBLEM
        # ==================================================

        if result.status == "IRRELEVANT":

            return result

        # ==================================================
        # 7. READY → DUPLICATE CHECK
        # ==================================================

        if (
            result.status == "READY"
            and result.problem
        ):

            problem = result.problem.model_dump()

            print(
                "AI determined problem is READY."
            )

            print(
                "Checking Qdrant for similar reports..."
            )

            similar_reports = find_similar_reports(
                problem
            )

            print(
                "Similar reports found:",
                len(similar_reports)
            )

            # ==================================================
            # 8. POSSIBLE DUPLICATE
            # ==================================================

            if similar_reports:

                print(
                    "Possible duplicate detected."
                )

                return {
                    "status": "POSSIBLE_DUPLICATE",

                    "question": None,

                    "problem": result.problem,

                    "duplicateCheck": {
                        "hasSimilar": True,
                        "matches": similar_reports,
                    },
                }

            # ==================================================
            # 9. NO DUPLICATE
            # ==================================================

            print(
                "No similar report found."
            )

            return result

        # ==================================================
        # 10. FALLBACK
        # ==================================================

        return result

    except HTTPException:
        raise

    except Exception as error:

        print(
            "AI Report Error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to process the problem"
        )