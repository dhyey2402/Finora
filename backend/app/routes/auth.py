"""
SmartERP — Authentication Routes
POST /auth/register  — create a new user
POST /auth/login     — authenticate & receive JWT
GET  /auth/me        — return the currently authenticated user
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.core.security import create_access_token
from app.database.dependencies import get_db
from app.models.user import User
from app.schemas.auth import UserRegister, UserResponse, Token
from app.services.auth_service import register_user, authenticate_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ------------------------------------------------------------------
# Register
# ------------------------------------------------------------------
@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    """
    Create a new user account.

    - **name**: Full name (2–150 chars)
    - **email**: Unique email address
    - **password**: Min 8 characters
    """
    try:
        # Attempt to register the user; this may fail if the email is not unique.
        user = register_user(db, payload)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        )
    return user


# ------------------------------------------------------------------
# Login  (Swagger-compatible OAuth2 form)
# ------------------------------------------------------------------
@router.post(
    "/login",
    response_model=Token,
    summary="Login & receive JWT",
)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """
    Authenticate with email and password.

    > **Swagger note**: Use the *username* field for your email address.
    > This is an OAuth2 standard form — the field is named ``username``
    > but SmartERP treats it as the email.

    Returns a Bearer JWT access token.
    """
    user = authenticate_user(db, email=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user account",
        )

    # Generate a JWT token after successful authentication for subsequent requests.
    access_token = create_access_token(data={"sub": user.email})
    return Token(access_token=access_token, token_type="bearer")


# ------------------------------------------------------------------
# Me  (Protected)
# ------------------------------------------------------------------
@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current user profile",
)
def me(current_user: User = Depends(get_current_user)):
    """
    Return the profile of the currently authenticated user.

    Requires a valid Bearer token in the ``Authorization`` header.
    """
    return current_user
