from fastapi import APIRouter

from models.placement import PlacementPayload
from utils.response import success

router = APIRouter(prefix="/api", tags=["Placement"])


@router.post("/save")
def save_placement(payload: PlacementPayload) -> dict:
    confirmation = {
        "position": payload.position.dict(),
        "rotation": payload.rotation.dict()
    }
    return success(confirmation, message="Placement received")
