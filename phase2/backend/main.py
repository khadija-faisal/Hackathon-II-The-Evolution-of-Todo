# [Task]: T-001, T-004, T-011
# [From]: plan.md §1.1 (Backend Project Structure), §1.3 (JWT Middleware), §1.2 (Database Initialization)
# [Reference]: Infrastructure, Constitution §VI

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from backend.config import settings
from backend.db import engine
from backend.models import user, task
from sqlmodel import SQLModel

# Create tables on startup (idempotent)
def create_tables():
    """Create all tables in the database"""
    SQLModel.metadata.create_all(engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle context manager"""
    # Startup
    create_tables()
    print("✅ Database tables initialized")
    yield
    # Shutdown
    print("👋 Application shutdown")

# Initialize FastAPI application
app = FastAPI(
    title="Todo App API",
    description="Multi-user Todo application with JWT authentication",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],  # Only allow frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint (no auth required)
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "version": "1.0.0"}

# Include API routes (to be implemented in Phase 2-3)
# from backend.routes import auth, tasks
# app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
# app.include_router(tasks.router, prefix="/api/v1/tasks", tags=["tasks"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=int(settings.API_PORT),
        reload=True
    )
