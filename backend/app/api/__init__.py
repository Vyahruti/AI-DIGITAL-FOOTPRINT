"""
API Router - Combine all routes
"""

from fastapi import APIRouter
from app.api.routes import analysis, auth

api_router = APIRouter()

# Include authentication routes
api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["Authentication"]
)

# Include analysis routes
api_router.include_router(
    analysis.router,
    tags=["Analysis"]
)
