from decimal import Decimal
from datetime import date
from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from app.models.enums import InvoiceStatusEnum

class InvoiceItemBase(BaseModel):
    stock_item_id: int
    quantity: Decimal
    rate: Decimal
    tax_amount: Decimal = Decimal('0.00')
    discount_amount: Decimal = Decimal('0.00')
    line_total: Decimal

class InvoiceItemCreate(InvoiceItemBase):
    pass

class InvoiceItemResponse(InvoiceItemBase):
    id: int
    invoice_id: int
    
    model_config = ConfigDict(from_attributes=True)

class InvoiceBase(BaseModel):
    invoice_number: str
    invoice_date: date
    due_date: Optional[date] = None
    customer_id: int
    sale_id: Optional[int] = None
    total_amount: Decimal
    status: InvoiceStatusEnum = InvoiceStatusEnum.UNPAID
    notes: Optional[str] = None

class InvoiceCreate(InvoiceBase):
    items: List[InvoiceItemCreate]

class InvoiceUpdate(BaseModel):
    invoice_number: Optional[str] = None
    invoice_date: Optional[date] = None
    due_date: Optional[date] = None
    customer_id: Optional[int] = None
    sale_id: Optional[int] = None
    total_amount: Optional[Decimal] = None
    status: Optional[InvoiceStatusEnum] = None
    notes: Optional[str] = None
    items: Optional[List[InvoiceItemCreate]] = None

class InvoiceResponse(InvoiceBase):
    id: int
    company_id: int
    items: List[InvoiceItemResponse]
    
    model_config = ConfigDict(from_attributes=True)
