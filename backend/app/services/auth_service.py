"""
SmartERP — Authentication Service
Business logic for user registration, login, and lookup.
"""

from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User
from app.core.security import hash_password, verify_password
from app.schemas.auth import UserRegister


# ------------------------------------------------------------------
# Lookups
# ------------------------------------------------------------------
def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """
    Return the User row matching the given email, or None.
    Uses SQLAlchemy 2.0 select() style.
    """
    stmt = select(User).where(User.email == email)
    return db.execute(stmt).scalars().first()


# ------------------------------------------------------------------
# Registration
# ------------------------------------------------------------------
def register_user(db: Session, payload: UserRegister) -> User:
    """
    Create a new user after checking email uniqueness.

    Raises
    ------
    ValueError
        If a user with the same email already exists.
    """
    existing = get_user_by_email(db, payload.email)
    if existing:
        raise ValueError("A user with this email already exists")

    user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
    )

    db.add(user)
    db.commit()
    db.refresh(user)
    return user


# ------------------------------------------------------------------
# Authentication
# ------------------------------------------------------------------
def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """
    Verify email + password credentials.

    Returns
    -------
    User | None
        The authenticated user, or None if credentials are invalid.
    """
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user
