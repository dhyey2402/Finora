from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from decimal import Decimal

class LedgerCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    code: Optional[str] = Field(None, max_length=50)
    group_id: int
    company_id: int
    opening_balance: Decimal = Field(default=0.00, ge=0)
    is_active: bool = True

class LedgerUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    code: Optional[str] = Field(None, max_length=50)
    group_id: Optional[int] = None
    opening_balance: Optional[Decimal] = Field(None, ge=0)
    is_active: Optional[bool] = None

class LedgerResponse(BaseModel):
    id: int
    company_id: int
    group_id: int
    name: str
    code: Optional[str] = None
    opening_balance: Decimal
    current_balance: Decimal
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
