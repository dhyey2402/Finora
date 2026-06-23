"""
SmartERP — Application Settings
Loads configuration from the .env file using Pydantic Settings.
"""

from pydantic_settings import BaseSettings
from pydantic import field_validator


class Settings(BaseSettings):
    # -----------------------------------------------------------------
    # Application
    # -----------------------------------------------------------------
    APP_NAME: str = "SmartERP"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # -----------------------------------------------------------------
    # Database
    # -----------------------------------------------------------------
    DATABASE_URL: str

    @field_validator("DATABASE_URL")
    @classmethod
    def database_url_must_be_set(cls, v: str) -> str:
        if not v or v.strip() == "":
            raise ValueError("DATABASE_URL must not be empty")
        return v

    # -----------------------------------------------------------------
    # JWT / Authentication
    # -----------------------------------------------------------------
    SECRET_KEY: str = "CHANGE-ME-IN-PRODUCTION-USE-openssl-rand-hex-32"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # -----------------------------------------------------------------
    # Pydantic Settings Config
    # -----------------------------------------------------------------
    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()