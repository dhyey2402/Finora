from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import Any

from app.database.dependencies import get_db
from app.models.user import User
from app.core.auth import get_current_user
from app.schemas.invoice import InvoiceResponse, InvoiceCreate
from app.schemas.common import PaginatedResponse
from app.services.invoice_service import create_invoice, get_invoices, get_invoice

router = APIRouter(prefix="/invoices", tags=["Invoices"])

@router.post("", response_model=InvoiceResponse, status_code=status.HTTP_201_CREATED)
def create_new_invoice(
    company_id: int,
    invoice_in: InvoiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    return create_invoice(db=db, invoice_in=invoice_in, user_id=current_user.id, company_id=company_id)

@router.get("", response_model=PaginatedResponse[InvoiceResponse])
def read_invoices(
    company_id: int,
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    items, total = get_invoices(db=db, company_id=company_id, limit=limit, offset=offset)
    return {"items": items, "total": total, "limit": limit, "offset": offset}

@router.get("/{invoice_id}", response_model=InvoiceResponse)
def read_invoice(
    invoice_id: int,
    company_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    return get_invoice(db=db, invoice_id=invoice_id, company_id=company_id)
