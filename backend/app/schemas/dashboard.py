from pydantic import BaseModel
from app.schemas.company import CompanyResponse

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
    #Recent Companies
    recent_companies: list[CompanyResponse]
    #Income
    income: float
    #Expenses
    expenses: float
    #Net Profit
    net_profit: float

    model_config = {"from_attributes": True}