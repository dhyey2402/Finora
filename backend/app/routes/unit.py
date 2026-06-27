from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database.dependencies import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.schemas.unit import UnitCreate, UnitUpdate, UnitResponse
from app.schemas.common import PaginatedResponse
from app.services.unit_service import (
    create_unit, get_units, get_unit_by_id, update_unit, delete_unit
)

router = APIRouter(prefix="/units", tags=["Units"])

@router.post("", response_model=UnitResponse, status_code=status.HTTP_201_CREATED)
def create_new_unit(
    unit_in: UnitCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_unit(db, unit_in, current_user.id)

@router.get("", response_model=PaginatedResponse[UnitResponse])
def list_units(
    company_id: int,
    search: str | None = None,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    items, total = get_units(db, company_id, search, limit, offset)
    return PaginatedResponse(items=items, total=total, limit=limit, offset=offset)

@router.get("/{unit_id}", response_model=UnitResponse)
def get_unit(
    unit_id: int,
    company_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_unit_by_id(db, unit_id, company_id)

@router.put("/{unit_id}", response_model=UnitResponse)
def update_existing_unit(
    unit_id: int,
    company_id: int,
    unit_in: UnitUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_unit(db, unit_id, company_id, unit_in, current_user.id)

@router.delete("/{unit_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_unit(
    unit_id: int,
    company_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    delete_unit(db, unit_id, company_id, current_user.id)
