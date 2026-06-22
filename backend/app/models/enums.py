"""
SmartERP — SQLAlchemy Enum Definitions
Centralised enum declarations used across multiple models.
Using Python enums with SQLAlchemy Enum type prevents invalid data
from being inserted at the database level.
"""

import enum


class VoucherTypeEnum(str, enum.Enum):
    """
    Accounting voucher classifications.
    - RECEIPT   : Money received from a party
    - PAYMENT   : Money paid to a party
    - JOURNAL   : Internal adjustment between ledgers
    - CONTRA    : Transfer between cash and bank accounts
    - SALES     : Sales voucher (linked to sale transactions)
    - PURCHASE  : Purchase voucher (linked to purchase transactions)
    """
    RECEIPT = "Receipt"
    PAYMENT = "Payment"
    JOURNAL = "Journal"
    CONTRA = "Contra"
    SALES = "Sales"
    PURCHASE = "Purchase"


class InvoiceStatusEnum(str, enum.Enum):
    """
    Billing invoice lifecycle states.
    - UNPAID    : Invoice issued, payment not yet received
    - PAID      : Payment received in full
    - CANCELLED : Invoice voided / reversed
    """
    UNPAID = "Unpaid"
    PAID = "Paid"
    CANCELLED = "Cancelled"


class TransactionTypeEnum(str, enum.Enum):
    """
    Inventory stock movement directions.
    - PURCHASE   : Stock added via a purchase order
    - SALE       : Stock reduced via a sales order
    - ADJUSTMENT : Manual stock correction / write-off
    """
    PURCHASE = "Purchase"
    SALE = "Sale"
    ADJUSTMENT = "Adjustment"
