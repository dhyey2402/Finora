"""
SmartERP — Security Utilities
Password hashing (bcrypt) and JWT token creation / verification helpers.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import jwt
import bcrypt

from app.core.config import settings

# ------------------------------------------------------------------
# Password Hashing  (Raw bcrypt)
# ------------------------------------------------------------------
def hash_password(plain_password: str) -> str:
    """Hash a plain-text password using bcrypt."""
    password_bytes = plain_password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_bytes = bcrypt.hashpw(password_bytes, salt)
    return hashed_bytes.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain-text password against its bcrypt hash."""
    return bcrypt.checkpw(
        plain_password.encode('utf-8'),
        hashed_password.encode('utf-8')
    )


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
