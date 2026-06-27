from sqlalchemy.orm import Session
from sqlalchemy import select, func
from fastapi import HTTPException, status
from typing import Sequence, Tuple

from app.models.stock_item import StockItem
from app.models.company import Company
from app.models.stock_group import StockGroup
from app.models.unit import Unit
from app.schemas.stock_item import StockItemCreate, StockItemUpdate
from app.services.audit_service import log_action

def create_stock_item(db: Session, item_in: StockItemCreate, user_id: int) -> StockItem:
    company = db.scalar(select(Company).where(Company.id == item_in.company_id))
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found.")

    group = db.scalar(select(StockGroup).where(StockGroup.id == item_in.stock_group_id, StockGroup.company_id == item_in.company_id))
    if not group:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Stock group not found.")

    unit = db.scalar(select(Unit).where(Unit.id == item_in.unit_id, Unit.company_id == item_in.company_id))
    if not unit:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unit not found.")

    if item_in.sku:
        existing = db.scalar(select(StockItem).where(StockItem.sku == item_in.sku, StockItem.company_id == item_in.company_id))
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="SKU already exists.")

    db_item = StockItem(
        company_id=item_in.company_id,
        name=item_in.name,
        sku=item_in.sku,
        stock_group_id=item_in.stock_group_id,
        unit_id=item_in.unit_id,
        quantity=item_in.quantity,
        rate=item_in.rate,
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    
    log_action(db, user_id, "CREATE", "stock_items", db_item.id, item_in.company_id, item_in.model_dump(mode='json'))
    db.commit()
    return db_item

def get_stock_items(
    db: Session, 
    company_id: int,
    search: str | None = None,
    limit: int = 100,
    offset: int = 0
) -> Tuple[Sequence[StockItem], int]:
    stmt = select(StockItem).where(StockItem.company_id == company_id)
    if search:
        stmt = stmt.where(StockItem.name.ilike(f"%{search}%") | StockItem.sku.ilike(f"%{search}%"))
        
    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    stmt = stmt.order_by(StockItem.created_at.desc()).limit(limit).offset(offset)
    items = db.scalars(stmt).all()
    
    return items, total

def get_stock_item_by_id(db: Session, item_id: int, company_id: int) -> StockItem:
    item = db.scalar(select(StockItem).where(StockItem.id == item_id, StockItem.company_id == company_id))
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stock item not found.")
    return item

def update_stock_item(
    db: Session, item_id: int, company_id: int, item_in: StockItemUpdate, user_id: int
) -> StockItem:
    item = get_stock_item_by_id(db, item_id, company_id)
    
    if item_in.sku and item_in.sku != item.sku:
        existing = db.scalar(select(StockItem).where(StockItem.sku == item_in.sku, StockItem.company_id == company_id))
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="SKU already exists.")

    if item_in.stock_group_id:
        group = db.scalar(select(StockGroup).where(StockGroup.id == item_in.stock_group_id, StockGroup.company_id == company_id))
        if not group:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Stock group not found.")

    if item_in.unit_id:
        unit = db.scalar(select(Unit).where(Unit.id == item_in.unit_id, Unit.company_id == company_id))
        if not unit:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unit not found.")

    update_data = item_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)

    db.add(item)
    db.commit()
    db.refresh(item)
    
    log_action(db, user_id, "UPDATE", "stock_items", item.id, company_id, item_in.model_dump(mode='json', exclude_unset=True))
    db.commit()
    return item

def delete_stock_item(db: Session, item_id: int, company_id: int, user_id: int) -> None:
    item = get_stock_item_by_id(db, item_id, company_id)
    db.delete(item)
    log_action(db, user_id, "DELETE", "stock_items", item_id, company_id)
    db.commit()
