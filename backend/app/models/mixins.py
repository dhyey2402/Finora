"""
SmartERP — Timestamp Mixin
A reusable mixin providing created_at and updated_at columns
for all SQLAlchemy models. Eliminates column duplication.
"""

from datetime import datetime
from sqlalchemy import DateTime
from sqlalchemy.orm import mapped_column, MappedColumn
from sqlalchemy.sql import func


class TimestampMixin:
    """
    Mixin that adds created_at and updated_at audit columns.

    - created_at: Set by the database server on INSERT. Never changes.
    - updated_at: Set on INSERT and auto-refreshed by the database on UPDATE.
    """

    created_at: MappedColumn[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: MappedColumn[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
