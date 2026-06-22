"""
SmartERP — Database Dependency Injection
Provides the FastAPI get_db dependency for route handlers.
"""

from typing import Generator
from sqlalchemy.orm import Session

from app.database.db import SessionLocal


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that provides a SQLAlchemy database session.
    The session is automatically closed after the request completes,
    even if an exception occurs.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()