from fastapi import APIRouter, HTTPException

from app.services.groq_service import generate_industry_requirements
from app.services.industry_qdrant_service import search_industries_for_requirements

router = APIRouter(prefix="/api/ai", tags=["AI Industry Matching"])


def _normalize(value) -> str:
    return " ".join(str(value or "").strip().lower().split())


def _same(requirement_location: dict, candidate: dict, fields: tuple[str, ...]) -> bool:
    return all(_normalize(requirement_location.get(field)) and _normalize(requirement_location.get(field)) == _normalize(candidate.get(field)) for field in fields)


def location_score(requirement_location: dict, candidate: dict) -> float:
    location = requirement_location or {}
    if _same(location, candidate, ("area", "city", "district", "state")):
        return 1.00
    if _same(location, candidate, ("city", "district", "state")):
        return 0.85
    if _same(location, candidate, ("district", "state")):
        return 0.70
    if _same(location, candidate, ("state",)):
        return 0.55
    if _normalize(location.get("state")) and _normalize(candidate.get("state")):
        return 0.20
    return 0.0


@router.post("/industry-requirements")
def industry_requirements(data: dict):
    solution = data.get("solution") or data
    report = data.get("report") or solution.get("report") or {}
    if not isinstance(solution, dict) or not solution:
        raise HTTPException(status_code=400, detail="Approved solution data is required")
    try:
        return generate_industry_requirements(report, solution)
    except Exception as error:
        print("Industry requirement extraction error:", error)
        raise HTTPException(status_code=500, detail="Failed to generate industry requirements")


@router.post("/match-industries")
def match_industries(data: dict):
    requirements = data.get("requirements")
    if not isinstance(requirements, dict) or not requirements:
        raise HTTPException(status_code=400, detail="Industry requirements are required")
    try:
        matches = []
        for result in search_industries_for_requirements(requirements, limit=10):
            payload = result.payload or {}
            semantic_score = float(result.score)
            geographic_score = location_score(requirements.get("location") or {}, payload)
            matches.append({"industryId": payload.get("industryId"), "name": payload.get("name"), "address": payload.get("address"), "area": payload.get("area"), "city": payload.get("city"), "district": payload.get("district"), "state": payload.get("state"), "pincode": payload.get("pincode"), "skills": payload.get("skills", []), "technologies": payload.get("technologies", []), "services": payload.get("services", []), "domains": payload.get("domains", []), "semanticScore": semantic_score, "locationScore": geographic_score, "score": semantic_score * 0.75 + geographic_score * 0.25})
        matches.sort(key=lambda candidate: candidate["score"], reverse=True)
        return {"success": True, "matches": matches}
    except Exception as error:
        print("Industry matching error:", error)
        raise HTTPException(status_code=500, detail="Failed to match industries")
