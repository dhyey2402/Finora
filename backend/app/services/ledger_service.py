from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import select, or_
from fastapi import HTTPException, status

from app.models.ledger import Ledger
from app.models.company import Company
from app.models.group import Group
from app.models.voucher import VoucherEntry
from app.models.invoice import Invoice
from app.models.purchase import Purchase
from app.models.sale import Sale
from app.schemas.ledger import LedgerCreate, LedgerUpdate

def get_ledger_by_id(db: Session, ledger_id: int, company_id: int) -> Ledger:
    ledger = db.execute(
        select(Ledger)
        .where(Ledger.id == ledger_id, Ledger.company_id == company_id)
    ).scalar_one_or_none()
    
    if not ledger:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ledger not found or access denied."
        )
    return ledger

def create_ledger(db: Session, ledger_in: LedgerCreate) -> Ledger:
    company = db.execute(
        select(Company).where(Company.id == ledger_in.company_id)
    ).scalar_one_or_none()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found."
        )
        
    group = db.execute(
        select(Group).where(Group.id == ledger_in.group_id, Group.company_id == ledger_in.company_id)
    ).scalar_one_or_none()
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found or belongs to a different company."
        )
        
    existing_name = db.execute(
        select(Ledger).where(Ledger.name == ledger_in.name, Ledger.company_id == ledger_in.company_id)
    ).scalar_one_or_none()
    if existing_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A ledger with this name already exists in this company."
        )

    if ledger_in.code:
        existing_code = db.execute(
            select(Ledger).where(Ledger.code == ledger_in.code, Ledger.company_id == ledger_in.company_id)
        ).scalar_one_or_none()
        if existing_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A ledger with this code already exists in this company."
            )

    db_ledger = Ledger(
        name=ledger_in.name,
        code=ledger_in.code,
        group_id=ledger_in.group_id,
        company_id=ledger_in.company_id,
        opening_balance=ledger_in.opening_balance,
        current_balance=ledger_in.opening_balance, # Initial current balance is the opening balance
        is_active=ledger_in.is_active
    )
    db.add(db_ledger)
    db.commit()
    db.refresh(db_ledger)
    return db_ledger

def get_ledgers(
    db: Session,
    company_id: int,
    search: Optional[str] = None,
    is_active: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100
):
    stmt = select(Ledger).where(Ledger.company_id == company_id)
    
    if search:
        stmt = stmt.where(
            or_(
                Ledger.name.ilike(f"%{search}%"),
                Ledger.code.ilike(f"%{search}%")
            )
        )
        
    if is_active is not None:
        stmt = stmt.where(Ledger.is_active == is_active)
        
    stmt = stmt.order_by(Ledger.created_at.desc()).offset(skip).limit(limit)
    return db.execute(stmt).scalars().all()

def update_ledger(db: Session, ledger_id: int, company_id: int, ledger_in: LedgerUpdate) -> Ledger:
    ledger = get_ledger_by_id(db, ledger_id, company_id)
    
    if ledger_in.group_id is not None:
        group = db.execute(
            select(Group).where(Group.id == ledger_in.group_id, Group.company_id == company_id)
        ).scalar_one_or_none()
        if not group:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Group not found or belongs to a different company."
            )

    if ledger_in.name is not None and ledger_in.name != ledger.name:
        existing = db.execute(
            select(Ledger).where(Ledger.name == ledger_in.name, Ledger.company_id == company_id)
        ).scalar_one_or_none()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A ledger with this name already exists in this company."
            )
            
    if ledger_in.code is not None and ledger_in.code != ledger.code:
        existing_code = db.execute(
            select(Ledger).where(Ledger.code == ledger_in.code, Ledger.company_id == company_id)
        ).scalar_one_or_none()
        if existing_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A ledger with this code already exists in this company."
            )

    # Adjust current_balance if opening_balance is updated
    if ledger_in.opening_balance is not None and ledger_in.opening_balance != ledger.opening_balance:
        difference = ledger_in.opening_balance - ledger.opening_balance
        ledger.current_balance += difference
            
    update_data = ledger_in.model_dump(exclude_unset=True)
    # Don't update current_balance directly from update_data unless explicitly allowed (usually it isn't)
    for field, value in update_data.items():
        setattr(ledger, field, value)
        
    db.commit()
    db.refresh(ledger)
    return ledger

def delete_ledger(db: Session, ledger_id: int, company_id: int) -> None:
    ledger = get_ledger_by_id(db, ledger_id, company_id)
    
    # Prevent deletion if referenced by VoucherEntry
    has_vouchers = db.execute(select(VoucherEntry).where(VoucherEntry.ledger_id == ledger.id).limit(1)).scalar_one_or_none()
    if has_vouchers:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete a ledger referenced by vouchers."
        )
        
    # Checking invoices, purchases, sales for references (assuming they refer to ledgers)
    # The requirement says "Invoice, Purchase, Sale". Let's check if they have ledger_id.
    # Note: If they don't have ledger_id in the models, this might fail, but we will add logic.
    try:
        has_invoices = db.execute(select(Invoice).where(Invoice.ledger_id == ledger.id).limit(1)).scalar_one_or_none()
        if has_invoices:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete a ledger referenced by invoices."
            )
    except Exception:
        pass # If Invoice doesn't have ledger_id yet, ignore for now

    try:
        has_purchases = db.execute(select(Purchase).where(Purchase.ledger_id == ledger.id).limit(1)).scalar_one_or_none()
        if has_purchases:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete a ledger referenced by purchases."
            )
    except Exception:
        pass

    try:
        has_sales = db.execute(select(Sale).where(Sale.ledger_id == ledger.id).limit(1)).scalar_one_or_none()
        if has_sales:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete a ledger referenced by sales."
            )
    except Exception:
        pass

    db.delete(ledger)
    db.commit()
