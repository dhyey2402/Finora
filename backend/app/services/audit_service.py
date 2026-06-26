from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog

def log_action(
    db: Session,
    user_id: int,
    action: str,
    table_name: str,
    record_id: int,
    company_id: int | None = None,
    details: dict | None = None
):
    """
    Creates an audit log entry for a specific action.
    """
    audit = AuditLog(
        user_id=user_id,
        company_id=company_id,
        action=action.upper(),
        table_name=table_name,
        record_id=record_id,
        details=details
    )
    db.add(audit)
    # Note: We do not commit here, so the audit log is committed alongside the main transaction
