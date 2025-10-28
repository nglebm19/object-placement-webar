from typing import Any, Dict, Optional


def success(data: Any, message: Optional[str] = None) -> Dict[str, Any]:
    response: Dict[str, Any] = {"success": True, "data": data}
    if message:
        response["message"] = message
    return response
