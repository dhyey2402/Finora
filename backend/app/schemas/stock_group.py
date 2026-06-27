from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class StockGroupCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    parent_id: Optional[int] = None
    company_id: int

class StockGroupUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=150)
    parent_id: Optional[int] = None

class StockGroupResponse(BaseModel):
    id: int
    company_id: int
    name: str
    parent_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
