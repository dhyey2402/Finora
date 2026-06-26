"""
SmartERP — Supplier Service
Business logic for managing suppliers, enforcing company-level isolation.
"""

from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import Sequence

from app.models.supplier import Supplier
from app.models.company import Company
from app.schemas.supplier import SupplierCreate, SupplierUpdate
from app.services.audit_service import log_action


def create_supplier(db: Session, supplier_in: SupplierCreate, user_id: int) -> Supplier:
    """Create a new supplier after verifying the company exists."""
    company = db.query(Company).filter(Company.id == supplier_in.company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found.",
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


def get_suppliers(db: Session, company_id: int) -> Sequence[Supplier]:
    """Retrieve all suppliers for a given company."""
    return db.query(Supplier).filter(Supplier.company_id == company_id).all()


def get_supplier_by_id(db: Session, supplier_id: int, company_id: int) -> Supplier:
    """Retrieve a specific supplier, ensuring it belongs to the company."""
    supplier = (
        db.query(Supplier)
        .filter(Supplier.id == supplier_id, Supplier.company_id == company_id)
        .first()
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
    supplier = get_supplier_by_id(db, supplier_id, company_id)
    
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
