# WebXR Object Placement Frontend

This Vite + TypeScript + Three.js project renders a simple WebXR experience that lets you place a cube in augmented reality directly from your mobile browser.

## Prerequisites
- Node.js 18+
- A mobile device (Chrome Android or Safari 17+) on the same Wi-Fi network as your development machine

## Getting Started
```bash
npm install
npm run start:live
```

The `start:live` script exposes the dev server using your LAN IP so you can open the URL (e.g. `http://192.168.x.x:5173`) on your phone.

When the page loads:
- Enter AR from the on-screen button and allow camera access.
- Move your device slowly until a cyan reticle appears on a detected surface.
- Tap anywhere on the screen or press **Place Object** to anchor a cube at the reticle.

> For backend logging (`http://localhost:5000/api/save`), run the FastAPI server before placing an object so the placement payload is persisted.

## Using LocalTunnel (Remote/LAN Devices)
If your device cannot reach the LAN IP directly, you can proxy the dev server through LocalTunnel:
```bash
npm run start:tunnel
```

This runs the dev server and LocalTunnel concurrently. Copy the generated `https://<subdomain>.loca.lt` URL from the terminal and open it on your iPhone. Approve the security prompt, allow camera access, and tap **Place Object**.

> The Vite dev server is configured with `server.allowedHosts = [".loca.lt"]`, so any LocalTunnel subdomain is permitted automatically.
> If you are tunnelling over HTTPS, set `VITE_API_BASE_URL` in `.env` to point at your FastAPI instance (e.g. `http://192.168.x.x:5000`) to avoid mixed-content or localhost resolution issues.

## Troubleshooting “AR not supported”
- WebXR requires a secure context. Use the LocalTunnel workflow above or serve via HTTPS (e.g. `vite --https` with a trusted certificate).
- On iOS 17+, open **Settings → Safari → Advanced → Feature Flags** and enable both **WebXR** and **WebXR Hit Test**, then fully relaunch Safari.
- Third-party iOS browsers (Chrome, Brave, etc.) share Safari’s settings; ensure they are updated to iOS 17+ and reopen after toggling WebXR.
- If AR still fails, confirm `navigator.xr` exists by checking the device console and that `navigator.xr.isSessionSupported("immersive-ar")` resolves to `true`.
- On Android, leaving Chrome can suspend AR; this app automatically ends the XR session when the page is backgrounded so you can re-enter cleanly when returning.

## Production Build
```bash
npm run build
npm run preview
```
