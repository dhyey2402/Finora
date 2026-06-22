"""
SmartERP — Purchase Model
Records a purchase transaction header from a supplier.
Inventory transactions are created as line items linked to a purchase.
Scoped to a Company.
"""

from decimal import Decimal
from datetime import date
from sqlalchemy import String, ForeignKey, Numeric, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.db import Base
from app.models.mixins import TimestampMixin


class Purchase(Base, TimestampMixin):
    __tablename__ = "purchases"

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
    # Supplier Reference
    # ------------------------------------------------------------------
    supplier_id: Mapped[int] = mapped_column(
        ForeignKey("suppliers.id", ondelete="RESTRICT"), nullable=False, index=True
    )

    # ------------------------------------------------------------------
    # Purchase Details
    # ------------------------------------------------------------------
    purchase_number: Mapped[str] = mapped_column(
        String(100), nullable=False, unique=False, index=True
    )
    purchase_date: Mapped[date] = mapped_column(Date, nullable=False)
    total_amount: Mapped[Decimal] = mapped_column(
        Numeric(15, 2), default=0.00, nullable=False
    )
    notes: Mapped[str | None] = mapped_column(String(1000))

    # ------------------------------------------------------------------
    # Relationships
    # ------------------------------------------------------------------
    company: Mapped["Company"] = relationship("Company", back_populates="purchases")
    supplier: Mapped["Supplier"] = relationship(
        "Supplier", back_populates="purchases"
    )
    inventory_transactions: Mapped[list["InventoryTransaction"]] = relationship(
        "InventoryTransaction", back_populates="purchase"
    )

    def __repr__(self) -> str:
        return f"<Purchase id={self.id} number={self.purchase_number!r}>"