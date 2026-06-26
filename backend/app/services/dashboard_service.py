from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.models.company import Company
from app.models.customer import Customer
from app.models.supplier import Supplier
from app.models.stock_item import StockItem
from app.models.stock_group import StockGroup

def get_dashboard_summary(db: Session, user_id: int):

    # Get all company IDs owned by this user
    company_ids = db.execute(
        select(Company.id).where(Company.user_id == user_id, Company.is_active.is_(True))
    ).scalars().all()
    
    # Company Count
    company_count = db.execute(
        select(func.count()).select_from(Company).where(Company.user_id == user_id, Company.is_active.is_(True))
    ).scalar_one()

    # Customer Count
    customer_count = db.execute(select(func.count()).select_from(Customer).where(Customer.company_id.in_(company_ids))).scalar_one()

    # Supplier Count
    supplier_count = db.execute(select(func.count()).select_from(Supplier).where(Supplier.company_id.in_(company_ids))).scalar_one()

    # Inventory Count
    inventory_count = db.execute(
        select(func.count())
        .select_from(StockItem)
        .join(StockGroup, StockItem.stock_group_id == StockGroup.id)
        .where(StockGroup.company_id.in_(company_ids))
    ).scalar()

    # Recent Companies
    stmt = (
        select(Company)
        .where(Company.user_id == user_id)
        .where(Company.is_active.is_(True))
        .order_by(Company.created_at.desc())
        .limit(5)
    )
    recent_companies = db.execute(stmt).scalars().all()

    # Income
    income = 0
    # Expenses
    expenses = 0    

    # Net Profit

    net_profit = income - expenses
    # Return response
    return(
        {
            "companies_count": company_count,
            "customers_count": customer_count,
            "suppliers_count": supplier_count,
            "inventory_count": inventory_count,
            "recent_companies": recent_companies,
            "income": float(income),
            "expenses": float(expenses),
            "net_profit": float(net_profit)
        }
    )
    