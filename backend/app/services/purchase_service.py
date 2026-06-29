from sqlalchemy.orm import Session
from sqlalchemy import select, func
from fastapi import HTTPException, status
from typing import Sequence, Tuple

from app.models.purchase import Purchase
from app.models.purchase_item import PurchaseItem
from app.models.supplier import Supplier
from app.schemas.purchase import PurchaseCreate, PurchaseUpdate
from app.services.audit_service import log_action
from app.services.inventory_transaction_service import create_inventory_transaction
from app.schemas.inventory_transaction import InventoryTransactionCreate
from app.models.enums import TransactionTypeEnum

def create_purchase(db: Session, purchase_in: PurchaseCreate, user_id: int, company_id: int) -> Purchase:
    supplier = db.scalar(select(Supplier).where(Supplier.id == purchase_in.supplier_id, Supplier.company_id == company_id))
    if not supplier:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Supplier not found.")

    db_purchase = Purchase(
        company_id=company_id,
        supplier_id=purchase_in.supplier_id,
        purchase_number=purchase_in.purchase_number,
        purchase_date=purchase_in.purchase_date,
        total_amount=purchase_in.total_amount,
        notes=purchase_in.notes
    )
    db.add(db_purchase)
    db.flush()

    for item_in in purchase_in.items:
        db_item = PurchaseItem(
            purchase_id=db_purchase.id,
            stock_item_id=item_in.stock_item_id,
            quantity=item_in.quantity,
            rate=item_in.rate,
            tax_amount=item_in.tax_amount,
            discount_amount=item_in.discount_amount,
            line_total=item_in.line_total
        )
        db.add(db_item)
        db.flush()

        txn_in = InventoryTransactionCreate(
            company_id=company_id,
            stock_item_id=item_in.stock_item_id,
            purchase_id=db_purchase.id,
            sale_id=None,
            transaction_type=TransactionTypeEnum.PURCHASE,
            transaction_date=purchase_in.purchase_date,
            quantity=item_in.quantity,
            rate=item_in.rate,
            notes=f"Purchase {purchase_in.purchase_number}"
        )
        create_inventory_transaction(db, txn_in, user_id)

    db.commit()
    db.refresh(db_purchase)
    
    # Needs stringification for dumping decimal safely
    dumped = purchase_in.model_dump(mode='json')
    log_action(db, user_id, "CREATE", "purchases", db_purchase.id, company_id, dumped)
    return db_purchase

def get_purchases(db: Session, company_id: int, limit: int = 100, offset: int = 0) -> Tuple[Sequence[Purchase], int]:
    stmt = select(Purchase).where(Purchase.company_id == company_id)
    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    stmt = stmt.order_by(Purchase.purchase_date.desc(), Purchase.created_at.desc()).limit(limit).offset(offset)
    items = db.scalars(stmt).all()
    return items, total

def get_purchase(db: Session, purchase_id: int, company_id: int) -> Purchase:
    purchase = db.scalar(select(Purchase).where(Purchase.id == purchase_id, Purchase.company_id == company_id))
    if not purchase:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Purchase not found.")
    return purchase
