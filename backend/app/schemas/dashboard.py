from pydantic import BaseModel
from app.schemas.audit_log import AuditLogResponse

class DashboardSummaryResponse(BaseModel):
    #Dashboard summary response.
    #Company Count
    companies_count: int
    #Customer Count
    customers_count: int
    #Supplier Count
    suppliers_count: int
    #Inventory Count
    inventory_count: int
    #Recent Actions
    recent_actions: list[AuditLogResponse]
    #Income
    income: float
    #Expenses
    expenses: float
    #Net Profit
    net_profit: float

    model_config = {"from_attributes": True}