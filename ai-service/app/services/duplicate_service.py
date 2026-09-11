from app.services.embedding_service import (
    generate_embedding,
    build_problem_text,
)

from app.services.qdrant_service import (
    search_similar_reports,
)


SIMILARITY_THRESHOLD = 0.85

IGNORED_STATUSES = {
    "RESOLVED",
    "REJECTED",
    "CANCELLED",
}


def _normalized(value):
    return str(value or "").strip().casefold()


def _same_problem_context(problem, payload):
    """
    Check whether an existing report is in the same
    problem context as the current report.

    A report can only be considered a possible duplicate when:
    - Category matches
    - Explicit address/locality does not conflict
    - Explicit state does not conflict
    - Explicit district does not conflict
    - Explicit city does not conflict
    - Explicit pincode does not conflict

    If the current report contains a location field but the
    existing Qdrant report does not contain that field,
    treat it as NOT a duplicate.
    """

    problem_location = problem.get("location") or {}

    # ==================================================
    # CATEGORY
    # ==================================================

    problem_category = _normalized(
        problem.get("category")
    )

    candidate_category = _normalized(
        payload.get("category")
    )

    if problem_category != candidate_category:
        return False

    # ==================================================
    # LOCATION
    # ==================================================

    for field in (
        "address",
        "state",
        "district",
        "city",
        "pincode",
    ):

        problem_value = _normalized(
            problem_location.get(field)
        )

        candidate_value = _normalized(
            payload.get(field)
        )

        # If the current report explicitly has this
        # location information, the existing report
        # must also have it.
        if problem_value:

            # Existing report does not have this field.
            # Do not assume they are the same.
            if not candidate_value:
                return False

            # Both have the field but values are different.
            if problem_value != candidate_value:
                return False

    return True


def find_similar_reports(problem: dict):

    # ==================================================
    # 1. BUILD PROBLEM TEXT
    # ==================================================

    text = build_problem_text(problem)

    # ==================================================
    # 2. GENERATE EMBEDDING
    # ==================================================

    embedding = generate_embedding(text)

    # ==================================================
    # 3. SEARCH QDRANT
    # ==================================================

    results = search_similar_reports(
        embedding,
        limit=5,
    )

    similar_reports = []

    # ==================================================
    # 4. CHECK RESULTS
    # ==================================================

    for result in results:

        payload = result.payload or {}

        status = _normalized(
            payload.get("status")
        ).upper()

        # Debug information
        print("========== QDRANT MATCH ==========")
        print("Score:", result.score)
        print("Report ID:", payload.get("reportId"))
        print("Category:", payload.get("category"))
        print("Address:", payload.get("address"))
        print("City:", payload.get("city"))
        print("District:", payload.get("district"))
        print("State:", payload.get("state"))
        print("Pincode:", payload.get("pincode"))
        print("Status:", payload.get("status"))
        print("===================================")

        # ==================================================
        # 5. SEMANTIC + STATUS + LOCATION CHECK
        # ==================================================

        if (
            result.score >= SIMILARITY_THRESHOLD
            and status not in IGNORED_STATUSES
            and _same_problem_context(
                problem,
                payload
            )
        ):

            print(
                ">>> POSSIBLE DUPLICATE:",
                payload.get("reportId")
            )

            similar_reports.append({
                "reportId": payload.get("reportId"),
                "title": payload.get("title"),
                "category": payload.get("category"),

                "address": payload.get("address"),
                "city": payload.get("city"),
                "district": payload.get("district"),
                "state": payload.get("state"),
                "pincode": payload.get("pincode"),

                "status": payload.get("status"),
                "score": result.score,
            })

        else:

            print(
                ">>> NOT A DUPLICATE:",
                payload.get("reportId")
            )

    return similar_reports