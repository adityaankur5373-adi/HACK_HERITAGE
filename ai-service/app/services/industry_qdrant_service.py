import os
import uuid

from qdrant_client import QdrantClient
from qdrant_client.models import Distance, PointStruct, VectorParams

from app.services.embedding_service import generate_embedding

QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
INDUSTRY_COLLECTION = os.getenv("QDRANT_INDUSTRY_COLLECTION", "jan_samadhan_industries")
VECTOR_SIZE = 384

if not QDRANT_URL:
    raise RuntimeError("QDRANT_URL is not configured")
if not QDRANT_API_KEY:
    raise RuntimeError("QDRANT_API_KEY is not configured")

client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY, timeout=60)


def create_industry_collection():
    existing_names = {item.name for item in client.get_collections().collections}
    if INDUSTRY_COLLECTION not in existing_names:
        client.create_collection(
            collection_name=INDUSTRY_COLLECTION,
            vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE),
        )
        print(f"Created Qdrant collection: {INDUSTRY_COLLECTION}")


def _values_for(industry: dict, category: str) -> list[str]:
    direct = industry.get(category, [])
    values = [str(value).strip() for value in direct if str(value).strip()] if isinstance(direct, list) else []
    aliases = {
        "skills": {"SKILL", "SKILLS"},
        "technologies": {"TECHNOLOGY", "TECHNOLOGIES", "TECH"},
        "services": {"SERVICE", "SERVICES"},
        "domains": {"DOMAIN", "DOMAINS", "INDUSTRY", "SECTOR"},
    }
    for capability in industry.get("capabilities") or []:
        if not isinstance(capability, dict):
            continue
        if str(capability.get("type", "")).strip().upper() in aliases[category]:
            value = str(capability.get("value", "")).strip()
            if value:
                values.append(value)
    return list(dict.fromkeys(values))


def _location_text(location: dict) -> str:
    return ", ".join(str(location.get(field) or "").strip() for field in ("area", "city", "district", "state", "pincode") if str(location.get(field) or "").strip())


def build_industry_capability_text(industry: dict) -> str:
    return f'''Industry:
{industry.get("name", "") or ""}

Skills:
{", ".join(_values_for(industry, "skills"))}

Technologies:
{", ".join(_values_for(industry, "technologies"))}

Services:
{", ".join(_values_for(industry, "services"))}

Domains:
{", ".join(_values_for(industry, "domains"))}

Location:
{_location_text(industry)}'''.strip()


def store_industry(industry_id: str, industry: dict) -> str:
    create_industry_collection()
    point_id = str(uuid.uuid5(uuid.NAMESPACE_URL, f"jan-samadhan-industry:{industry_id}"))
    payload = {
        "industryId": industry_id, "name": industry.get("name"), "address": industry.get("address"),
        "area": industry.get("area"), "city": industry.get("city"), "district": industry.get("district"),
        "state": industry.get("state"), "pincode": industry.get("pincode"),
        "skills": _values_for(industry, "skills"), "technologies": _values_for(industry, "technologies"),
        "services": _values_for(industry, "services"), "domains": _values_for(industry, "domains"),
    }
    client.upsert(collection_name=INDUSTRY_COLLECTION, points=[PointStruct(id=point_id, vector=generate_embedding(build_industry_capability_text(industry)), payload=payload)])
    return point_id


def build_industry_requirement_text(requirements: dict) -> str:
    location = requirements.get("location") or {}
    context = requirements.get("solutionContext") or requirements.get("solution_context") or ""
    return f'''Skills:
{", ".join(requirements.get("skills") or [])}

Technologies:
{", ".join(requirements.get("technologies") or [])}

Services:
{", ".join(requirements.get("services") or [])}

Domains:
{", ".join(requirements.get("domains") or [])}

Solution context:
{context}

Location:
{_location_text(location)}'''.strip()


def search_industries_for_requirements(requirements: dict, limit: int = 10):
    # The query embedding is temporary and is never inserted into this collection.
    embedding = generate_embedding(build_industry_requirement_text(requirements))
    return client.query_points(collection_name=INDUSTRY_COLLECTION, query=embedding, limit=limit, with_payload=True).points
