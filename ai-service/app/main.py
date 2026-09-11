from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.routes.report import router as report_router
from app.routes.vector_router import router as vector_router
from app.routes.university_matching import router as university_matching_router
from app.routes.university_vector import (
    router as university_vector_router,
)
from app.routes.industry_vector import router as industry_vector_router
from app.routes.industry_matching import router as industry_matching_router
from app.services.industry_qdrant_service import create_industry_collection


@asynccontextmanager
async def lifespan(app: FastAPI):
    del app
    create_industry_collection()
    yield


app = FastAPI(
    title="JanSamadhan AI Service",
    description="AI service for citizen problem reporting",
    version="1.0.0",
    lifespan=lifespan,
)


app.include_router(report_router)
app.include_router(vector_router)
app.include_router(
    university_matching_router
)
app.include_router(
    university_vector_router
)
app.include_router(industry_vector_router)
app.include_router(industry_matching_router)

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
