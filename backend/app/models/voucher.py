"""
SmartERP — Voucher Entry Model
Represents a double-entry accounting line item.
Each accounting transaction (payment, receipt, journal) consists of
two or more voucher entries (debit + credit) that must balance.
Scoped to a Company.
"""

from decimal import Decimal
from datetime import date
from sqlalchemy import String, ForeignKey, Numeric, Date, Enum, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.db import Base
from app.models.mixins import TimestampMixin
from app.models.enums import VoucherTypeEnum


class VoucherEntry(Base, TimestampMixin):
    __tablename__ = "voucher_entries"

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
    # Ledger Reference
    # ------------------------------------------------------------------
    ledger_id: Mapped[int] = mapped_column(
        ForeignKey("ledgers.id", ondelete="RESTRICT"), nullable=False, index=True
    )

    # ------------------------------------------------------------------
    # Voucher Details
    # ------------------------------------------------------------------
    voucher_number: Mapped[str] = mapped_column(
        String(100), nullable=False, index=True
    )
    voucher_date: Mapped[date] = mapped_column(Date, nullable=False)
    voucher_type: Mapped[VoucherTypeEnum] = mapped_column(
        Enum(VoucherTypeEnum, name="voucher_type_enum"),
        nullable=False,
    )

    # ------------------------------------------------------------------
    # Double-Entry Amounts (one side will be 0.00 for each line)
    # ------------------------------------------------------------------
    debit_amount: Mapped[Decimal] = mapped_column(
        Numeric(15, 2), default=0.00, nullable=False
    )
    credit_amount: Mapped[Decimal] = mapped_column(
        Numeric(15, 2), default=0.00, nullable=False
    )
    narration: Mapped[str | None] = mapped_column(Text)

    # ------------------------------------------------------------------
    # Relationships
    # ------------------------------------------------------------------
    company: Mapped["Company"] = relationship(
        "Company", back_populates="voucher_entries"
    )
    ledger: Mapped["Ledger"] = relationship("Ledger", back_populates="voucher_entries")

    def __repr__(self) -> str:
        return (
            f"<VoucherEntry id={self.id} type={self.voucher_type} "
            f"dr={self.debit_amount} cr={self.credit_amount}>"
        )