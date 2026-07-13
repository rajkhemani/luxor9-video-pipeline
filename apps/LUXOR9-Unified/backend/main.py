"""
LUXOR9 - Hierarchical Agentic AI Orchestration System
Main Application Entry Point
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
settings = get_settings()
from app.database import init_db, close_db
from app.api.routes import (
    agents_router,
    streams_router,
    categories_router,
    system_router,
    metrics_router,
)
from app.api.ceo_routes import ceo_router
from app.orchestrator import Orchestrator


# Global orchestrator instance
orchestrator: Orchestrator = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan - startup and shutdown"""
    global orchestrator

    # Startup
    print("═" * 50)
    print("  LUXOR9 HIERARCHICAL AGENT SYSTEM")
    print("  Starting up...")
    print("═" * 50)

    # Initialize database
    await init_db()

    # Initialize orchestrator
    orchestrator = Orchestrator()
    app.state.orchestrator = orchestrator

    print("✓ Database initialized")
    print("✓ Orchestrator ready")
    print("═" * 50)

    yield

    # Shutdown
    print("\n═" * 50)
    print("  Shutting down LUXOR9...")
    print("═" * 50)

    if orchestrator:
        await orchestrator.shutdown()

    await close_db()
    print("✓ Cleanup complete")


# Create FastAPI app
app = FastAPI(
    title="LUXOR9 API",
    description="Hierarchical Agentic AI Orchestration System",
    version="3.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(agents_router, prefix="/api")
app.include_router(streams_router, prefix="/api")
app.include_router(categories_router, prefix="/api")
app.include_router(system_router, prefix="/api")
app.include_router(metrics_router, prefix="/api")
app.include_router(ceo_router, prefix="/api")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": "LUXOR9 API",
        "version": "3.0.0",
        "status": "online",
        "message": "Hierarchical Agentic AI Orchestration System"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "orchestrator": orchestrator.is_running if orchestrator else "not_initialized"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
