from sqlalchemy.orm import Session
from sqlalchemy import select, func
from fastapi import HTTPException, status
from typing import Sequence, Tuple

from app.models.unit import Unit
from app.models.company import Company
from app.schemas.unit import UnitCreate, UnitUpdate
from app.services.audit_service import log_action

def create_unit(db: Session, unit_in: UnitCreate, user_id: int) -> Unit:
    company = db.scalar(select(Company).where(Company.id == unit_in.company_id))
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found.")

    db_unit = Unit(
        company_id=unit_in.company_id,
        name=unit_in.name,
        abbreviation=unit_in.abbreviation,
    )
    db.add(db_unit)
    db.commit()
    db.refresh(db_unit)
    
    log_action(db, user_id, "CREATE", "units", db_unit.id, unit_in.company_id, unit_in.model_dump())
    db.commit()
    return db_unit

def get_units(
    db: Session, 
    company_id: int,
    search: str | None = None,
    limit: int = 100,
    offset: int = 0
) -> Tuple[Sequence[Unit], int]:
    stmt = select(Unit).where(Unit.company_id == company_id)
    if search:
        stmt = stmt.where(Unit.name.ilike(f"%{search}%"))
        
    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    stmt = stmt.order_by(Unit.created_at.desc()).limit(limit).offset(offset)
    items = db.scalars(stmt).all()
    
    return items, total

def get_unit_by_id(db: Session, unit_id: int, company_id: int) -> Unit:
    unit = db.scalar(select(Unit).where(Unit.id == unit_id, Unit.company_id == company_id))
    if not unit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unit not found.")
    return unit

def update_unit(
    db: Session, unit_id: int, company_id: int, unit_in: UnitUpdate, user_id: int
) -> Unit:
    unit = get_unit_by_id(db, unit_id, company_id)
    update_data = unit_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(unit, field, value)

    db.add(unit)
    db.commit()
    db.refresh(unit)
    
    log_action(db, user_id, "UPDATE", "units", unit.id, company_id, update_data)
    db.commit()
    return unit

def delete_unit(db: Session, unit_id: int, company_id: int, user_id: int) -> None:
    unit = get_unit_by_id(db, unit_id, company_id)
    db.delete(unit)
    log_action(db, user_id, "DELETE", "units", unit_id, company_id)
    db.commit()
