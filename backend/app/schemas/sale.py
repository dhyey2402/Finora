from decimal import Decimal
from datetime import date
from pydantic import BaseModel, ConfigDict
from typing import Optional, List

class SaleItemBase(BaseModel):
    stock_item_id: int
    quantity: Decimal
    rate: Decimal
    tax_amount: Decimal = Decimal('0.00')
    discount_amount: Decimal = Decimal('0.00')
    line_total: Decimal

class SaleItemCreate(SaleItemBase):
    pass

class SaleItemResponse(SaleItemBase):
    id: int
    sale_id: int
    
    model_config = ConfigDict(from_attributes=True)

class SaleBase(BaseModel):
    sale_number: str
    sale_date: date
    customer_id: int
    total_amount: Decimal
    notes: Optional[str] = None

class SaleCreate(SaleBase):
    items: List[SaleItemCreate]

class SaleUpdate(BaseModel):
    sale_number: Optional[str] = None
    sale_date: Optional[date] = None
    customer_id: Optional[int] = None
    total_amount: Optional[Decimal] = None
    notes: Optional[str] = None
    items: Optional[List[SaleItemCreate]] = None

class SaleResponse(SaleBase):
    id: int
    company_id: int
    items: List[SaleItemResponse]
    
    model_config = ConfigDict(from_attributes=True)
