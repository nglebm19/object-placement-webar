# WebXR Object Placement Backend

FastAPI service that provides simple endpoints for the WebXR front-end demo.

## Setup
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Development
```bash
uvicorn main:app --reload --port 5000
```

The API will be available at `http://127.0.0.1:5000` with the following routes:
- `GET /api/ping` → `{"success": true, "data": {"pong": true}}`
- `POST /api/save` → accept `{ "position": {x,y,z}, "rotation": {x,y,z} }`

Later on you can connect `/api/save` to a database or file writer to persist placements.
