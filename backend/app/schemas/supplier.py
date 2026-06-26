"""
SmartERP — Supplier Schemas
Request / response models for the Supplier Management module.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


# ------------------------------------------------------------------
# Request Schemas
# ------------------------------------------------------------------
class SupplierCreate(BaseModel):
    """Payload for POST /suppliers."""
    name: str = Field(..., min_length=1, max_length=200, description="Supplier Name")
    email: Optional[str] = Field(None, max_length=255, description="Supplier Email")
    phone: Optional[str] = Field(None, max_length=20, description="Supplier Phone")
    address: Optional[str] = Field(None, max_length=500, description="Supplier Address")
    company_id: int = Field(..., description="ID of the company this supplier belongs to")


class SupplierUpdate(BaseModel):
    """Payload for PUT /suppliers/{id}."""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    email: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    address: Optional[str] = Field(None, max_length=500)


# ------------------------------------------------------------------
# Response Schema
# ------------------------------------------------------------------
class SupplierResponse(BaseModel):
    """Supplier data returned to the client."""
    id: int
    company_id: int
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
