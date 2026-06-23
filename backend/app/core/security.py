"""
SmartERP — Security Utilities
Password hashing (bcrypt) and JWT token creation / verification helpers.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import jwt
from passlib.context import CryptContext

from app.core.config import settings

# ------------------------------------------------------------------
# Password Hashing  (bcrypt via passlib)
# ------------------------------------------------------------------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain_password: str) -> str:
    """Hash a plain-text password using bcrypt."""
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain-text password against its bcrypt hash."""
    return pwd_context.verify(plain_password, hashed_password)


# ------------------------------------------------------------------
# JWT Token Creation
# ------------------------------------------------------------------
def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """
    Create a signed JWT access token.

    Parameters
    ----------
    data : dict
        Payload to encode (must include ``sub`` — typically the user email).
    expires_delta : timedelta, optional
        Custom expiration. Falls back to ``ACCESS_TOKEN_EXPIRE_MINUTES``
        from the application settings.

    Returns
    -------
    str
        Encoded JWT string.
    """
    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + (
        expires_delta
        if expires_delta
        else timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})

    return jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )
