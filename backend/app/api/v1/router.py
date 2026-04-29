from fastapi import APIRouter

from ...api.v1.endpoints import health, reports

api_router = APIRouter()

api_router.include_router(health.router, tags=["health"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
