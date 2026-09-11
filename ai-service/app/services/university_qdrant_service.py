import os
import uuid

from dotenv import load_dotenv

from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    VectorParams,
    PointStruct,
)

from app.services.embedding_service import generate_embedding


load_dotenv()


# ==========================================================
# QDRANT CONFIGURATION
# ==========================================================

QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")

UNIVERSITY_COLLECTION = os.getenv(
    "QDRANT_UNIVERSITY_COLLECTION",
    "jan_samadhan_universities",
)


if not QDRANT_URL:
    raise RuntimeError(
        "QDRANT_URL is not configured"
    )

if not QDRANT_API_KEY:
    raise RuntimeError(
        "QDRANT_API_KEY is not configured"
    )


client = QdrantClient(
    url=QDRANT_URL,
    api_key=QDRANT_API_KEY,
    timeout=60,
)


# BAAI/bge-small-en-v1.5 = 384 dimensions
VECTOR_SIZE = 384


# ==========================================================
# CREATE UNIVERSITY COLLECTION
# ==========================================================

def create_university_collection():

    collections = client.get_collections()

    existing_names = {
        collection.name
        for collection in collections.collections
    }

    if UNIVERSITY_COLLECTION in existing_names:

        print(
            f"Qdrant collection already exists: "
            f"{UNIVERSITY_COLLECTION}"
        )

        return


    client.create_collection(
        collection_name=UNIVERSITY_COLLECTION,
        vectors_config=VectorParams(
            size=VECTOR_SIZE,
            distance=Distance.COSINE,
        ),
    )


    print(
        f"Created Qdrant collection: "
        f"{UNIVERSITY_COLLECTION}"
    )


# ==========================================================
# BUILD UNIVERSITY CAPABILITY TEXT
# ==========================================================

def build_university_capability_text(
    university: dict,
) -> str:
    """
    Convert university capabilities into searchable text.
    """

    capabilities = university.get(
        "capabilities",
        [],
    )

    capability_text = []

    for capability in capabilities:

        capability_type = str(
            capability.get("type", "")
        ).strip()

        value = str(
            capability.get("value", "")
        ).strip()

        if capability_type and value:

            capability_text.append(
                f"{capability_type}: {value}"
            )


    return f"""
University: {university.get("name", "")}

Department: {university.get("department", "")}

City: {university.get("city", "")}

District: {university.get("district", "")}

State: {university.get("state", "")}

Skills:
{", ".join(
    university.get("skills", [])
)}

Research Areas:
{", ".join(
    university.get("researchAreas", [])
)}

Technologies:
{", ".join(
    university.get("technologies", [])
)}

Departments:
{", ".join(
    university.get("departments", [])
)}

Capabilities:
{chr(10).join(capability_text)}
""".strip()


# ==========================================================
# STORE UNIVERSITY
# ==========================================================

def store_university(
    university_id: str,
    university: dict,
):
    """
    Generate an embedding for a university's
    capabilities and store it in Qdrant.
    """

    text = build_university_capability_text(
        university
    )


    # Generate 384-dimensional embedding
    embedding = generate_embedding(text)


    # Keep one stable point per university while allowing its payload/vector to change.
    point_id = str(
        uuid.uuid5(
            uuid.NAMESPACE_URL,
            f"jan-samadhan-university:{university_id}",
        )
    )


    payload = {
        "universityId": university_id,

        "name": university.get("name"),

        "city": university.get("city"),

        "district": university.get("district"),

        "state": university.get("state"),

        "pincode": university.get("pincode"),

        "skills": university.get(
            "skills",
            [],
        ),

        "researchAreas": university.get(
            "researchAreas",
            [],
        ),

        "technologies": university.get(
            "technologies",
            [],
        ),

        "departments": university.get(
            "departments",
            [],
        ),
    }


    client.upsert(
        collection_name=UNIVERSITY_COLLECTION,

        points=[
            PointStruct(
                id=point_id,
                vector=embedding,
                payload=payload,
            )
        ],
    )


    print(
        "University embedding stored:",
        university_id,
    )


    return point_id


# ==========================================================
# SEARCH SIMILAR UNIVERSITIES
# ==========================================================

def search_similar_universities(
    embedding: list[float],
    limit: int = 10,
):
    """
    Search Qdrant for universities whose
    capabilities are semantically similar
    to the required capabilities.
    """

    result = client.query_points(
        collection_name=UNIVERSITY_COLLECTION,

        query=embedding,

        limit=limit,

        with_payload=True,
    )


    return result.points


def build_university_requirement_text(
    requirements: dict,
) -> str:

    return f"""
Skills:
{", ".join(
    requirements.get("skills", [])
)}

Research Areas:
{", ".join(
    requirements.get("researchAreas", [])
)}

Technologies:
{", ".join(
    requirements.get("technologies", [])
)}

Departments:
{", ".join(
    requirements.get("departments", [])
)}
""".strip()


def search_universities_for_requirements(
    requirements: dict,
    limit: int = 10,
):

    text = build_university_requirement_text(
        requirements
    )

    embedding = generate_embedding(text)

    return search_similar_universities(
        embedding,
        limit=limit,
    )