from sqlalchemy.orm import Session
from sqlalchemy import select, func
from fastapi import HTTPException, status
from typing import Sequence, Tuple
from decimal import Decimal

from app.models.inventory_transaction import InventoryTransaction
from app.models.stock_item import StockItem
from app.models.company import Company
from app.schemas.inventory_transaction import InventoryTransactionCreate
from app.services.audit_service import log_action
from app.models.enums import TransactionTypeEnum

def create_inventory_transaction(
    db: Session, 
    txn_in: InventoryTransactionCreate, 
    user_id: int
) -> InventoryTransaction:
    company = db.scalar(select(Company).where(Company.id == txn_in.company_id))
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found.")

    item = db.scalar(select(StockItem).where(StockItem.id == txn_in.stock_item_id, StockItem.company_id == txn_in.company_id))
    if not item:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Stock item not found.")

    db_txn = InventoryTransaction(
        company_id=txn_in.company_id,
        stock_item_id=txn_in.stock_item_id,
        purchase_id=txn_in.purchase_id,
        sale_id=txn_in.sale_id,
        transaction_type=txn_in.transaction_type,
        transaction_date=txn_in.transaction_date,
        quantity=txn_in.quantity,
        rate=txn_in.rate,
        notes=txn_in.notes,
    )
    db.add(db_txn)

    # Update StockItem quantity based on transaction type
    if txn_in.transaction_type == TransactionTypeEnum.PURCHASE:
        item.quantity = Decimal(str(item.quantity)) + Decimal(str(txn_in.quantity))
    elif txn_in.transaction_type == TransactionTypeEnum.SALE:
        item.quantity = Decimal(str(item.quantity)) - Decimal(str(txn_in.quantity))
    elif txn_in.transaction_type == TransactionTypeEnum.ADJUSTMENT:
        # For adjustments, we'll assume the quantity provided is the delta (+ or -)
        item.quantity = Decimal(str(item.quantity)) + Decimal(str(txn_in.quantity))

    db.add(item)
    db.commit()
    db.refresh(db_txn)
    
    log_action(db, user_id, "CREATE", "inventory_transactions", db_txn.id, txn_in.company_id, txn_in.model_dump(mode='json'))
    db.commit()
    return db_txn

def get_inventory_transactions(
    db: Session, 
    company_id: int,
    limit: int = 100,
    offset: int = 0
) -> Tuple[Sequence[InventoryTransaction], int]:
    stmt = select(InventoryTransaction).where(InventoryTransaction.company_id == company_id)
        
    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    stmt = stmt.order_by(InventoryTransaction.transaction_date.desc(), InventoryTransaction.created_at.desc()).limit(limit).offset(offset)
    items = db.scalars(stmt).all()
    
    return items, total
