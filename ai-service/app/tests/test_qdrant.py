from app.services.qdrant_service import create_collection
from app.services.university_qdrant_service import (
    create_university_collection,
)


if __name__ == "__main__":

    try:
        # Existing report collection
        create_collection()

        # New university collection
        create_university_collection()

        print("Qdrant connection successful")
        print("All required Qdrant collections are ready")

    except Exception as error:

        print("Qdrant connection failed")
        print(error)