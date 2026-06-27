from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.schemas.ledger import LedgerCreate, LedgerUpdate, LedgerResponse
from app.services.ledger_service import (
    create_ledger,
    get_ledgers,
    get_ledger_by_id,
    update_ledger,
    delete_ledger,
)

router = APIRouter(prefix="/ledgers", tags=["Ledgers"])

@router.post(
    "",
    response_model=LedgerResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new ledger",
)
def create_new_ledger(
    ledger_in: LedgerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.models.company import Company
    from fastapi import HTTPException
    
    company = db.query(Company).filter(Company.id == ledger_in.company_id, Company.user_id == current_user.id).first()
    if not company:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    return create_ledger(db, ledger_in)

@router.get(
    "",
    response_model=List[LedgerResponse],
    summary="List ledgers",
)
def list_ledgers(
    company_id: int,
    search: Optional[str] = None,
    is_active: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.models.company import Company
    from fastapi import HTTPException
    
    company = db.query(Company).filter(Company.id == company_id, Company.user_id == current_user.id).first()
    if not company:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    return get_ledgers(db, company_id=company_id, search=search, is_active=is_active, skip=skip, limit=limit)

@router.get(
    "/{ledger_id}",
    response_model=LedgerResponse,
    summary="Get a ledger by ID",
)
def get_ledger(
    ledger_id: int,
    company_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.models.company import Company
    from fastapi import HTTPException
    
    company = db.query(Company).filter(Company.id == company_id, Company.user_id == current_user.id).first()
    if not company:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    return get_ledger_by_id(db, ledger_id, company_id)

@router.put(
    "/{ledger_id}",
    response_model=LedgerResponse,
    summary="Update a ledger",
)
def update_existing_ledger(
    ledger_id: int,
    company_id: int,
    ledger_in: LedgerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.models.company import Company
    from fastapi import HTTPException
    
    company = db.query(Company).filter(Company.id == company_id, Company.user_id == current_user.id).first()
    if not company:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    return update_ledger(db, ledger_id, company_id, ledger_in)

@router.delete(
    "/{ledger_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a ledger",
)
def delete_existing_ledger(
    ledger_id: int,
    company_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.models.company import Company
    from fastapi import HTTPException
    
    company = db.query(Company).filter(Company.id == company_id, Company.user_id == current_user.id).first()
    if not company:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    delete_ledger(db, ledger_id, company_id)
