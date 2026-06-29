"""
SmartERP — FastAPI Application Entry Point
Day 2: Minimal API with root, health, and database health endpoints.
Day 3: Authentication module (register, login, JWT-protected /me).
Day 4: Company Management module (CRUD + ownership scoping).
"""

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.config import settings
from app.database.dependencies import get_db
from app.routes.auth import router as auth_router
from app.routes.company import router as company_router
from app.routes.dashboard import router as dashboard_router
from app.routes.customer import router as customer_router
from app.routes.supplier import router as supplier_router
from app.routes.unit import router as unit_router
from app.routes.stock_group import router as stock_group_router
from app.routes.stock_item import router as stock_item_router
from app.routes.inventory_transaction import router as inventory_transaction_router
from app.routes.group import router as group_router
from app.routes.ledger import router as ledger_router
from app.routes.purchase import router as purchase_router
from app.routes.sale import router as sale_router
from app.routes.invoice import router as invoice_router
# ------------------------------------------------------------------
# Application Instance
# ------------------------------------------------------------------
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "SmartERP — Billing, Inventory & Accounting Management System. "
        "Day 4: Company Management (CRUD · ownership scoping · soft delete)."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
)

# ------------------------------------------------------------------
# CORS Middleware — Allow Next.js frontend
# ------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------------------
# Route Registration
# ------------------------------------------------------------------
app.include_router(auth_router)
app.include_router(company_router)
app.include_router(dashboard_router)
app.include_router(customer_router)
app.include_router(supplier_router)
app.include_router(unit_router)
app.include_router(stock_group_router)
app.include_router(stock_item_router)
app.include_router(inventory_transaction_router)
app.include_router(group_router)
app.include_router(ledger_router)
app.include_router(purchase_router)
app.include_router(sale_router)
app.include_router(invoice_router)
# ------------------------------------------------------------------
# Root Endpoint
# ------------------------------------------------------------------
@app.get("/", tags=["Root"])
def root():
    """
    Root endpoint — confirms the API is running.
    """
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs",
    }


# ------------------------------------------------------------------
# Health Check — Application
# ------------------------------------------------------------------
@app.get("/health", tags=["Health"])
def health_check():
    """
    Application health check.
    Returns status without touching the database.
    """
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }


# ------------------------------------------------------------------
# Health Check — Database
# ------------------------------------------------------------------
@app.get("/health/db", tags=["Health"])
def db_health(db: Session = Depends(get_db)):
    """
    Database connectivity check.
    Executes a lightweight SELECT 1 against the configured database.
    Returns an error if the database is unreachable.
    """
    try:
        db.execute(text("SELECT 1"))
        return {"database": "connected", "status": "healthy"}
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail=f"Database unreachable: {str(exc)}",
        )
