"""
SmartERP — Supplier Service
Business logic for managing suppliers, enforcing company-level isolation.
"""

from sqlalchemy.orm import Session
from sqlalchemy import select, func
from fastapi import HTTPException, status
from typing import Sequence, Tuple

from app.models.supplier import Supplier
from app.models.company import Company
from app.schemas.supplier import SupplierCreate, SupplierUpdate
from app.services.audit_service import log_action


def create_supplier(db: Session, supplier_in: SupplierCreate, user_id: int) -> Supplier:
    """Create a new supplier after verifying the company exists."""
    # Verify that the company exists in the system before proceeding with supplier creation.
    company = db.scalar(select(Company).where(Company.id == supplier_in.company_id))
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found.",
        )

    # Validate duplicate email if provided
    if supplier_in.email:
        existing_supplier = db.scalar(
            select(Supplier).where(
                Supplier.company_id == supplier_in.company_id,
                Supplier.email == supplier_in.email
            )
        )
        if existing_supplier:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A supplier with this email already exists in this company."
            )

    db_supplier = Supplier(
        company_id=supplier_in.company_id,
        name=supplier_in.name,
        email=supplier_in.email,
        phone=supplier_in.phone,
        address=supplier_in.address,
    )
    db.add(db_supplier)
    db.commit()
    db.refresh(db_supplier)
    
    log_action(
        db=db,
        user_id=user_id,
        action="CREATE",
        table_name="suppliers",
        record_id=db_supplier.id,
        company_id=supplier_in.company_id,
        details=supplier_in.model_dump()
    )
    db.commit()

    return db_supplier


def get_suppliers(
    db: Session, 
    company_id: int,
    search: str | None = None,
    limit: int = 100,
    offset: int = 0
) -> Tuple[Sequence[Supplier], int]:
    """Retrieve all suppliers for a given company with pagination and search."""
    stmt = select(Supplier).where(Supplier.company_id == company_id)
    
    if search:
        search_term = f"%{search}%"
        stmt = stmt.where(Supplier.name.ilike(search_term))
        
    # Count total matching records before limit/offset
    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    
    stmt = stmt.order_by(Supplier.created_at.desc()).limit(limit).offset(offset)
    items = db.scalars(stmt).all()
    
    return items, total


def get_supplier_by_id(db: Session, supplier_id: int, company_id: int) -> Supplier:
    """Retrieve a specific supplier, ensuring it belongs to the company."""
    supplier = db.scalar(
        select(Supplier).where(
            Supplier.id == supplier_id, 
            Supplier.company_id == company_id
        )
    )
    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supplier not found or access denied.",
        )
    return supplier


def update_supplier(
    db: Session, supplier_id: int, company_id: int, supplier_in: SupplierUpdate, user_id: int
) -> Supplier:
    """Update a supplier's details."""
    # Retrieve the supplier, ensuring it belongs to the specified company to prevent unauthorized modifications.
    supplier = get_supplier_by_id(db, supplier_id, company_id)

    # Validate duplicate email if provided and changed
    if supplier_in.email and supplier_in.email != supplier.email:
        existing_supplier = db.scalar(
            select(Supplier).where(
                Supplier.company_id == company_id,
                Supplier.email == supplier_in.email
            )
        )
        if existing_supplier:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A supplier with this email already exists in this company."
            )
    
    # Extract only the provided fields for a partial update on the supplier record.
    update_data = supplier_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(supplier, field, value)

    db.add(supplier)
    db.commit()
    db.refresh(supplier)
    
    log_action(
        db=db,
        user_id=user_id,
        action="UPDATE",
        table_name="suppliers",
        record_id=supplier.id,
        company_id=company_id,
        details=update_data
    )
    db.commit()

    return supplier


def delete_supplier(db: Session, supplier_id: int, company_id: int, user_id: int) -> None:
    """Delete a supplier."""
    supplier = get_supplier_by_id(db, supplier_id, company_id)
    db.delete(supplier)
    log_action(
        db=db,
        user_id=user_id,
        action="DELETE",
        table_name="suppliers",
        record_id=supplier_id,
        company_id=company_id
    )
    db.commit()
