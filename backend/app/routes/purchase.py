from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import Any

from app.database.dependencies import get_db
from app.models.user import User
from app.core.auth import get_current_user
from app.schemas.purchase import PurchaseResponse, PurchaseCreate
from app.schemas.common import PaginatedResponse
from app.services.purchase_service import create_purchase, get_purchases, get_purchase

router = APIRouter(prefix="/purchases", tags=["Purchases"])

@router.post("", response_model=PurchaseResponse, status_code=status.HTTP_201_CREATED)
def create_new_purchase(
    company_id: int,
    purchase_in: PurchaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    return create_purchase(db=db, purchase_in=purchase_in, user_id=current_user.id, company_id=company_id)

@router.get("", response_model=PaginatedResponse[PurchaseResponse])
def read_purchases(
    company_id: int,
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    items, total = get_purchases(db=db, company_id=company_id, limit=limit, offset=offset)
    return {"items": items, "total": total, "limit": limit, "offset": offset}

@router.get("/{purchase_id}", response_model=PurchaseResponse)
def read_purchase(
    purchase_id: int,
    company_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    return get_purchase(db=db, purchase_id=purchase_id, company_id=company_id)
