"""
Authentication Dependencies
Provides FastAPI dependency functions for route protection
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional

from app.core.security import decode_access_token
from app.models.schemas import TokenData, UserInDB
from app.db import get_database, use_memory_storage, memory_find_one

# HTTP Bearer token scheme
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> UserInDB:
    """
    Dependency to get the current authenticated user from JWT token.
    
    Raises HTTPException if token is invalid or user not found.
    
    Usage:
        @router.get("/protected")
        async def protected_route(current_user: UserInDB = Depends(get_current_user)):
            return {"user_id": current_user.user_id}
    """
    # Extract token from Authorization header
    token = credentials.credentials
    
    # Decode token
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Extract user info from token
    user_id: str = payload.get("user_id")
    email: str = payload.get("email")
    
    if user_id is None or email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user from database
    if use_memory_storage():
        # In-memory storage
        user_data = await memory_find_one("users", {"user_id": user_id})
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        user = UserInDB(**user_data)
    else:
        # MongoDB storage
        db = await get_database()
        user_data = await db.users.find_one({"_id": user_id})
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        user_data["user_id"] = str(user_data.pop("_id"))
        user = UserInDB(**user_data)
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    
    return user


async def get_current_active_user(
    current_user: UserInDB = Depends(get_current_user)
) -> UserInDB:
    """
    Dependency to get current active user.
    Extra check for active status (redundant but explicit).
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    return current_user


def get_optional_user():
    """
    Optional authentication - returns user if authenticated, None otherwise.
    Use for routes that work both with and without authentication.
    
    Usage:
        async def route(user: Optional[UserInDB] = Depends(get_optional_user)):
            if user:
                # User-specific logic
            else:
                # Anonymous logic
    """
    async def optional_user_dependency(
        credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))
    ) -> Optional[UserInDB]:
        if credentials is None:
            return None
        
        try:
            return await get_current_user(credentials)
        except HTTPException:
            return None
    
    return optional_user_dependency
