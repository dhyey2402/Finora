"""
SmartERP — FastAPI Application Entry Point
Day 2: Minimal API with root, health, and database health endpoints.
No authentication or business routes are included at this stage.
"""

from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.config import settings
from app.database.dependencies import get_db

# ------------------------------------------------------------------
# Application Instance
# ------------------------------------------------------------------
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "SmartERP — Billing, Inventory & Accounting Management System. "
        "Day 1 & Day 2 foundation: database schema and API scaffold."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
)


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