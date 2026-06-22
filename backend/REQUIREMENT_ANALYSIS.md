# SmartERP — Requirement Analysis Document
**Day 1 Deliverable | Version 1.0**

---

## 1. System Overview

SmartERP is a web-based Enterprise Resource Planning system designed for small and medium-sized businesses. It centralises accounting, inventory management, and billing operations into a single platform. The system is multi-company capable, meaning one user account can own and operate multiple company ledgers independently.

**Technology Stack**
| Layer | Technology |
|---|---|
| Backend API | FastAPI (Python 3.11+) |
| ORM | SQLAlchemy 2.0 |
| Database | PostgreSQL (Neon cloud-hosted) |
| Migrations | Alembic |
| Config | Pydantic Settings |

---

## 2. Core Business Workflow

```
User Registration / Login
        │
        ▼
Create Company (user_id → company)
        │
        ▼
Setup Master Data
   ├── Groups (accounting hierarchy)
   ├── Ledgers (linked to Groups)
   ├── Units (e.g. Pcs, Kg, Ltr)
   ├── Stock Groups (inventory hierarchy)
   └── Stock Items (linked to Group + Unit)
        │
        ▼
Add Parties
   ├── Customers
   └── Suppliers
        │
        ▼
Transactions
   ├── Purchase (from Supplier → Stock IN → Voucher Entry)
   ├── Sale (to Customer → Stock OUT → Invoice → Voucher Entry)
   └── Billing (Invoice generation from Sale)
        │
        ▼
Accounting
   └── Voucher Entries (double-entry ledger postings)
        │
        ▼
Reporting & Audit Logs
```

---

## 3. Modules & ERP Entities

### 3.1 Authentication & User Management
- Users can register and log in.
- Each user can create and manage multiple companies.
- Role-based access is out of scope for Day 1–2.

**Entity**: `users`

### 3.2 Company Management
- A company is the primary tenant in the ERP.
- All transactional data is isolated per company (`company_id` FK everywhere).
- One user can own many companies.

**Entity**: `companies`

### 3.3 Group Management (Accounting Groups)
- Accounting groups represent the chart of accounts hierarchy.
- Examples: Assets > Current Assets > Cash, Liabilities > Loans, Income > Sales Revenue.
- Groups are self-referential (parent–child nesting).

**Entity**: `groups`

### 3.4 Ledger Management
- Ledgers are individual accounts within a group.
- Examples: Cash Ledger (under Cash Group), Sales Account (under Income Group).
- Each ledger tracks opening and current balances.

**Entity**: `ledgers`

### 3.5 Inventory — Units
- Units of measurement for stock items (Pieces, Kgs, Litres, Boxes).

**Entity**: `units`

### 3.6 Inventory — Stock Groups
- Inventory categorisation hierarchy (Electronics, Raw Materials, etc.).
- Self-referential for nested categories.

**Entity**: `stock_groups`

### 3.7 Inventory — Stock Items
- Individual inventory products with SKU, quantity, and standard rate.
- Linked to a stock group and a unit.

**Entity**: `stock_items`

### 3.8 Customer Management
- Customers are parties who receive sales and invoices.

**Entity**: `customers`

### 3.9 Supplier Management
- Suppliers are vendors who fulfil purchase orders.

**Entity**: `suppliers`

### 3.10 Purchase Management
- Tracks goods purchased from suppliers.
- Creates inventory stock-in transactions.

**Entity**: `purchases`

### 3.11 Sales Management
- Tracks goods sold to customers.
- Creates inventory stock-out transactions and generates invoices.

**Entity**: `sales`

### 3.12 Billing / Invoicing
- Invoices are formal billing documents generated from sales.
- Track payment status: Unpaid, Paid, Cancelled.

**Entity**: `invoices`

### 3.13 Voucher System (Accounting)
- Double-entry accounting entries for every financial transaction.
- Types: Receipt, Payment, Journal, Contra, Sales, Purchase.
- Each voucher entry records a debit or credit against a ledger.

**Entity**: `voucher_entries`

### 3.14 Inventory Transactions
- Tracks every stock movement (IN for Purchase, OUT for Sale, manual Adjustment).
- Linked to purchases or sales for full traceability.

**Entity**: `inventory_transactions`

### 3.15 Audit Logs
- Immutable record of all write operations (CREATE, UPDATE, DELETE).
- Stores before/after JSON snapshots for compliance.

**Entity**: `audit_logs`

---

## 4. Entity Relationship Summary (Text ERD)

```
User
 └── Company (user_id → users.id)
      ├── Group (company_id → companies.id)
      │    └── Group [parent_id → groups.id, self-referential]
      │         └── Ledger (group_id → groups.id)
      │              └── VoucherEntry (ledger_id → ledgers.id)
      │
      ├── Unit (company_id → companies.id)
      │
      ├── StockGroup (company_id → companies.id)
      │    └── StockGroup [parent_id, self-referential]
      │         └── StockItem (stock_group_id, unit_id)
      │              └── InventoryTransaction (stock_item_id)
      │
      ├── Customer (company_id → companies.id)
      │    ├── Sale (customer_id → customers.id)
      │    │    ├── Invoice (sale_id → sales.id)
      │    │    └── InventoryTransaction (sale_id → sales.id)
      │    └── Invoice (customer_id → customers.id)
      │
      ├── Supplier (company_id → companies.id)
      │    └── Purchase (supplier_id → suppliers.id)
      │         └── InventoryTransaction (purchase_id → purchases.id)
      │
      └── AuditLog (company_id → companies.id)
           └── [user_id → users.id]
```

---

## 5. Key Design Decisions

| Decision | Rationale |
|---|---|
| `user_id` on Company | Defines ownership; one user manages N companies |
| `company_id` on all entities | Ensures data isolation across tenants |
| `TimestampMixin` | DRY principle — shared created_at/updated_at across 14 models |
| SQLAlchemy Enums | Prevents invalid voucher_type, invoice status, transaction type at DB level |
| `Numeric(15, 2)` for money | Avoids floating-point precision errors in financial calculations |
| `Numeric(15, 3)` for quantity | Supports fractional quantities (e.g. 1.5 kg) |
| `JSON` column on AuditLog | Stores dynamic before/after snapshots without schema changes |
| `ondelete="CASCADE"` | Child records deleted with parent company (clean teardown) |
| `ondelete="RESTRICT"` | Prevents deleting a ledger/stock item that has transactions |
| `ondelete="SET NULL"` | Preserves audit logs even if user or company is deleted |

---

## 6. Assumptions

1. GST/Tax calculations are out of scope for Day 1–2.
2. Banking module (bank accounts, reconciliation) is deferred to a later day.
3. Role-based access control (RBAC) is deferred to Day 3+.
4. JWT authentication is deferred to Day 3+.
5. All monetary values are stored in a single currency (no multi-currency).
6. Voucher entries represent individual accounting lines; grouping (header) is by voucher_number.

---

## 7. Scope Boundaries

### Day 1 Scope (This Document)
- [x] Requirement Analysis (this document)
- [x] Database Design (all 15 tables)
- [x] Entity relationships defined
- [x] SQLAlchemy models written

### Day 2 Scope
- [x] FastAPI application initialised
- [x] PostgreSQL connection configured
- [x] Alembic migration environment configured
- [x] Health check endpoints

### Out of Scope (Day 3+)
- Authentication APIs (login, register, JWT)
- CRUD APIs for any module
- Business logic / services
- Reports
- Banking module
- Dashboard
