import {
  Mesh,
  MeshBasicMaterial,
  RingGeometry
} from "three";

/**
 * Creates a flat ring mesh that serves as the AR placement reticle.
 */
export const createReticle = (): Mesh => {
  const geometry = new RingGeometry(0.08, 0.1, 32);
  geometry.rotateX(-Math.PI / 2);

  const material = new MeshBasicMaterial({
    color: 0x2ea3ff,
    transparent: true,
    opacity: 0.8
  });

  const reticle = new Mesh(geometry, material);
  reticle.matrixAutoUpdate = false;
  reticle.visible = false;

  return reticle;
};

/**
 * Updates reticle transform and visibility from a hit-test pose.
 * Returns true when a valid hit is available for placement.
 */
export const updateReticle = (reticle: Mesh, hitPose: XRPose | null): boolean => {
  if (!hitPose) {
    reticle.visible = false;
    return false;
  }

  reticle.visible = true;
  reticle.matrix.fromArray(hitPose.transform.matrix);
  return true;
};
