"""
SmartERP — Unit of Measurement Model
Defines units like Pieces, Kilograms, Litres, Boxes.
Stock items reference a unit for quantity tracking.
Scoped to a Company.
"""

from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.db import Base
from app.models.mixins import TimestampMixin


class Unit(Base, TimestampMixin):
    __tablename__ = "units"

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
    # Unit Details
    # ------------------------------------------------------------------
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    abbreviation: Mapped[str] = mapped_column(String(20), nullable=False)

    # ------------------------------------------------------------------
    # Relationships
    # ------------------------------------------------------------------
    company: Mapped["Company"] = relationship("Company", back_populates="units")
    stock_items: Mapped[list["StockItem"]] = relationship(
        "StockItem", back_populates="unit"
    )

    def __repr__(self) -> str:
        return f"<Unit id={self.id} name={self.name!r} abbr={self.abbreviation!r}>"