from pydantic import BaseModel


class Vector3(BaseModel):
    x: float
    y: float
    z: float


class PlacementPayload(BaseModel):
    position: Vector3
    rotation: Vector3
