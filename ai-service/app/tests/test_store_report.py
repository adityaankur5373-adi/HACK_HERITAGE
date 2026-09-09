from app.services.embedding_service import (
    generate_embedding,
    build_problem_text,
)

from app.services.qdrant_service import (
    store_report,
)


problem = {
    "title": "Large pothole near school",

    "description": (
        "A large pothole is present near "
        "the government school and residents "
        "are having difficulty using the road."
    ),

    "category": "ROAD",

    "location": {
        "address": "Near Government School",
        "city": "Gumla",
        "district": "Gumla",
        "state": "Jharkhand",
        "pincode": "835207",
    },
}


# --------------------------------------------------
# 1. Convert problem → searchable text
# --------------------------------------------------

text = build_problem_text(problem)

print("Problem text:")
print(text)


# --------------------------------------------------
# 2. Convert text → embedding vector
# --------------------------------------------------

embedding = generate_embedding(text)

print("\nEmbedding generated")
print("Vector size:", len(embedding))


# --------------------------------------------------
# 3. Store embedding in Qdrant
# --------------------------------------------------

qdrant_point_id = store_report(
    report_id="test-report-001",

    embedding=embedding,

    payload={
        "title": problem["title"],
        "description": problem["description"],
        "category": problem["category"],
        "district": problem["location"]["district"],
        "state": problem["location"]["state"],
        "status": "SUBMITTED",
    },
)


print("\nReport stored successfully!")
print("Qdrant point ID:", qdrant_point_id)