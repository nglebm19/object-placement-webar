# Object Placement WebAR

Interactive WebXR demo that lets you place virtual objects on real-world surfaces from a mobile browser. The project pairs a Vite + TypeScript + Three.js frontend with a FastAPI backend that accepts placement payloads.

## Features
- WebXR hit-testing via Three.js to anchor objects on detected planes.
- Responsive UI for starting/stopping AR sessions and placing objects.
- FastAPI endpoints for health checks and persisting placement data.
- Ready-to-use dev workflow for running the frontend on mobile devices (LAN or tunneled).

## Repository Layout
```
backend/   FastAPI application powering the placement API
frontend/  Vite + TypeScript WebXR client
LICENSE    MIT License
```

Each sub-directory has additional details in its own `README.md`.

## Prerequisites
- Python 3.11+
- Node.js 18+
- An AR-capable mobile browser (Chrome on Android, Safari 17+ on iOS)
- A shared network between your development machine and mobile device, or a tunneling tool such as LocalTunnel

## Getting Started

### 1. Backend API
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 5000
```

The API listens on `http://127.0.0.1:5000`. While developing, leave this process running so the frontend can POST placement data.

### 2. Frontend WebXR Client
```bash
cd frontend
npm install
npm run start:live
```

Vite serves the app on `http://<your-lan-ip>:5173`. Open that URL from your mobile browser, allow camera access, and use the on-screen controls to start AR and place objects.

To expose the dev server over LocalTunnel instead of a LAN IP:
```bash
npm run start:tunnel
```

Copy the generated `https://<subdomain>.loca.lt` link into your mobile browser. Approve the security prompt and allow camera access.

## Configuring the API URL
By default the frontend hits `http://localhost:5000` for placement saves. When serving the frontend over the network or LocalTunnel, set the API base manually:
```bash
# frontend/.env
VITE_API_BASE_URL=http://192.168.x.x:5000
```

Restart the Vite dev server after changing environment variables.

## API Endpoints
All routes are prefixed with `/api`.

| Method | Path       | Description                              |
| ------ | ---------- | ---------------------------------------- |
| GET    | `/ping`    | Health check returning `{ "pong": true }` |
| POST   | `/save`    | Accepts placement payload `{ position, rotation }` and echoes it back |

Example placement payload:
```json
{
  "position": { "x": 0.12, "y": 0.8, "z": -1.4 },
  "rotation": { "x": 0, "y": 0.7, "z": 0 }
}
```

## Troubleshooting AR Support
- WebXR requires HTTPS or a secure context. Use LocalTunnel or another HTTPS proxy if your device cannot access the LAN IP directly.
- On iOS 17+, enable **WebXR** and **WebXR Hit Test** under `Settings > Safari > Advanced > Feature Flags`, then restart the browser.
- Ensure the FastAPI server is running so placement saves succeed.

See `frontend/README.md` for deeper troubleshooting notes.

## License
This project is available under the MIT License. See `LICENSE` for details.
