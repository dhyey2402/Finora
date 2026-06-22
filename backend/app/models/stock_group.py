"""
SmartERP — Stock Group Model
Inventory classification groups (e.g. Electronics, Raw Materials, Finished Goods).
Supports nested groups via self-referential parent_id.
Scoped to a Company.
"""

from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.db import Base
from app.models.mixins import TimestampMixin


class StockGroup(Base, TimestampMixin):
    __tablename__ = "stock_groups"

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
    # Self-Referential Hierarchy
    # ------------------------------------------------------------------
    parent_id: Mapped[int | None] = mapped_column(
        ForeignKey("stock_groups.id", ondelete="SET NULL"), nullable=True
    )

    # ------------------------------------------------------------------
    # Stock Group Details
    # ------------------------------------------------------------------
    name: Mapped[str] = mapped_column(String(150), nullable=False)

    # ------------------------------------------------------------------
    # Relationships
    # ------------------------------------------------------------------
    company: Mapped["Company"] = relationship(
        "Company", back_populates="stock_groups"
    )
    parent: Mapped["StockGroup | None"] = relationship(
        "StockGroup", remote_side="StockGroup.id", back_populates="children"
    )
    children: Mapped[list["StockGroup"]] = relationship(
        "StockGroup", back_populates="parent"
    )
    stock_items: Mapped[list["StockItem"]] = relationship(
        "StockItem", back_populates="stock_group"
    )

    def __repr__(self) -> str:
        return f"<StockGroup id={self.id} name={self.name!r}>"