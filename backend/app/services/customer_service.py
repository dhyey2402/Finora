"""
SmartERP — Customer Service
Business logic for managing customers, enforcing company-level isolation.
"""

from sqlalchemy.orm import Session
from sqlalchemy import select, func, or_
from fastapi import HTTPException, status
from typing import Sequence, Tuple

from app.models.customer import Customer
from app.models.company import Company
from app.schemas.customer import CustomerCreate, CustomerUpdate
from app.services.audit_service import log_action


def create_customer(db: Session, customer_in: CustomerCreate, user_id: int) -> Customer:
    """Create a new customer after verifying the company exists."""
    # Verify that the company exists in the system before proceeding with customer creation.
    company = db.scalar(select(Company).where(Company.id == customer_in.company_id))
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found.",
        )

    # Validate duplicate email if provided
    if customer_in.email:
        existing_customer = db.scalar(
            select(Customer).where(
                Customer.company_id == customer_in.company_id,
                Customer.email == customer_in.email
            )
        )
        if existing_customer:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A customer with this email already exists in this company."
            )

    db_customer = Customer(
        company_id=customer_in.company_id,
        name=customer_in.name,
        email=customer_in.email,
        phone=customer_in.phone,
        address=customer_in.address,
    )
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    
    log_action(
        db=db,
        user_id=user_id,
        action="CREATE",
        table_name="customers",
        record_id=db_customer.id,
        company_id=customer_in.company_id,
        details=customer_in.model_dump()
    )
    db.commit()

    return db_customer


def get_customers(
    db: Session, 
    company_id: int,
    search: str | None = None,
    limit: int = 100,
    offset: int = 0
) -> Tuple[Sequence[Customer], int]:
    """Retrieve all customers for a given company with pagination and search."""
    stmt = select(Customer).where(Customer.company_id == company_id)
    
    if search:
        search_term = f"%{search}%"
        stmt = stmt.where(Customer.name.ilike(search_term))
        
    # Count total matching records before limit/offset
    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    
    stmt = stmt.order_by(Customer.created_at.desc()).limit(limit).offset(offset)
    items = db.scalars(stmt).all()
    
    return items, total


def get_customer_by_id(db: Session, customer_id: int, company_id: int) -> Customer:
    """Retrieve a specific customer, ensuring it belongs to the company."""
    customer = db.scalar(
        select(Customer).where(
            Customer.id == customer_id, 
            Customer.company_id == company_id
        )
    )
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found or access denied.",
        )
    return customer


def update_customer(
    db: Session, customer_id: int, company_id: int, customer_in: CustomerUpdate, user_id: int
) -> Customer:
    """Update a customer's details."""
    # Retrieve the customer, ensuring it belongs to the specified company to prevent unauthorized modifications.
    customer = get_customer_by_id(db, customer_id, company_id)

    # Validate duplicate email if provided and changed
    if customer_in.email and customer_in.email != customer.email:
        existing_customer = db.scalar(
            select(Customer).where(
                Customer.company_id == company_id,
                Customer.email == customer_in.email
            )
        )
        if existing_customer:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A customer with this email already exists in this company."
            )
    
    # Extract only the provided fields for a partial update on the customer record.
    update_data = customer_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(customer, field, value)

    db.add(customer)
    db.commit()
    db.refresh(customer)
    
    log_action(
        db=db,
        user_id=user_id,
        action="UPDATE",
        table_name="customers",
        record_id=customer.id,
        company_id=company_id,
        details=update_data
    )
    db.commit()

    return customer


def delete_customer(db: Session, customer_id: int, company_id: int, user_id: int) -> None:
    """Delete a customer."""
    customer = get_customer_by_id(db, customer_id, company_id)
    db.delete(customer)
    log_action(
        db=db,
        user_id=user_id,
        action="DELETE",
        table_name="customers",
        record_id=customer_id,
        company_id=company_id
    )
    db.commit()
