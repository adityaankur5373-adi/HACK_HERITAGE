from app.services.embedding_service import (
    generate_embedding,
    build_problem_text,
)

from app.services.qdrant_service import (
    search_similar_reports,
)


SIMILARITY_THRESHOLD = 0.90
IGNORED_STATUSES = {"RESOLVED", "REJECTED", "CANCELLED"}


def _normalized(value):
    return str(value or "").strip().casefold()


def _same_problem_context(problem, payload):
    problem_location = problem.get("location") or {}

    problem_category = _normalized(problem.get("category"))
    candidate_category = _normalized(payload.get("category"))

    if problem_category and candidate_category and problem_category != candidate_category:
        return False

    for field in ("state", "district", "city"):
        problem_value = _normalized(problem_location.get(field))
        candidate_value = _normalized(payload.get(field))

        if problem_value and candidate_value and problem_value != candidate_value:
            return False

    return True


def find_similar_reports(problem: dict):

    # 1. Convert structured problem to text
    text = build_problem_text(problem)

    # 2. Generate embedding
    embedding = generate_embedding(text)

    # 3. Search Qdrant
    results = search_similar_reports(
        embedding,
        limit=5,
    )

    similar_reports = []

    for result in results:
        payload = result.payload or {}
        status = _normalized(payload.get("status")).upper()

        if (
            result.score >= SIMILARITY_THRESHOLD
            and status not in IGNORED_STATUSES
            and _same_problem_context(problem, payload)
        ):

            similar_reports.append({
                "reportId": payload.get("reportId"),
                "title": payload.get("title"),
                "category": payload.get("category"),
                "district": payload.get("district"),
                "state": payload.get("state"),
                "status": payload.get("status"),
                "score": result.score,
            })

    return similar_reports