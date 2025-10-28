import {
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  HemisphereLight
} from "three";
import { ARButton } from "three/examples/jsm/webxr/ARButton.js";

interface HitTestState {
  source: XRHitTestSource | null;
  localSpace: XRReferenceSpace | null;
  viewerSpace: XRReferenceSpace | null;
}

export interface ARContext {
  renderer: WebGLRenderer;
  scene: Scene;
  camera: PerspectiveCamera;
  hitTest: HitTestState;
  arButton: HTMLElement;
}

export const createARContext = (mountNode: HTMLElement): ARContext => {
  const scene = new Scene();

  const camera = new PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.01,
    20
  );

  const renderer = new WebGLRenderer({
    antialias: true,
    alpha: true
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  mountNode.appendChild(renderer.domElement);

  const light = new HemisphereLight(0xffffff, 0xbbbbff, 1.0);
  light.position.set(0, 1, 0);
  scene.add(light);

  const hitTest: HitTestState = {
    source: null,
    localSpace: null,
    viewerSpace: null
  };

  const setupHitTestSource = async (): Promise<void> => {
    const session = renderer.xr.getSession();
    if (!session) {
      return;
    }

    try {
      hitTest.viewerSpace = await session.requestReferenceSpace("viewer");
      try {
        hitTest.localSpace = await session.requestReferenceSpace("local-floor");
      } catch {
        hitTest.localSpace = await session.requestReferenceSpace("local");
      }
      hitTest.source = await session.requestHitTestSource({
        space: hitTest.viewerSpace
      });
    } catch (error) {
      console.error("Failed to set up hit-test source", error);
    }
  };

  const teardownHitTestSource = (): void => {
    hitTest.source?.cancel();
    hitTest.source = null;
    hitTest.viewerSpace = null;
    hitTest.localSpace = null;
  };

  const arButton = ARButton.createButton(renderer, {
    requiredFeatures: ["hit-test"],
    optionalFeatures: ["dom-overlay"],
    domOverlay: { root: mountNode }
  });
  arButton.id = "ar-start-button";
  arButton.style.display = "none";
  arButton.setAttribute("aria-hidden", "true");
  if ("dataset" in arButton && arButton.dataset) {
    arButton.dataset.defaultLabel = arButton.textContent ?? "ENTER AR";
  }
  mountNode.appendChild(arButton);

  renderer.xr.addEventListener("sessionstart", () => {
    void setupHitTestSource();
  });

  renderer.xr.addEventListener("sessionend", () => {
    teardownHitTestSource();
  });

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return { renderer, scene, camera, hitTest, arButton };
};

export interface FrameUpdate {
  frame: XRFrame;
  referenceSpace: XRReferenceSpace | null;
  hitPose: XRPose | null;
}

export type FrameCallback = (update: FrameUpdate) => void;

export const startRenderLoop = (
  { renderer, scene, camera, hitTest }: ARContext,
  onFrame?: FrameCallback
): void => {
  renderer.setAnimationLoop((_, frame) => {
    // Provide hit-test data to consumers before rendering the frame.
    if (frame && hitTest.source && hitTest.localSpace) {
      const hitTestResults = frame.getHitTestResults(hitTest.source);
      const hitPose =
        hitTestResults.length > 0
          ? hitTestResults[0].getPose(hitTest.localSpace)
          : null;

      if (onFrame) {
        onFrame({
          frame,
          referenceSpace: hitTest.localSpace,
          hitPose
        });
      }
    } else if (frame && onFrame) {
      onFrame({
        frame,
        referenceSpace: hitTest.localSpace,
        hitPose: null
      });
    }

    renderer.render(scene, camera);
  });
};
