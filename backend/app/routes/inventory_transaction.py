from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database.dependencies import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.schemas.inventory_transaction import InventoryTransactionCreate, InventoryTransactionResponse
from app.schemas.common import PaginatedResponse
from app.services.inventory_transaction_service import (
    create_inventory_transaction, get_inventory_transactions
)

router = APIRouter(prefix="/inventory-transactions", tags=["Inventory Transactions"])

@router.post("", response_model=InventoryTransactionResponse, status_code=status.HTTP_201_CREATED)
def create_new_inventory_transaction(
    txn_in: InventoryTransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_inventory_transaction(db, txn_in, current_user.id)

@router.get("", response_model=PaginatedResponse[InventoryTransactionResponse])
def list_inventory_transactions(
    company_id: int,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    items, total = get_inventory_transactions(db, company_id, limit, offset)
    return PaginatedResponse(items=items, total=total, limit=limit, offset=offset)
