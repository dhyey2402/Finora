"""
SmartERP — Ledger Model
Represents individual ledger accounts (e.g. Cash, Bank, Debtors, Sales Account).
Each ledger belongs to a Group and is scoped to a Company.
"""

from decimal import Decimal
from sqlalchemy import String, ForeignKey, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.db import Base
from app.models.mixins import TimestampMixin


class Ledger(Base, TimestampMixin):
    __tablename__ = "ledgers"

    # ------------------------------------------------------------------
    # Primary Key
    # ------------------------------------------------------------------
    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    # ------------------------------------------------------------------
    # Company Scoping
    # ------------------------------------------------------------------
    company_id: Mapped[int] = mapped_column(
        ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True
    )

    # ------------------------------------------------------------------
    # Group Linkage
    # ------------------------------------------------------------------
    group_id: Mapped[int] = mapped_column(
        ForeignKey("groups.id", ondelete="RESTRICT"), nullable=False, index=True
    )

    # ------------------------------------------------------------------
    # Ledger Details
    # ------------------------------------------------------------------
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    code: Mapped[str | None] = mapped_column(String(50))
    opening_balance: Mapped[Decimal] = mapped_column(
        Numeric(15, 2), default=0.00, nullable=False
    )
    current_balance: Mapped[Decimal] = mapped_column(
        Numeric(15, 2), default=0.00, nullable=False
    )

    # ------------------------------------------------------------------
    # Relationships
    # ------------------------------------------------------------------
    company: Mapped["Company"] = relationship("Company", back_populates="ledgers")
    group: Mapped["Group"] = relationship("Group", back_populates="ledgers")
    voucher_entries: Mapped[list["VoucherEntry"]] = relationship(
        "VoucherEntry", back_populates="ledger"
    )

    def __repr__(self) -> str:
        return f"<Ledger id={self.id} name={self.name!r}>"