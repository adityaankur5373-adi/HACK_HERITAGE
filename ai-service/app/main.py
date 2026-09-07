from fastapi import FastAPI

from app.routes.report import router as report_router


app = FastAPI(
    title="JanSamadhan AI Service",
    description="AI service for citizen problem reporting",
    version="1.0.0"
)


app.include_router(report_router)


@app.get("/")
def root():

    return {
        "success": True,
        "message": "JanSamadhan AI Service is running"
    }


@app.get("/health")
def health():

    return {
        "success": True,
        "status": "healthy"
    }