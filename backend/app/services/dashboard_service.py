from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.models.company import Company
from app.models.customer import Customer
from app.models.supplier import Supplier
from app.models.stock_item import StockItem
from app.models.stock_group import StockGroup

from app.models.audit_log import AuditLog

def get_dashboard_summary(db: Session, user_id: int):
    """Retrieve key metrics and recent activities for the user's dashboard."""

    # Retrieve all active companies owned by the authenticated user to scope the dashboard data.
    company_ids = db.execute(
        select(Company.id).where(Company.user_id == user_id, Company.is_active.is_(True))
    ).scalars().all()
    
    # Count only active companies that belong to the user.
    company_count = db.execute(
        select(func.count()).select_from(Company).where(Company.user_id == user_id, Company.is_active.is_(True))
    ).scalar_one()

    # Aggregate the total number of customers across all active companies.
    customer_count = db.execute(select(func.count()).select_from(Customer).where(Customer.company_id.in_(company_ids))).scalar_one()

    # Aggregate the total number of suppliers across all active companies.
    supplier_count = db.execute(select(func.count()).select_from(Supplier).where(Supplier.company_id.in_(company_ids))).scalar_one()

    # Calculate total inventory items linked to stock groups within the user's companies.
    inventory_count = db.execute(
        select(func.count())
        .select_from(StockItem)
        .join(StockGroup, StockItem.stock_group_id == StockGroup.id)
        .where(StockGroup.company_id.in_(company_ids))
    ).scalar()

    # Fetch the five most recent audit log entries to display user activity.
    stmt = (
        select(AuditLog)
        .where(AuditLog.user_id == user_id)
        .order_by(AuditLog.timestamp.desc())
        .limit(5)
    )
    recent_actions = db.execute(stmt).scalars().all()

    # Financial metrics are placeholders pending full ledger implementation.
    income = 0
    expenses = 0    

    # Calculate net profit based on total income and expenses.
    net_profit = income - expenses

    return(
        {
            "companies_count": company_count,
            "customers_count": customer_count,
            "suppliers_count": supplier_count,
            "inventory_count": inventory_count,
            "recent_actions": recent_actions,
            "income": float(income),
            "expenses": float(expenses),
            "net_profit": float(net_profit)
        }
    )