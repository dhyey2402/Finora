"""
SmartERP — Authentication Schemas (Pydantic v2)
Request / response models for registration, login, and token endpoints.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


# ------------------------------------------------------------------
# Request Schemas
# ------------------------------------------------------------------
class UserRegister(BaseModel):
    """Payload for POST /auth/register."""

    name: str = Field(
        ...,
        min_length=2,
        max_length=150,
        examples=["Dhyey Patel"],
    )
    email: EmailStr = Field(
        ...,
        examples=["dhyey@smarterp.io"],
    )
    password: str = Field(
        ...,
        min_length=8,
        max_length=72,
        examples=["StrongP@ssw0rd!"],
    )


class UserLogin(BaseModel):
    """Payload for POST /auth/login."""

    email: EmailStr = Field(
        ...,
        examples=["dhyey@smarterp.io"],
    )
    password: str = Field(
        ...,
        examples=["StrongP@ssw0rd!"],
    )


# ------------------------------------------------------------------
# Response Schemas
# ------------------------------------------------------------------
class UserResponse(BaseModel):
    """Sanitised user data returned to the client (no password hash)."""

    id: int
    name: str
    email: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    """JWT token response for POST /auth/login."""

    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Decoded token payload used internally by the auth dependency."""

    email: Optional[str] = None
