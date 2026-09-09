from app.services.embedding_service import (
    generate_embedding,
)

from app.services.qdrant_service import (
    search_similar_reports,
)


new_problem = """
There is a huge pothole close to the
government school in Gumla. People are
having trouble using the road.
"""


embedding = generate_embedding(new_problem)


results = search_similar_reports(
    embedding,
    limit=5,
)


print("\nSimilar reports:\n")


for result in results:

    print("----------------------------")

    print("Report ID:", result.id)

    print("Similarity:", result.score)

    print("Payload:", result.payload)