from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.schemas.group import GroupCreate, GroupUpdate, GroupResponse
from app.services.group_service import (
    create_group,
    get_groups,
    get_group_by_id,
    update_group,
    delete_group,
)

router = APIRouter(prefix="/groups", tags=["Groups"])

@router.post(
    "",
    response_model=GroupResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new group",
)
def create_new_group(
    group_in: GroupCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # The company_id is provided in the payload, but we should verify the user owns the company
    # This is handled implicitly if we want, but since group_service creates it, we can just pass it.
    # To be secure, we should verify company ownership. The instruction says:
    # "Every operation must be scoped to the authenticated user's companies."
    # Let's ensure the user owns the company_id provided.
    from app.models.company import Company
    from fastapi import HTTPException
    
    company = db.query(Company).filter(Company.id == group_in.company_id, Company.user_id == current_user.id).first()
    if not company:
        raise HTTPException(status_code=403, detail="Not authorized to create groups for this company")
        
    return create_group(db, group_in)

@router.get(
    "",
    response_model=List[GroupResponse],
    summary="List groups",
)
def list_groups(
    company_id: int,
    search: Optional[str] = None,
    parent_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.models.company import Company
    from fastapi import HTTPException
    
    company = db.query(Company).filter(Company.id == company_id, Company.user_id == current_user.id).first()
    if not company:
        raise HTTPException(status_code=403, detail="Not authorized to access groups for this company")
        
    return get_groups(db, company_id=company_id, search=search, parent_id=parent_id, skip=skip, limit=limit)

@router.get(
    "/{group_id}",
    response_model=GroupResponse,
    summary="Get a group by ID",
)
def get_group(
    group_id: int,
    company_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.models.company import Company
    from fastapi import HTTPException
    
    company = db.query(Company).filter(Company.id == company_id, Company.user_id == current_user.id).first()
    if not company:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    return get_group_by_id(db, group_id, company_id)

@router.put(
    "/{group_id}",
    response_model=GroupResponse,
    summary="Update a group",
)
def update_existing_group(
    group_id: int,
    company_id: int,
    group_in: GroupUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.models.company import Company
    from fastapi import HTTPException
    
    company = db.query(Company).filter(Company.id == company_id, Company.user_id == current_user.id).first()
    if not company:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    return update_group(db, group_id, company_id, group_in)

@router.delete(
    "/{group_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a group",
)
def delete_existing_group(
    group_id: int,
    company_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.models.company import Company
    from fastapi import HTTPException
    
    company = db.query(Company).filter(Company.id == company_id, Company.user_id == current_user.id).first()
    if not company:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    delete_group(db, group_id, company_id)
