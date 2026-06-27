"""
SmartERP — Customer Routes
API endpoints for managing customers.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app.database.dependencies import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.schemas.customer import CustomerCreate, CustomerUpdate, CustomerResponse
from app.schemas.common import PaginatedResponse
from app.services.customer_service import (
    create_customer,
    get_customers,
    get_customer_by_id,
    update_customer,
    delete_customer,
)

router = APIRouter(prefix="/customers", tags=["Customers"])

# Note: We rely on company_id being passed for scoped access.
# If multi-tenancy was strictly enforced by user, we'd also check user-company association.

@router.post(
    "",
    response_model=CustomerResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new customer",
)
def create_new_customer(
    customer_in: CustomerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new customer linked to a company."""
    return create_customer(db, customer_in, current_user.id)


@router.get(
    "",
    response_model=PaginatedResponse[CustomerResponse],
    summary="List customers for a company",
)
def list_customers(
    company_id: int,
    search: str | None = None,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all customers scoped to a specific company with pagination."""
    items, total = get_customers(db, company_id, search, limit, offset)
    return PaginatedResponse(
        items=items,
        total=total,
        limit=limit,
        offset=offset
    )


@router.get(
    "/{customer_id}",
    response_model=CustomerResponse,
    summary="Get a customer by ID",
)
def get_customer(
    customer_id: int,
    company_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get details of a specific customer."""
    return get_customer_by_id(db, customer_id, company_id)


@router.put(
    "/{customer_id}",
    response_model=CustomerResponse,
    summary="Update a customer",
)
def update_existing_customer(
    customer_id: int,
    company_id: int,
    customer_in: CustomerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update specific fields of a customer."""
    return update_customer(db, customer_id, company_id, customer_in, current_user.id)


@router.delete(
    "/{customer_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a customer",
)
def delete_existing_customer(
    customer_id: int,
    company_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a customer entirely."""
    delete_customer(db, customer_id, company_id, current_user.id)
