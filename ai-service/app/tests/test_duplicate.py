from app.services.duplicate_service import (
    find_similar_reports,
)


problem = {
    "title": "Huge pothole near school",

    "description": (
        "There is a very large pothole near "
        "the government school and people are "
        "having difficulty using the road."
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


results = find_similar_reports(problem)


print("\nSimilar reports:")

for report in results:
    print("-------------------------")
    print("Report ID:", report["reportId"])
    print("Title:", report["title"])
    print("Category:", report["category"])
    print("District:", report["district"])
    print("Similarity:", report["score"])