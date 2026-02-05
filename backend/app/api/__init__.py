"""
API Router - Combine all routes
"""

from fastapi import APIRouter
from app.api.routes import analysis

api_router = APIRouter()

# Include analysis routes
api_router.include_router(
    analysis.router,
    tags=["Analysis"]
)
