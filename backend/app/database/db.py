"""
SmartERP — Database Engine & Session Factory
Provides the SQLAlchemy 2.0 engine, SessionLocal, and the declarative Base.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from app.core.config import settings


# -----------------------------------------------------------------
# Engine
# connect_args required for NeonDB / pgbouncer compatibility
# -----------------------------------------------------------------
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"sslmode": "require"}, # Required for NeonDB / PgBouncer
    pool_pre_ping=True,       # Drops stale connections before use
    pool_recycle=300,         # Recycle connections before they are dropped by the pooler
    pool_size=5,              # Number of persistent connections
    max_overflow=10,          # Extra connections allowed above pool_size
    echo=settings.DEBUG,      # Log SQL when DEBUG=True
)

# -----------------------------------------------------------------
# Session Factory
# -----------------------------------------------------------------
SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,   # Prevents lazy-load errors after commit
)


# -----------------------------------------------------------------
# Declarative Base
# All SQLAlchemy models inherit from this class.
# -----------------------------------------------------------------
class Base(DeclarativeBase):
    pass