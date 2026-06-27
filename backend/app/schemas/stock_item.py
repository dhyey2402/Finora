from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field

class StockItemCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    sku: Optional[str] = Field(None, max_length=100)
    stock_group_id: int
    unit_id: int
    quantity: Decimal = Field(default=0.0)
    rate: Decimal = Field(default=0.0)
    company_id: int

class StockItemUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    sku: Optional[str] = Field(None, max_length=100)
    stock_group_id: Optional[int] = None
    unit_id: Optional[int] = None
    quantity: Optional[Decimal] = None
    rate: Optional[Decimal] = None

class StockItemResponse(BaseModel):
    id: int
    company_id: int
    name: str
    sku: Optional[str] = None
    stock_group_id: int
    unit_id: int
    quantity: Decimal
    rate: Decimal
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
