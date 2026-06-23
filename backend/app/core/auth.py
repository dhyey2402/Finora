"""
SmartERP — JWT Authentication Dependency
FastAPI dependency that extracts and validates the Bearer token,
then loads the corresponding user from the database.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.dependencies import get_db
from app.models.user import User
from app.schemas.auth import TokenData
from app.services.auth_service import get_user_by_email

# ------------------------------------------------------------------
# OAuth2 scheme — provides the "Authorize 🔒" button in Swagger
# ------------------------------------------------------------------
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


# ------------------------------------------------------------------
# Current-user dependency
# ------------------------------------------------------------------
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Decode the JWT, validate claims, and return the active user.

    Raises
    ------
    HTTPException 401
        If the token is missing, expired, malformed, or the user
        no longer exists / is deactivated.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        email: str | None = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception

    user = get_user_by_email(db, email=token_data.email)

    if user is None:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user account",
        )

    return user
