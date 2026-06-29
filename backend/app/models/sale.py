"""
SmartERP — Sale Model
Records a sales transaction header for a customer.
Linked to invoices and inventory transactions.
Scoped to a Company.
"""

from decimal import Decimal
from datetime import date
from sqlalchemy import String, ForeignKey, Numeric, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.db import Base
from app.models.mixins import TimestampMixin


class Sale(Base, TimestampMixin):
    __tablename__ = "sales"

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
    # Customer Reference
    # ------------------------------------------------------------------
    customer_id: Mapped[int] = mapped_column(
        ForeignKey("customers.id", ondelete="RESTRICT"), nullable=False, index=True
    )

    # ------------------------------------------------------------------
    # Sale Details
    # ------------------------------------------------------------------
    sale_number: Mapped[str] = mapped_column(
        String(100), nullable=False, index=True
    )
    sale_date: Mapped[date] = mapped_column(Date, nullable=False)
    total_amount: Mapped[Decimal] = mapped_column(
        Numeric(15, 2), default=0.00, nullable=False
    )
    notes: Mapped[str | None] = mapped_column(String(1000))

    # ------------------------------------------------------------------
    # Relationships
    # ------------------------------------------------------------------
    company: Mapped["Company"] = relationship("Company", back_populates="sales")
    customer: Mapped["Customer"] = relationship("Customer", back_populates="sales")
    invoices: Mapped[list["Invoice"]] = relationship("Invoice", back_populates="sale")
    inventory_transactions: Mapped[list["InventoryTransaction"]] = relationship(
        "InventoryTransaction", back_populates="sale"
    )
    items: Mapped[list["SaleItem"]] = relationship(
        "SaleItem", back_populates="sale", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Sale id={self.id} number={self.sale_number!r}>"