"""
SmartERP — Model Registration
Imports all SQLAlchemy models so that Alembic's autogenerate
can detect them via Base.metadata when running migrations.

IMPORTANT: This file must be imported in alembic/env.py BEFORE
           any call to Base.metadata is made.
"""

# Shared utilities — import first so models can reference them
from app.models.mixins import TimestampMixin  # noqa: F401
from app.models.enums import (               # noqa: F401
    VoucherTypeEnum,
    InvoiceStatusEnum,
    TransactionTypeEnum,
)

# Entity models — order matters: parents before children
from app.models.user import User                                      # noqa: F401
from app.models.company import Company                                # noqa: F401
from app.models.group import Group                                    # noqa: F401
from app.models.ledger import Ledger                                  # noqa: F401
from app.models.unit import Unit                                      # noqa: F401
from app.models.stock_group import StockGroup                         # noqa: F401
from app.models.stock_item import StockItem                           # noqa: F401
from app.models.customer import Customer                              # noqa: F401
from app.models.supplier import Supplier                              # noqa: F401
from app.models.purchase import Purchase                              # noqa: F401
from app.models.sale import Sale                                      # noqa: F401
from app.models.invoice import Invoice                                # noqa: F401
from app.models.voucher import VoucherEntry                           # noqa: F401
from app.models.inventory_transaction import InventoryTransaction     # noqa: F401
from app.models.audit_log import AuditLog                            # noqa: F401