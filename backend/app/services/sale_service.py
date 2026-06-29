from sqlalchemy.orm import Session
from sqlalchemy import select, func
from fastapi import HTTPException, status
from typing import Sequence, Tuple

from app.models.sale import Sale
from app.models.sale_item import SaleItem
from app.models.customer import Customer
from app.models.stock_item import StockItem
from app.schemas.sale import SaleCreate, SaleUpdate
from app.services.audit_service import log_action
from app.services.inventory_transaction_service import create_inventory_transaction
from app.schemas.inventory_transaction import InventoryTransactionCreate
from app.models.enums import TransactionTypeEnum

def create_sale(db: Session, sale_in: SaleCreate, user_id: int, company_id: int) -> Sale:
    customer = db.scalar(select(Customer).where(Customer.id == sale_in.customer_id, Customer.company_id == company_id))
    if not customer:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Customer not found.")

    db_sale = Sale(
        company_id=company_id,
        customer_id=sale_in.customer_id,
        sale_number=sale_in.sale_number,
        sale_date=sale_in.sale_date,
        total_amount=sale_in.total_amount,
        notes=sale_in.notes
    )
    db.add(db_sale)
    db.flush()

    for item_in in sale_in.items:
        stock_item = db.scalar(select(StockItem).where(StockItem.id == item_in.stock_item_id, StockItem.company_id == company_id))
        if not stock_item:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Stock item {item_in.stock_item_id} not found.")
            
        if stock_item.quantity < item_in.quantity:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Insufficient stock for {stock_item.name}.")

        db_item = SaleItem(
            sale_id=db_sale.id,
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
            purchase_id=None,
            sale_id=db_sale.id,
            transaction_type=TransactionTypeEnum.SALE,
            transaction_date=sale_in.sale_date,
            quantity=item_in.quantity,
            rate=item_in.rate,
            notes=f"Sale {sale_in.sale_number}"
        )
        create_inventory_transaction(db, txn_in, user_id)

    db.commit()
    db.refresh(db_sale)
    
    dumped = sale_in.model_dump(mode='json')
    log_action(db, user_id, "CREATE", "sales", db_sale.id, company_id, dumped)
    return db_sale

def get_sales(db: Session, company_id: int, limit: int = 100, offset: int = 0) -> Tuple[Sequence[Sale], int]:
    stmt = select(Sale).where(Sale.company_id == company_id)
    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    stmt = stmt.order_by(Sale.sale_date.desc(), Sale.created_at.desc()).limit(limit).offset(offset)
    items = db.scalars(stmt).all()
    return items, total

def get_sale(db: Session, sale_id: int, company_id: int) -> Sale:
    sale = db.scalar(select(Sale).where(Sale.id == sale_id, Sale.company_id == company_id))
    if not sale:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sale not found.")
    return sale
