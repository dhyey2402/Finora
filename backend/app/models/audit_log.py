"""
SmartERP — Audit Log Model
Records every write action (create, update, delete) performed by a user
on any ERP table. Used for compliance, debugging, and change history.
Scoped to a Company.
"""

from datetime import datetime
from sqlalchemy import String, ForeignKey, DateTime, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.database.db import Base


class AuditLog(Base):
    """
    NOTE: AuditLog intentionally does NOT use TimestampMixin.
    - It has a single `timestamp` column (the moment the action occurred).
    - It must NEVER be updated after creation, so updated_at is omitted.
    """

    __tablename__ = "audit_logs"

    # ------------------------------------------------------------------
    # Primary Key
    # ------------------------------------------------------------------
    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    # ------------------------------------------------------------------
    # Company Scoping
    # ------------------------------------------------------------------
    company_id: Mapped[int | None] = mapped_column(
        ForeignKey("companies.id", ondelete="SET NULL"), nullable=True, index=True
    )

    # ------------------------------------------------------------------
    # Actor
    # ------------------------------------------------------------------
    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )

    # ------------------------------------------------------------------
    # Action Metadata
    # ------------------------------------------------------------------
    action: Mapped[str] = mapped_column(
        String(50), nullable=False
    )  # CREATE | UPDATE | DELETE
    table_name: Mapped[str] = mapped_column(String(100), nullable=False)
    record_id: Mapped[int | None] = mapped_column(nullable=True)
    details: Mapped[dict | None] = mapped_column(
        JSON, nullable=True
    )  # Stores before/after snapshot

    # ------------------------------------------------------------------
    # Timestamp (immutable — no updated_at)
    # ------------------------------------------------------------------
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # ------------------------------------------------------------------
    # Relationships
    # ------------------------------------------------------------------
    company: Mapped["Company | None"] = relationship(
        "Company", back_populates="audit_logs"
    )
    user: Mapped["User | None"] = relationship("User", back_populates="audit_logs")

    def __repr__(self) -> str:
        return (
            f"<AuditLog id={self.id} action={self.action!r} "
            f"table={self.table_name!r} record={self.record_id}>"
        )