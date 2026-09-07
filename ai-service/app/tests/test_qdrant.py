from app.services.qdrant_service import create_collection


if __name__ == "__main__":
    create_collection()

    print("Qdrant connection successful")