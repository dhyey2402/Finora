"""
SmartERP — Stock Item Model
Represents a specific inventory product / SKU.
Tracks current quantity and standard selling rate.
Scoped to a Company.
"""

from decimal import Decimal
from sqlalchemy import String, ForeignKey, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.db import Base
from app.models.mixins import TimestampMixin


class StockItem(Base, TimestampMixin):
    __tablename__ = "stock_items"

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
    # Classification
    # ------------------------------------------------------------------
    stock_group_id: Mapped[int] = mapped_column(
        ForeignKey("stock_groups.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    unit_id: Mapped[int] = mapped_column(
        ForeignKey("units.id", ondelete="RESTRICT"), nullable=False
    )

    # ------------------------------------------------------------------
    # Item Details
    # ------------------------------------------------------------------
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    sku: Mapped[str | None] = mapped_column(String(100), unique=False, index=True)
    quantity: Mapped[Decimal] = mapped_column(
        Numeric(15, 3), default=0.000, nullable=False
    )
    rate: Mapped[Decimal] = mapped_column(
        Numeric(15, 2), default=0.00, nullable=False
    )

    # ------------------------------------------------------------------
    # Relationships
    # ------------------------------------------------------------------
    company: Mapped["Company"] = relationship("Company", back_populates="stock_items")
    stock_group: Mapped["StockGroup"] = relationship(
        "StockGroup", back_populates="stock_items"
    )
    unit: Mapped["Unit"] = relationship("Unit", back_populates="stock_items")
    inventory_transactions: Mapped[list["InventoryTransaction"]] = relationship(
        "InventoryTransaction", back_populates="stock_item"
    )

    def __repr__(self) -> str:
        return f"<StockItem id={self.id} name={self.name!r} qty={self.quantity}>"