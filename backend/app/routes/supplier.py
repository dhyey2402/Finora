"""
SmartERP — Supplier Routes
API endpoints for managing suppliers.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app.database.dependencies import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.schemas.supplier import SupplierCreate, SupplierUpdate, SupplierResponse
from app.schemas.common import PaginatedResponse
from app.services.supplier_service import (
    create_supplier,
    get_suppliers,
    get_supplier_by_id,
    update_supplier,
    delete_supplier,
)

router = APIRouter(prefix="/suppliers", tags=["Suppliers"])


@router.post(
    "",
    response_model=SupplierResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new supplier",
)
def create_new_supplier(
    supplier_in: SupplierCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new supplier linked to a company."""
    return create_supplier(db, supplier_in, current_user.id)


@router.get(
    "",
    response_model=PaginatedResponse[SupplierResponse],
    summary="List suppliers for a company",
)
def list_suppliers(
    company_id: int,
    search: str | None = None,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all suppliers scoped to a specific company with pagination."""
    items, total = get_suppliers(db, company_id, search, limit, offset)
    return PaginatedResponse(
        items=items,
        total=total,
        limit=limit,
        offset=offset
    )


@router.get(
    "/{supplier_id}",
    response_model=SupplierResponse,
    summary="Get a supplier by ID",
)
def get_supplier(
    supplier_id: int,
    company_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get details of a specific supplier."""
    return get_supplier_by_id(db, supplier_id, company_id)


@router.put(
    "/{supplier_id}",
    response_model=SupplierResponse,
    summary="Update a supplier",
)
def update_existing_supplier(
    supplier_id: int,
    company_id: int,
    supplier_in: SupplierUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update specific fields of a supplier."""
    return update_supplier(db, supplier_id, company_id, supplier_in, current_user.id)


@router.delete(
    "/{supplier_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a supplier",
)
def delete_existing_supplier(
    supplier_id: int,
    company_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a supplier entirely."""
    delete_supplier(db, supplier_id, company_id, current_user.id)
