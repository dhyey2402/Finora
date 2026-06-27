from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

class GroupCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    code: Optional[str] = Field(None, max_length=50)
    parent_id: Optional[int] = None
    company_id: int

class GroupUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=150)
    code: Optional[str] = Field(None, max_length=50)
    parent_id: Optional[int] = None

class GroupResponse(BaseModel):
    id: int
    company_id: int
    name: str
    code: Optional[str] = None
    parent_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    
    child_count: Optional[int] = 0
    ledger_count: Optional[int] = 0

    model_config = {"from_attributes": True}
