from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel


class AuditLogResponse(BaseModel):
    id: int
    company_id: Optional[int] = None
    user_id: Optional[int] = None
    action: str
    table_name: str
    record_id: Optional[int] = None
    details: Optional[Dict[str, Any]] = None
    timestamp: datetime

    model_config = {"from_attributes": True}
