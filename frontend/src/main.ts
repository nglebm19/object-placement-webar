import "./styles.css";
import { Matrix4 } from "three";
import { createARContext, startRenderLoop } from "./ar-session";
import { createReticle, updateReticle } from "./reticle";
import { placeObjectFromMatrix } from "./objects";
import { createUI } from "./ui";
import { checkWebXRSupport, getSupportGuidance } from "./support";

const mountNode = document.getElementById("app");

if (!mountNode) {
  throw new Error("Mount node #app not found");
}

mountNode.classList.add("app-root");

const arContext = createARContext(mountNode);
const reticle = createReticle();
arContext.scene.add(reticle);

const placementMatrix = new Matrix4();
let hasValidHit = false;
let isPlacing = false;
let activeSession: XRSession | null = null;
let supportReady = false;

const endCurrentSession = async (): Promise<void> => {
  if (!activeSession) {
    return;
  }

  try {
    await activeSession.end();
  } catch (error) {
    console.warn("Failed to gracefully end XR session", error);
  }
};

const handlePlacement = async (): Promise<void> => {
  if (!supportReady || !hasValidHit || isPlacing) {
    return;
  }

  isPlacing = true;

  try {
    await placeObjectFromMatrix(placementMatrix, arContext.scene);
  } finally {
    isPlacing = false;
  }
};

const xr = arContext.renderer.xr;

const { placeButton, startButton, instructions } = createUI(mountNode);

placeButton.addEventListener("click", () => {
  void handlePlacement();
});

placeButton.disabled = true;
placeButton.textContent = "Start AR to Place";
instructions.textContent = "Checking AR support...";

startButton.disabled = true;
startButton.textContent = "Start AR";

const setInstruction = (text: string): void => {
  if (instructions.textContent !== text) {
    instructions.textContent = text;
  }
};

const handleSupport = async (): Promise<void> => {
  const status = await checkWebXRSupport();
  const guidance = getSupportGuidance(status);

  if (!guidance.supported) {
    supportReady = false;
    setInstruction(guidance.message);
    placeButton.disabled = true;
    startButton.disabled = true;
    startButton.textContent = "Start AR";

    if (arContext.arButton instanceof HTMLButtonElement) {
      arContext.arButton.disabled = true;
    }
    arContext.arButton.classList.add("ar-support-warning");
  } else {
    supportReady = true;
    setInstruction("Enter AR and move your device to find a surface.");
    arContext.arButton.classList.remove("ar-support-warning");
    startButton.disabled = false;
    startButton.textContent = activeSession ? "Stop AR" : "Start AR";

    if (arContext.arButton instanceof HTMLButtonElement) {
      arContext.arButton.disabled = false;
    }
  }
};

void handleSupport();

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    void endCurrentSession();
  }
});

window.addEventListener("pagehide", () => {
  void endCurrentSession();
});

startButton.addEventListener("click", () => {
  if (!supportReady) {
    return;
  }

  if (activeSession) {
    void endCurrentSession();
  } else if (!arContext.arButton.hasAttribute("disabled")) {
    arContext.arButton.click();
  }
});

// Track hit-test updates to drive the reticle and placement matrix.
startRenderLoop(arContext, ({ hitPose }) => {
  if (!supportReady) {
    reticle.visible = false;
    hasValidHit = false;
    return;
  }

  const hasHit = updateReticle(reticle, hitPose);

  if (hasHit) {
    placementMatrix.copy(reticle.matrix);
    setInstruction("Tap the screen or press the button to place a cube.");
  }

  hasValidHit = hasHit;

  if (!hasHit) {
    setInstruction("Move your device to detect a surface.");
  }
});

const handleSelect = (): void => {
  void handlePlacement();
};

arContext.renderer.domElement.addEventListener("click", handleSelect);

xr.addEventListener("sessionstart", () => {
  if (supportReady) {
    placeButton.disabled = false;
    placeButton.textContent = "Place Object";
    setInstruction("Move your device to detect a surface.");
    startButton.textContent = "Stop AR";
    startButton.disabled = false;
  }

  activeSession = xr.getSession();
  activeSession?.addEventListener("select", handleSelect);
});

xr.addEventListener("sessionend", () => {
  hasValidHit = false;
  reticle.visible = false;
  placementMatrix.identity();

  placeButton.disabled = true;
  placeButton.textContent = "Start AR to Place";
  setInstruction("Enter AR and move your device to find a surface.");
  startButton.textContent = "Start AR";
  startButton.disabled = !supportReady;

  activeSession?.removeEventListener("select", handleSelect);
  activeSession = null;

  void handleSupport();
});

console.info(
  'Ready for AR. Move your device to detect a plane, then tap the screen or "Place Object" to add cubes.'
);
