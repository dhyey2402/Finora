"""
SmartERP — Inventory Transaction Model
Records every stock movement (in or out) for a stock item.
Linked optionally to a Purchase or Sale for traceability.
Scoped to a Company.
"""

from decimal import Decimal
from datetime import date
from sqlalchemy import ForeignKey, Numeric, Date, Enum, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.db import Base
from app.models.mixins import TimestampMixin
from app.models.enums import TransactionTypeEnum


class InventoryTransaction(Base, TimestampMixin):
    __tablename__ = "inventory_transactions"

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
    # Stock Item Reference
    # ------------------------------------------------------------------
    stock_item_id: Mapped[int] = mapped_column(
        ForeignKey("stock_items.id", ondelete="RESTRICT"), nullable=False, index=True
    )

    # ------------------------------------------------------------------
    # Optional Source Document References
    # ------------------------------------------------------------------
    purchase_id: Mapped[int | None] = mapped_column(
        ForeignKey("purchases.id", ondelete="SET NULL"), nullable=True, index=True
    )
    sale_id: Mapped[int | None] = mapped_column(
        ForeignKey("sales.id", ondelete="SET NULL"), nullable=True, index=True
    )

    # ------------------------------------------------------------------
    # Transaction Details
    # ------------------------------------------------------------------
    transaction_type: Mapped[TransactionTypeEnum] = mapped_column(
        Enum(TransactionTypeEnum, name="transaction_type_enum"),
        nullable=False,
    )
    transaction_date: Mapped[date] = mapped_column(Date, nullable=False)
    quantity: Mapped[Decimal] = mapped_column(
        Numeric(15, 3), nullable=False
    )
    rate: Mapped[Decimal] = mapped_column(
        Numeric(15, 2), nullable=False
    )
    notes: Mapped[str | None] = mapped_column(Text)

    # ------------------------------------------------------------------
    # Relationships
    # ------------------------------------------------------------------
    company: Mapped["Company"] = relationship(
        "Company", back_populates="inventory_transactions"
    )
    stock_item: Mapped["StockItem"] = relationship(
        "StockItem", back_populates="inventory_transactions"
    )
    purchase: Mapped["Purchase | None"] = relationship(
        "Purchase", back_populates="inventory_transactions"
    )
    sale: Mapped["Sale | None"] = relationship(
        "Sale", back_populates="inventory_transactions"
    )

    def __repr__(self) -> str:
        return (
            f"<InventoryTransaction id={self.id} "
            f"type={self.transaction_type} qty={self.quantity}>"
        )