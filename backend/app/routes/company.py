"""
SmartERP — Company Routes
CRUD endpoints for the Company Management module.
All endpoints are JWT-protected and scoped to the authenticated user.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.database.dependencies import get_db
from app.models.user import User
from app.schemas.company import CompanyCreate, CompanyUpdate, CompanyResponse
from app.services.company_service import (
    create_company,
    get_company,
    list_companies,
    update_company,
    deactivate_company,
)

router = APIRouter(prefix="/companies", tags=["Companies"])


# ------------------------------------------------------------------
# Create Company
# ------------------------------------------------------------------
@router.post(
    "",
    response_model=CompanyResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new company",
)
def create(
    payload: CompanyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a new company owned by the authenticated user.

    - **name**: Legal name of the company (required)
    - **address**: Registered address
    - **contact_number**: Primary phone number
    - **state**: State of registration
    """
    company = create_company(db, payload, user_id=current_user.id)
    return company


# ------------------------------------------------------------------
# List Companies
# ------------------------------------------------------------------
@router.get(
    "",
    response_model=list[CompanyResponse],
    summary="List all companies",
)
def list_all(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return all **active** companies belonging to the authenticated user.
    Results are ordered by most-recently created first.
    """
    return list_companies(db, user_id=current_user.id)


# ------------------------------------------------------------------
# Get Single Company
# ------------------------------------------------------------------
@router.get(
    "/{company_id}",
    response_model=CompanyResponse,
    summary="Get a company by ID",
)
def get_one(
    company_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return a single active company by its ID.
    Only the owner can access their own companies.
    """
    company = get_company(db, company_id, user_id=current_user.id)
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Company with id {company_id} not found",
        )
    return company


# ------------------------------------------------------------------
# Update Company
# ------------------------------------------------------------------
@router.put(
    "/{company_id}",
    response_model=CompanyResponse,
    summary="Update a company",
)
def update(
    company_id: int,
    payload: CompanyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update an existing company. Only supplied fields are changed.
    Only the owner can update their own companies.
    """
    company = update_company(db, company_id, payload, user_id=current_user.id)
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Company with id {company_id} not found",
        )
    return company


# ------------------------------------------------------------------
# Delete (Soft) Company
# ------------------------------------------------------------------
@router.delete(
    "/{company_id}",
    response_model=CompanyResponse,
    summary="Delete a company (soft delete)",
)
def delete(
    company_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Soft-delete a company by deactivating it.
    The record is retained in the database with ``is_active = False``.
    Only the owner can delete their own companies.
    """
    company = deactivate_company(db, company_id, user_id=current_user.id)
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Company with id {company_id} not found",
        )
    return company
