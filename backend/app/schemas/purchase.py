from decimal import Decimal
from datetime import date
from pydantic import BaseModel, ConfigDict
from typing import Optional, List

class PurchaseItemBase(BaseModel):
    stock_item_id: int
    quantity: Decimal
    rate: Decimal
    tax_amount: Decimal = Decimal('0.00')
    discount_amount: Decimal = Decimal('0.00')
    line_total: Decimal

class PurchaseItemCreate(PurchaseItemBase):
    pass

class PurchaseItemResponse(PurchaseItemBase):
    id: int
    purchase_id: int
    
    model_config = ConfigDict(from_attributes=True)


class PurchaseBase(BaseModel):
    purchase_number: str
    purchase_date: date
    supplier_id: int
    total_amount: Decimal
    notes: Optional[str] = None

class PurchaseCreate(PurchaseBase):
    items: List[PurchaseItemCreate]

class PurchaseUpdate(BaseModel):
    purchase_number: Optional[str] = None
    purchase_date: Optional[date] = None
    supplier_id: Optional[int] = None
    total_amount: Optional[Decimal] = None
    notes: Optional[str] = None
    items: Optional[List[PurchaseItemCreate]] = None

class PurchaseResponse(PurchaseBase):
    id: int
    company_id: int
    items: List[PurchaseItemResponse]
    
    model_config = ConfigDict(from_attributes=True)
