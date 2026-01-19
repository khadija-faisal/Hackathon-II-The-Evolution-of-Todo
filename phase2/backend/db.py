# [Task]: T-007
# [From]: plan.md §1.2 (Database Initialization)
# [Reference]: Infrastructure (Database connectivity)

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel import Session
from backend.config import settings

# Create database engine with connection pooling
engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_pre_ping=True,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {},
)

# Create session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    class_=Session,
)


def get_session():
    """Dependency for getting database session"""
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
