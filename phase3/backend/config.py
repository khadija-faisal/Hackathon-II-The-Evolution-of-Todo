# [Task]: T-005
# [From]: plan.md §1.3 (JWT Configuration)
# [Reference]: Constitution §VI (Environment Variables), FR-004 (JWT expiration), FR-005 (BETTER_AUTH_SECRET)

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # Database Configuration
    DATABASE_URL: str = "postgresql://user:password@localhost/tododb"

    # JWT Configuration
    BETTER_AUTH_SECRET: str = "your-secret-key-change-in-production"
    JWT_EXPIRATION_HOURS: int = 24

    # API Configuration
    API_PORT: int = 8000
    API_HOST: str = "0.0.0.0"

    # Frontend Configuration
    FRONTEND_URL: str = "http://localhost:3000"

    # OpenAI Configuration (Phase 3 - AI Agent)
    OPENAI_API_KEY: str = "sk-"  # Set via .env
    OPENAI_MODEL: str = "gpt-4-turbo-preview"

    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    class Config:
        """Pydantic configuration"""
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True
        extra = "ignore"  # Ignore extra env vars like BETTER_AUTH_URL


# Create settings instance
settings = Settings()
