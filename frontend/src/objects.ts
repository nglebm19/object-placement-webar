import {
  BoxGeometry,
  Euler,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  Quaternion,
  Scene,
  Vector3
} from "three";
import { savePlacement } from "./api";

const cubeGeometry = new BoxGeometry(0.1, 0.1, 0.1);
const cubeMaterial = new MeshStandardMaterial({
  color: 0xff0055,
  metalness: 0.2,
  roughness: 0.75
});

const placedObjects: Mesh[] = [];

const tmpPosition = new Vector3();
const tmpQuaternion = new Quaternion();
const tmpScale = new Vector3();
const tmpEuler = new Euler();

/**
 * Places a cube in the scene using the reticle world matrix and
 * persists the transform through the backend API.
 */
export const placeObjectFromMatrix = async (
  matrix: Matrix4,
  scene: Scene
): Promise<Mesh> => {
  const cube = new Mesh(cubeGeometry, cubeMaterial.clone());
  cube.matrixAutoUpdate = false;
  cube.matrix.copy(matrix);
  cube.name = `placed-cube-${Date.now()}`;

  scene.add(cube);
  placedObjects.push(cube);

  matrix.decompose(tmpPosition, tmpQuaternion, tmpScale);
  tmpEuler.setFromQuaternion(tmpQuaternion, "XYZ");

  void savePlacement(
    {
      x: tmpPosition.x,
      y: tmpPosition.y,
      z: tmpPosition.z
    },
    {
      x: tmpEuler.x,
      y: tmpEuler.y,
      z: tmpEuler.z
    }
  );

  return cube;
};

/**
 * Returns the list of meshes currently placed in the scene.
 */
export const getPlacedObjects = (): Mesh[] => placedObjects;
