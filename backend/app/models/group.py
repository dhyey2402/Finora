"""
SmartERP — Group Model
Represents accounting groups (e.g. Assets, Liabilities, Income, Expenses).
Supports nested group hierarchies via a self-referential parent_id.
"""

from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.db import Base
from app.models.mixins import TimestampMixin


class Group(Base, TimestampMixin):
    __tablename__ = "groups"

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
    # Self-Referential Hierarchy (parent group)
    # ------------------------------------------------------------------
    parent_id: Mapped[int | None] = mapped_column(
        ForeignKey("groups.id", ondelete="SET NULL"), nullable=True
    )

    # ------------------------------------------------------------------
    # Group Details
    # ------------------------------------------------------------------
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    code: Mapped[str | None] = mapped_column(String(50), unique=False)

    # ------------------------------------------------------------------
    # Relationships
    # ------------------------------------------------------------------
    company: Mapped["Company"] = relationship("Company", back_populates="groups")
    parent: Mapped["Group | None"] = relationship(
        "Group", remote_side="Group.id", back_populates="children"
    )
    children: Mapped[list["Group"]] = relationship(
        "Group", back_populates="parent"
    )
    ledgers: Mapped[list["Ledger"]] = relationship(
        "Ledger", back_populates="group"
    )

    def __repr__(self) -> str:
        return f"<Group id={self.id} name={self.name!r}>"