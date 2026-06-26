"""
SmartERP — Company Service
Business logic for Company CRUD operations.
All queries are scoped to the authenticated user's companies.
"""

from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.company import Company
from app.schemas.company import CompanyCreate, CompanyUpdate
from app.services.audit_service import log_action


# ------------------------------------------------------------------
# Create
# ------------------------------------------------------------------
def create_company(db: Session, payload: CompanyCreate, user_id: int) -> Company:
    """
    Create a new company owned by the given user.

    Parameters
    ----------
    db : Session
        Active SQLAlchemy session.
    payload : CompanyCreate
        Validated request body.
    user_id : int
        ID of the authenticated user who will own this company.

    Returns
    -------
    Company
        The newly created company row (refreshed from DB).
    """
    company = Company(
        name=payload.name,
        address=payload.address,
        contact_number=payload.contact_number,
        state=payload.state,
        user_id=user_id,
    )

    db.add(company)
    db.commit()
    db.refresh(company)
    
    log_action(
        db=db,
        user_id=user_id,
        action="CREATE",
        table_name="companies",
        record_id=company.id,
        company_id=company.id,
        details=payload.model_dump()
    )
    db.commit()

    return company


# ------------------------------------------------------------------
# Read — Single
# ------------------------------------------------------------------
def get_company(db: Session, company_id: int, user_id: int) -> Optional[Company]:
    """
    Return a single active company owned by the user, or None.

    Parameters
    ----------
    db : Session
        Active SQLAlchemy session.
    company_id : int
        Primary key of the company to retrieve.
    user_id : int
        ID of the authenticated user (ownership filter).

    Returns
    -------
    Company | None
    """
    stmt = (
        select(Company)
        .where(Company.id == company_id)
        .where(Company.user_id == user_id)
        .where(Company.is_active.is_(True))
    )
    return db.execute(stmt).scalars().first()


# ------------------------------------------------------------------
# Read — List
# ------------------------------------------------------------------
def list_companies(db: Session, user_id: int) -> list[Company]:
    """
    Return all active companies owned by the user.

    Parameters
    ----------
    db : Session
        Active SQLAlchemy session.
    user_id : int
        ID of the authenticated user (ownership filter).

    Returns
    -------
    list[Company]
        Ordered by most-recently created first.
    """
    stmt = (
        select(Company)
        .where(Company.user_id == user_id)
        .where(Company.is_active.is_(True))
        .order_by(Company.created_at.desc())
    )
    return list(db.execute(stmt).scalars().all())


# ------------------------------------------------------------------
# Update
# ------------------------------------------------------------------
def update_company(
    db: Session,
    company_id: int,
    payload: CompanyUpdate,
    user_id: int,
) -> Optional[Company]:
    """
    Update an existing company. Only fields present in the payload
    (non-None) are overwritten.

    Parameters
    ----------
    db : Session
        Active SQLAlchemy session.
    company_id : int
        Primary key of the company to update.
    payload : CompanyUpdate
        Validated request body (partial update).
    user_id : int
        ID of the authenticated user (ownership filter).

    Returns
    -------
    Company | None
        The updated company, or None if not found / not owned.
    """
    company = get_company(db, company_id, user_id)
    if not company:
        return None

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(company, field, value)

    db.commit()
    db.refresh(company)
    
    log_action(
        db=db,
        user_id=user_id,
        action="UPDATE",
        table_name="companies",
        record_id=company.id,
        company_id=company.id,
        details=update_data
    )
    db.commit()

    return company


# ------------------------------------------------------------------
# Soft Delete (Deactivate)
# ------------------------------------------------------------------
def deactivate_company(
    db: Session, company_id: int, user_id: int
) -> Optional[Company]:
    """
    Soft-delete a company by setting is_active = False.

    Parameters
    ----------
    db : Session
        Active SQLAlchemy session.
    company_id : int
        Primary key of the company to deactivate.
    user_id : int
        ID of the authenticated user (ownership filter).

    Returns
    -------
    Company | None
        The deactivated company, or None if not found / not owned.
    """
    company = get_company(db, company_id, user_id)
    if not company:
        return None

    company.is_active = False
    db.commit()
    db.refresh(company)
    
    log_action(
        db=db,
        user_id=user_id,
        action="DEACTIVATE",
        table_name="companies",
        record_id=company.id,
        company_id=company.id
    )
    db.commit()

    return company
