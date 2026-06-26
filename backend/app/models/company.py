"""
SmartERP — Company Model
"""

from sqlalchemy import String, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.db import Base
from app.models.mixins import TimestampMixin


class Company(Base, TimestampMixin):
    __tablename__ = "companies"

    # ------------------------------------------------------------------
    # Primary Key
    # ------------------------------------------------------------------
    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    # ------------------------------------------------------------------
    # Ownership — user who created / manages this company
    # ------------------------------------------------------------------
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True
    )

    # ------------------------------------------------------------------
    # Company Details
    # ------------------------------------------------------------------
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    address: Mapped[str | None] = mapped_column(String(500))
    contact_number: Mapped[str | None] = mapped_column(String(20))
    state: Mapped[str | None] = mapped_column(String(100))
    gst_number: Mapped[str | None] = mapped_column(String(15))
    financial_year: Mapped[str | None] = mapped_column(String(9))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # ------------------------------------------------------------------
    # Relationships
    # ------------------------------------------------------------------
    owner: Mapped["User"] = relationship("User", back_populates="companies")

    groups: Mapped[list["Group"]] = relationship(
        "Group", back_populates="company", cascade="all, delete-orphan"
    )
    ledgers: Mapped[list["Ledger"]] = relationship(
        "Ledger", back_populates="company", cascade="all, delete-orphan"
    )
    customers: Mapped[list["Customer"]] = relationship(
        "Customer", back_populates="company", cascade="all, delete-orphan"
    )
    suppliers: Mapped[list["Supplier"]] = relationship(
        "Supplier", back_populates="company", cascade="all, delete-orphan"
    )
    units: Mapped[list["Unit"]] = relationship(
        "Unit", back_populates="company", cascade="all, delete-orphan"
    )
    stock_groups: Mapped[list["StockGroup"]] = relationship(
        "StockGroup", back_populates="company", cascade="all, delete-orphan"
    )
    stock_items: Mapped[list["StockItem"]] = relationship(
        "StockItem", back_populates="company", cascade="all, delete-orphan"
    )
    purchases: Mapped[list["Purchase"]] = relationship(
        "Purchase", back_populates="company", cascade="all, delete-orphan"
    )
    sales: Mapped[list["Sale"]] = relationship(
        "Sale", back_populates="company", cascade="all, delete-orphan"
    )
    invoices: Mapped[list["Invoice"]] = relationship(
        "Invoice", back_populates="company", cascade="all, delete-orphan"
    )
    voucher_entries: Mapped[list["VoucherEntry"]] = relationship(
        "VoucherEntry", back_populates="company", cascade="all, delete-orphan"
    )
    inventory_transactions: Mapped[list["InventoryTransaction"]] = relationship(
        "InventoryTransaction", back_populates="company", cascade="all, delete-orphan"
    )
    audit_logs: Mapped[list["AuditLog"]] = relationship(
        "AuditLog", back_populates="company", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Company id={self.id} name={self.name!r}>"