"""
SmartERP — Company Schemas (Pydantic v2)
Request / response models for the Company Management module.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


# ------------------------------------------------------------------
# Request Schemas
# ------------------------------------------------------------------
class CompanyCreate(BaseModel):
    """Payload for POST /companies."""

    name: str = Field(
        ...,
        min_length=1,
        max_length=255,
        examples=["Acme Industries Pvt. Ltd."],
        description="Legal name of the company",
    )
    address: Optional[str] = Field(
        None,
        max_length=500,
        examples=["123 Business Park, Ahmedabad, Gujarat"],
        description="Registered address",
    )
    contact_number: Optional[str] = Field(
        None,
        max_length=20,
        examples=["+91-9876543210"],
        description="Primary contact number",
    )
    state: Optional[str] = Field(
        None,
        max_length=100,
        examples=["Gujarat"],
        description="State of registration (for GST / tax purposes)",
    )
    gst_number: Optional[str] = Field(
        None,
        max_length=15,
        examples=["24AAACC1206D1Z1"],
        description="GST Registration Number",
    )
    financial_year: Optional[str] = Field(
        None,
        max_length=9,
        examples=["2023-2024"],
        description="Current financial year for the company",
    )


class CompanyUpdate(BaseModel):
    """Payload for PUT /companies/{company_id}.
    All fields are optional — only supplied fields are updated.
    """

    name: Optional[str] = Field(
        None,
        min_length=1,
        max_length=255,
        examples=["Acme Industries Pvt. Ltd."],
    )
    address: Optional[str] = Field(
        None,
        max_length=500,
        examples=["456 Tech Hub, Surat, Gujarat"],
    )
    contact_number: Optional[str] = Field(
        None,
        max_length=20,
        examples=["+91-9876543210"],
    )
    state: Optional[str] = Field(
        None,
        max_length=100,
        examples=["Gujarat"],
    )
    gst_number: Optional[str] = Field(
        None,
        max_length=15,
        examples=["24AAACC1206D1Z1"],
    )
    financial_year: Optional[str] = Field(
        None,
        max_length=9,
        examples=["2023-2024"],
    )


# ------------------------------------------------------------------
# Response Schema
# ------------------------------------------------------------------
class CompanyResponse(BaseModel):
    """Sanitised company data returned to the client."""

    id: int
    name: str
    address: Optional[str] = None
    contact_number: Optional[str] = None
    state: Optional[str] = None
    gst_number: Optional[str] = None
    financial_year: Optional[str] = None
    is_active: bool
    user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
