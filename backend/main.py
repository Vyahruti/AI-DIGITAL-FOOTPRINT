"""
FastAPI Backend for AI Privacy Footprint Analyzer
Main application entry point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

from app.core.config import settings
from app.api import api_router
from app.db.mongodb import connect_to_mongo, close_mongo_connection
from app.llm import llm_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle startup and shutdown events"""
    # Startup
    llm_service.init_llm() # Initialize LLM service
    await connect_to_mongo()
    print("✅ Connected to MongoDB")
    print(f"🚀 Server running on http://{settings.HOST}:{settings.PORT}")
    
    yield
    
    # Shutdown
    await close_mongo_connection()
    print("👋 Disconnected from MongoDB")


# Create FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-powered privacy risk detection system using NLP, ML, and LLM",
    version=settings.VERSION,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix=settings.API_V1_STR)
app.include_router(api_router, prefix="/api")


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "message": "AI Privacy Footprint Analyzer API is running"
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "database": "connected",
        "services": {
            "nlp": "ready",
            "ml": "ready",
            "llm": "configured"
        }
    }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
