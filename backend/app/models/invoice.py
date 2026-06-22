"""
SmartERP — Invoice Model
A billing document generated from a sale. Tracks payment status.
Scoped to a Company.
"""

from decimal import Decimal
from datetime import date
from sqlalchemy import String, ForeignKey, Numeric, Date, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.db import Base
from app.models.mixins import TimestampMixin
from app.models.enums import InvoiceStatusEnum


class Invoice(Base, TimestampMixin):
    __tablename__ = "invoices"

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
    # Customer & Sale References
    # ------------------------------------------------------------------
    customer_id: Mapped[int] = mapped_column(
        ForeignKey("customers.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    sale_id: Mapped[int | None] = mapped_column(
        ForeignKey("sales.id", ondelete="SET NULL"), nullable=True, index=True
    )

    # ------------------------------------------------------------------
    # Invoice Details
    # ------------------------------------------------------------------
    invoice_number: Mapped[str] = mapped_column(
        String(100), nullable=False, index=True
    )
    invoice_date: Mapped[date] = mapped_column(Date, nullable=False)
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    total_amount: Mapped[Decimal] = mapped_column(
        Numeric(15, 2), default=0.00, nullable=False
    )
    status: Mapped[InvoiceStatusEnum] = mapped_column(
        Enum(InvoiceStatusEnum, name="invoice_status_enum"),
        default=InvoiceStatusEnum.UNPAID,
        nullable=False,
    )
    notes: Mapped[str | None] = mapped_column(String(1000))

    # ------------------------------------------------------------------
    # Relationships
    # ------------------------------------------------------------------
    company: Mapped["Company"] = relationship("Company", back_populates="invoices")
    customer: Mapped["Customer"] = relationship(
        "Customer", back_populates="invoices"
    )
    sale: Mapped["Sale | None"] = relationship("Sale", back_populates="invoices")

    def __repr__(self) -> str:
        return f"<Invoice id={self.id} number={self.invoice_number!r} status={self.status}>"