from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database.dependencies import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.schemas.stock_item import StockItemCreate, StockItemUpdate, StockItemResponse
from app.schemas.common import PaginatedResponse
from app.services.stock_item_service import (
    create_stock_item, get_stock_items, get_stock_item_by_id, update_stock_item, delete_stock_item
)

router = APIRouter(prefix="/stock-items", tags=["Stock Items"])

@router.post("", response_model=StockItemResponse, status_code=status.HTTP_201_CREATED)
def create_new_stock_item(
    item_in: StockItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_stock_item(db, item_in, current_user.id)

@router.get("", response_model=PaginatedResponse[StockItemResponse])
def list_stock_items(
    company_id: int,
    search: str | None = None,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    items, total = get_stock_items(db, company_id, search, limit, offset)
    return PaginatedResponse(items=items, total=total, limit=limit, offset=offset)

@router.get("/{item_id}", response_model=StockItemResponse)
def get_stock_item(
    item_id: int,
    company_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_stock_item_by_id(db, item_id, company_id)

@router.put("/{item_id}", response_model=StockItemResponse)
def update_existing_stock_item(
    item_id: int,
    company_id: int,
    item_in: StockItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_stock_item(db, item_id, company_id, item_in, current_user.id)

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_stock_item(
    item_id: int,
    company_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    delete_stock_item(db, item_id, company_id, current_user.id)
