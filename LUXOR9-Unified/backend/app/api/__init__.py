"""LUXOR9 API Routes"""
from app.api.routes import (
    agents_router,
    streams_router,
    categories_router,
    system_router,
    metrics_router
)

__all__ = [
    "agents_router",
    "streams_router",
    "categories_router",
    "system_router",
    "metrics_router"
]
