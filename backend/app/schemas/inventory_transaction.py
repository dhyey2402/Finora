from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field
from app.models.enums import TransactionTypeEnum

class InventoryTransactionCreate(BaseModel):
    stock_item_id: int
    purchase_id: Optional[int] = None
    sale_id: Optional[int] = None
    transaction_type: TransactionTypeEnum
    transaction_date: date
    quantity: Decimal
    rate: Decimal
    notes: Optional[str] = None
    company_id: int

class InventoryTransactionResponse(BaseModel):
    id: int
    company_id: int
    stock_item_id: int
    purchase_id: Optional[int] = None
    sale_id: Optional[int] = None
    transaction_type: TransactionTypeEnum
    transaction_date: date
    quantity: Decimal
    rate: Decimal
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
