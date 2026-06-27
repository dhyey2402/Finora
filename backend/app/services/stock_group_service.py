from sqlalchemy.orm import Session
from sqlalchemy import select, func
from fastapi import HTTPException, status
from typing import Sequence, Tuple

from app.models.stock_group import StockGroup
from app.models.company import Company
from app.schemas.stock_group import StockGroupCreate, StockGroupUpdate
from app.services.audit_service import log_action

def create_stock_group(db: Session, group_in: StockGroupCreate, user_id: int) -> StockGroup:
    company = db.scalar(select(Company).where(Company.id == group_in.company_id))
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found.")

    if group_in.parent_id:
        parent = db.scalar(select(StockGroup).where(StockGroup.id == group_in.parent_id, StockGroup.company_id == group_in.company_id))
        if not parent:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Parent group not found.")

    db_group = StockGroup(
        company_id=group_in.company_id,
        name=group_in.name,
        parent_id=group_in.parent_id,
    )
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    
    log_action(db, user_id, "CREATE", "stock_groups", db_group.id, group_in.company_id, group_in.model_dump())
    db.commit()
    return db_group

def get_stock_groups(
    db: Session, 
    company_id: int,
    search: str | None = None,
    limit: int = 100,
    offset: int = 0
) -> Tuple[Sequence[StockGroup], int]:
    stmt = select(StockGroup).where(StockGroup.company_id == company_id)
    if search:
        stmt = stmt.where(StockGroup.name.ilike(f"%{search}%"))
        
    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    stmt = stmt.order_by(StockGroup.created_at.desc()).limit(limit).offset(offset)
    items = db.scalars(stmt).all()
    
    return items, total

def get_stock_group_by_id(db: Session, group_id: int, company_id: int) -> StockGroup:
    group = db.scalar(select(StockGroup).where(StockGroup.id == group_id, StockGroup.company_id == company_id))
    if not group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stock group not found.")
    return group

def update_stock_group(
    db: Session, group_id: int, company_id: int, group_in: StockGroupUpdate, user_id: int
) -> StockGroup:
    group = get_stock_group_by_id(db, group_id, company_id)
    
    if group_in.parent_id:
        if group_in.parent_id == group_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot set group as its own parent.")
        parent = db.scalar(select(StockGroup).where(StockGroup.id == group_in.parent_id, StockGroup.company_id == company_id))
        if not parent:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Parent group not found.")

    update_data = group_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(group, field, value)

    db.add(group)
    db.commit()
    db.refresh(group)
    
    log_action(db, user_id, "UPDATE", "stock_groups", group.id, company_id, update_data)
    db.commit()
    return group

def delete_stock_group(db: Session, group_id: int, company_id: int, user_id: int) -> None:
    group = get_stock_group_by_id(db, group_id, company_id)
    db.delete(group)
    log_action(db, user_id, "DELETE", "stock_groups", group_id, company_id)
    db.commit()
