from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database.dependencies import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.schemas.stock_group import StockGroupCreate, StockGroupUpdate, StockGroupResponse
from app.schemas.common import PaginatedResponse
from app.services.stock_group_service import (
    create_stock_group, get_stock_groups, get_stock_group_by_id, update_stock_group, delete_stock_group
)

router = APIRouter(prefix="/stock-groups", tags=["Stock Groups"])

@router.post("", response_model=StockGroupResponse, status_code=status.HTTP_201_CREATED)
def create_new_stock_group(
    group_in: StockGroupCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_stock_group(db, group_in, current_user.id)

@router.get("", response_model=PaginatedResponse[StockGroupResponse])
def list_stock_groups(
    company_id: int,
    search: str | None = None,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    items, total = get_stock_groups(db, company_id, search, limit, offset)
    return PaginatedResponse(items=items, total=total, limit=limit, offset=offset)

@router.get("/{group_id}", response_model=StockGroupResponse)
def get_stock_group(
    group_id: int,
    company_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_stock_group_by_id(db, group_id, company_id)

@router.put("/{group_id}", response_model=StockGroupResponse)
def update_existing_stock_group(
    group_id: int,
    company_id: int,
    group_in: StockGroupUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_stock_group(db, group_id, company_id, group_in, current_user.id)

@router.delete("/{group_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_stock_group(
    group_id: int,
    company_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    delete_stock_group(db, group_id, company_id, current_user.id)
