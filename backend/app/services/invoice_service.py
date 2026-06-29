from sqlalchemy.orm import Session
from sqlalchemy import select, func
from fastapi import HTTPException, status
from typing import Sequence, Tuple

from app.models.invoice import Invoice
from app.models.invoice_item import InvoiceItem
from app.models.customer import Customer
from app.models.sale import Sale
from app.schemas.invoice import InvoiceCreate, InvoiceUpdate
from app.services.audit_service import log_action

def create_invoice(db: Session, invoice_in: InvoiceCreate, user_id: int, company_id: int) -> Invoice:
    customer = db.scalar(select(Customer).where(Customer.id == invoice_in.customer_id, Customer.company_id == company_id))
    if not customer:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Customer not found.")

    if invoice_in.sale_id:
        sale = db.scalar(select(Sale).where(Sale.id == invoice_in.sale_id, Sale.company_id == company_id))
        if not sale:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Sale not found.")

    db_invoice = Invoice(
        company_id=company_id,
        customer_id=invoice_in.customer_id,
        sale_id=invoice_in.sale_id,
        invoice_number=invoice_in.invoice_number,
        invoice_date=invoice_in.invoice_date,
        due_date=invoice_in.due_date,
        total_amount=invoice_in.total_amount,
        status=invoice_in.status,
        notes=invoice_in.notes
    )
    db.add(db_invoice)
    db.flush()

    for item_in in invoice_in.items:
        db_item = InvoiceItem(
            invoice_id=db_invoice.id,
            stock_item_id=item_in.stock_item_id,
            quantity=item_in.quantity,
            rate=item_in.rate,
            tax_amount=item_in.tax_amount,
            discount_amount=item_in.discount_amount,
            line_total=item_in.line_total
        )
        db.add(db_item)

    db.commit()
    db.refresh(db_invoice)
    
    dumped = invoice_in.model_dump(mode='json')
    log_action(db, user_id, "CREATE", "invoices", db_invoice.id, company_id, dumped)
    return db_invoice

def get_invoices(db: Session, company_id: int, limit: int = 100, offset: int = 0) -> Tuple[Sequence[Invoice], int]:
    stmt = select(Invoice).where(Invoice.company_id == company_id)
    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    stmt = stmt.order_by(Invoice.invoice_date.desc(), Invoice.created_at.desc()).limit(limit).offset(offset)
    items = db.scalars(stmt).all()
    return items, total

def get_invoice(db: Session, invoice_id: int, company_id: int) -> Invoice:
    invoice = db.scalar(select(Invoice).where(Invoice.id == invoice_id, Invoice.company_id == company_id))
    if not invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found.")
    return invoice
