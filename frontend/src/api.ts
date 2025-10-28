export interface Vector3Payload {
  x: number;
  y: number;
  z: number;
}

const DEFAULT_API_PORT = 5000;

const resolveApiBaseUrl = (): string => {
  if (typeof window === "undefined") {
    return `http://localhost:${DEFAULT_API_PORT}`;
  }

  const configured = import.meta.env?.VITE_API_BASE_URL;
  if (configured) {
    return configured;
  }

  const hostname = window.location.hostname || "localhost";

  if (hostname.endsWith(".loca.lt")) {
    console.warn(
      "[api] LocalTunnel domain detected. Set VITE_API_BASE_URL for backend access if requests fail."
    );
  }

  return `http://${hostname}:${DEFAULT_API_PORT}`;
};

const API_BASE_URL = resolveApiBaseUrl();

/**
 * Persists an object placement transform through the FastAPI backend.
 */
export const savePlacement = async (
  position: Vector3Payload,
  rotation: Vector3Payload
): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        position,
        rotation
      })
    });

    if (!response.ok) {
      throw new Error(`Unexpected response ${response.status}`);
    }

    const payload = await response.json();
    console.info("Placement saved", payload);
  } catch (error) {
    console.warn("Failed to save placement", error);
  }
};
