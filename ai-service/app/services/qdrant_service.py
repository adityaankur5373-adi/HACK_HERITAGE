import os

from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    VectorParams,
    PointStruct,
)

load_dotenv()


QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")

QDRANT_COLLECTION = os.getenv(
    "QDRANT_COLLECTION",
    "jan_samadhan_reports"
)


if not QDRANT_URL:
    raise RuntimeError("QDRANT_URL is missing")

if not QDRANT_API_KEY:
    raise RuntimeError("QDRANT_API_KEY is missing")


client = QdrantClient(
    url=QDRANT_URL,
    api_key=QDRANT_API_KEY,
)


VECTOR_SIZE = 384


def create_collection():

    collections = client.get_collections()

    exists = any(
        collection.name == QDRANT_COLLECTION
        for collection in collections.collections
    )

    if exists:
        print(
            f"Collection already exists: "
            f"{QDRANT_COLLECTION}"
        )
        return

    client.create_collection(
        collection_name=QDRANT_COLLECTION,
        vectors_config=VectorParams(
            size=VECTOR_SIZE,
            distance=Distance.COSINE,
        ),
    )

    print(
        f"Collection created: "
        f"{QDRANT_COLLECTION}"
    )


def store_report(
    report_id: str,
    embedding: list[float],
    payload: dict,
):

    client.upsert(
        collection_name=QDRANT_COLLECTION,
        points=[
            PointStruct(
                id=report_id,
                vector=embedding,
                payload=payload,
            )
        ],
    )


def search_similar_reports(
    embedding: list[float],
    limit: int = 5,
):

    result = client.query_points(
        collection_name=QDRANT_COLLECTION,
        query=embedding,
        limit=limit,
        with_payload=True,
    )

    return result.points