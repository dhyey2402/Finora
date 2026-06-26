"""
SmartERP — Customer Service
Business logic for managing customers, enforcing company-level isolation.
"""

from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import Sequence

from app.models.customer import Customer
from app.models.company import Company
from app.schemas.customer import CustomerCreate, CustomerUpdate
from app.services.audit_service import log_action


def create_customer(db: Session, customer_in: CustomerCreate, user_id: int) -> Customer:
    """Create a new customer after verifying the company exists."""
    company = db.query(Company).filter(Company.id == customer_in.company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found.",
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


def get_customers(db: Session, company_id: int) -> Sequence[Customer]:
    """Retrieve all customers for a given company."""
    return db.query(Customer).filter(Customer.company_id == company_id).all()


def get_customer_by_id(db: Session, customer_id: int, company_id: int) -> Customer:
    """Retrieve a specific customer, ensuring it belongs to the company."""
    customer = (
        db.query(Customer)
        .filter(Customer.id == customer_id, Customer.company_id == company_id)
        .first()
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
    customer = get_customer_by_id(db, customer_id, company_id)
    
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
