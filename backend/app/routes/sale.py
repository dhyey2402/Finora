from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import Any

from app.database.dependencies import get_db
from app.models.user import User
from app.core.auth import get_current_user
from app.schemas.sale import SaleResponse, SaleCreate
from app.schemas.common import PaginatedResponse
from app.services.sale_service import create_sale, get_sales, get_sale

router = APIRouter(prefix="/sales", tags=["Sales"])

@router.post("", response_model=SaleResponse, status_code=status.HTTP_201_CREATED)
def create_new_sale(
    company_id: int,
    sale_in: SaleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    return create_sale(db=db, sale_in=sale_in, user_id=current_user.id, company_id=company_id)

@router.get("", response_model=PaginatedResponse[SaleResponse])
def read_sales(
    company_id: int,
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    items, total = get_sales(db=db, company_id=company_id, limit=limit, offset=offset)
    return {"items": items, "total": total, "limit": limit, "offset": offset}

@router.get("/{sale_id}", response_model=SaleResponse)
def read_sale(
    sale_id: int,
    company_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    return get_sale(db=db, sale_id=sale_id, company_id=company_id)
