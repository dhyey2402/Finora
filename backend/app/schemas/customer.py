"""
SmartERP — Customer Schemas
Request / response models for the Customer Management module.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


# ------------------------------------------------------------------
# Request Schemas
# ------------------------------------------------------------------
class CustomerCreate(BaseModel):
    """Payload for POST /customers."""
    name: str = Field(..., min_length=1, max_length=200, description="Customer Name")
    email: Optional[str] = Field(None, max_length=255, description="Customer Email")
    phone: Optional[str] = Field(None, max_length=20, description="Customer Phone")
    address: Optional[str] = Field(None, max_length=500, description="Customer Address")
    company_id: int = Field(..., description="ID of the company this customer belongs to")


class CustomerUpdate(BaseModel):
    """Payload for PUT /customers/{id}."""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    email: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    address: Optional[str] = Field(None, max_length=500)


# ------------------------------------------------------------------
# Response Schema
# ------------------------------------------------------------------
class CustomerResponse(BaseModel):
    """Customer data returned to the client."""
    id: int
    company_id: int
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}