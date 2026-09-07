from fastembed import TextEmbedding


# Load model once when the service starts
embedding_model = TextEmbedding(
    model_name="BAAI/bge-small-en-v1.5"
)


def generate_embedding(text: str) -> list[float]:
    """
    Convert text into a vector embedding.
    """

    embeddings = list(
        embedding_model.embed([text])
    )

    return embeddings[0].tolist()


def build_problem_text(problem: dict) -> str:
    """
    Convert the structured AI problem into
    searchable text.
    """

    location = problem.get("location") or {}

    return f"""
Title: {problem.get("title", "")}

Description: {problem.get("description", "")}

Category: {problem.get("category", "")}

Address: {location.get("address", "")}

City: {location.get("city", "")}

District: {location.get("district", "")}

State: {location.get("state", "")}

Pincode: {location.get("pincode", "")}
""".strip()