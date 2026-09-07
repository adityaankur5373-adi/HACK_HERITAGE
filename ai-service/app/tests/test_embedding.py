from app.services.embedding_service import (
    generate_embedding,
    build_problem_text,
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


text = build_problem_text(problem)

print("Problem text:")
print(text)

print("\nGenerating embedding...")

vector = generate_embedding(text)

print("\nEmbedding generated successfully")
print("Vector size:", len(vector))
print("First 5 values:", vector[:5])