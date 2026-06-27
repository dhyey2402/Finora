from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import select, func, or_
from fastapi import HTTPException, status

from app.models.group import Group
from app.models.company import Company
from app.models.ledger import Ledger
from app.schemas.group import GroupCreate, GroupUpdate

def get_group_by_id(db: Session, group_id: int, company_id: int) -> Group:
    group = db.execute(
        select(Group)
        .where(Group.id == group_id, Group.company_id == company_id)
    ).scalar_one_or_none()
    
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found or access denied."
        )
    return group

def create_group(db: Session, group_in: GroupCreate) -> Group:
    company = db.execute(
        select(Company).where(Company.id == group_in.company_id)
    ).scalar_one_or_none()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found."
        )
        
    if group_in.parent_id:
        parent = db.execute(
            select(Group).where(Group.id == group_in.parent_id, Group.company_id == group_in.company_id)
        ).scalar_one_or_none()
        if not parent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Parent group not found."
            )
            
    existing = db.execute(
        select(Group).where(Group.name == group_in.name, Group.company_id == group_in.company_id)
    ).scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A group with this name already exists in this company."
        )

    if group_in.code:
        existing_code = db.execute(
            select(Group).where(Group.code == group_in.code, Group.company_id == group_in.company_id)
        ).scalar_one_or_none()
        if existing_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A group with this code already exists in this company."
            )

    db_group = Group(
        name=group_in.name,
        code=group_in.code,
        parent_id=group_in.parent_id,
        company_id=group_in.company_id
    )
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    return db_group

def get_groups(
    db: Session,
    company_id: int,
    search: Optional[str] = None,
    parent_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100
):
    stmt = select(Group).where(Group.company_id == company_id)
    
    if search:
        stmt = stmt.where(
            or_(
                Group.name.ilike(f"%{search}%"),
                Group.code.ilike(f"%{search}%")
            )
        )
        
    if parent_id is not None:
        stmt = stmt.where(Group.parent_id == parent_id)
        
    stmt = stmt.order_by(Group.created_at.desc()).offset(skip).limit(limit)
    groups = db.execute(stmt).scalars().all()
    
    # Calculate child and ledger counts
    result = []
    for group in groups:
        child_count = db.execute(select(func.count()).select_from(Group).where(Group.parent_id == group.id)).scalar_one()
        ledger_count = db.execute(select(func.count()).select_from(Ledger).where(Ledger.group_id == group.id)).scalar_one()
        
        # We'll attach these values to the object. Pydantic's from_attributes=True will pick them up if defined in schema.
        setattr(group, 'child_count', child_count)
        setattr(group, 'ledger_count', ledger_count)
        result.append(group)
        
    return result

def update_group(db: Session, group_id: int, company_id: int, group_in: GroupUpdate) -> Group:
    group = get_group_by_id(db, group_id, company_id)
    
    if group_in.parent_id is not None:
        if group_in.parent_id == group.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A group cannot be its own parent."
            )
        # Check circular dependency
        curr_parent = group_in.parent_id
        while curr_parent:
            if curr_parent == group.id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Circular parent relationship detected."
                )
            parent = db.execute(select(Group).where(Group.id == curr_parent)).scalar_one_or_none()
            if not parent:
                break
            curr_parent = parent.parent_id
            
        # Check parent exists and is in the same company
        parent_group = db.execute(
            select(Group).where(Group.id == group_in.parent_id, Group.company_id == company_id)
        ).scalar_one_or_none()
        if not parent_group:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Parent group not found or belongs to a different company."
            )

    if group_in.name is not None and group_in.name != group.name:
        existing = db.execute(
            select(Group).where(Group.name == group_in.name, Group.company_id == company_id)
        ).scalar_one_or_none()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A group with this name already exists in this company."
            )
            
    if group_in.code is not None and group_in.code != group.code:
        existing_code = db.execute(
            select(Group).where(Group.code == group_in.code, Group.company_id == company_id)
        ).scalar_one_or_none()
        if existing_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A group with this code already exists in this company."
            )
            
    update_data = group_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(group, field, value)
        
    db.commit()
    db.refresh(group)
    return group

def delete_group(db: Session, group_id: int, company_id: int) -> None:
    group = get_group_by_id(db, group_id, company_id)
    
    # Prevent deleting if it has children
    child_count = db.execute(select(func.count()).select_from(Group).where(Group.parent_id == group.id)).scalar_one()
    if child_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete a group containing child groups."
        )
        
    # Prevent deleting if it has ledgers
    ledger_count = db.execute(select(func.count()).select_from(Ledger).where(Ledger.group_id == group.id)).scalar_one()
    if ledger_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete a group with assigned ledgers."
        )
        
    db.delete(group)
    db.commit()
