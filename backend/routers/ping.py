from fastapi import APIRouter

from utils.response import success

router = APIRouter(prefix="/api", tags=["Health"])


@router.get("/ping")
def read_ping() -> dict:
    return success({"pong": True})
