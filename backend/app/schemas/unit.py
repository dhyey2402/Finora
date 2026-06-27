from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class UnitCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    abbreviation: str = Field(..., min_length=1, max_length=20)
    company_id: int

class UnitUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    abbreviation: Optional[str] = Field(None, min_length=1, max_length=20)

class UnitResponse(BaseModel):
    id: int
    company_id: int
    name: str
    abbreviation: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
