import * as THREE from  'three';
import { createArena, createFloor, walls } from './level1.js';
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
import {initRenderer, 
        initDefaultBasicLight,
        setDefaultMaterial,
        onWindowResize,} from "../libs/util/util.js";
import { keyboardUpdate, isOrbitControlsActive, initialCameraPosition } from './keyboard.js';
import { update } from './shooting.js';
import { tank1, tank2 } from './tank.js';

export { scene };

let scene, renderer, camera, material, light, orbit; // Initial variables
scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // Init a basic renderer
camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000); // Init camera in this position
material = setDefaultMaterial(); // create a basic material
light = initDefaultBasicLight(scene); // Create a basic light to illuminate the scene
orbit = new OrbitControls( camera, renderer.domElement ); // Enable mouse rotation, pan, zoom etc.

// Listen window size changes
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

createArena(200, scene);
createFloor(200, scene);

render();

function adjustCameraView(tank1, tank2, camera) {
  const tankPositions = [tank1.position.clone(), tank2.position.clone()];
  const bounds = new THREE.Box3().setFromPoints(tankPositions);
  const center = new THREE.Vector3();
  bounds.getCenter(center);

  const size = new THREE.Vector3();
  bounds.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = camera.fov * (Math.PI / 180);
  let cameraZ = Math.abs(maxDim / (2 * Math.tan(fov / 2)));
  cameraZ *= 1.5; // Added some margin to ensure tanks stay within view

  // Set the new camera position
  camera.position.x = center.x;
  camera.position.y = 160; // Maintain a fixed height above the tanks
  camera.position.z = center.z + cameraZ;

  camera.lookAt(center); // Ensure the camera always points towards the center between the tanks
}

function render()
{
  requestAnimationFrame(render);

  keyboardUpdate();
  update(tank1, tank2, scene);

  if (!isOrbitControlsActive) {
    adjustCameraView(tank1, tank2, camera);
  } else {
    initialCameraPosition.copy(camera.position);
  }

  renderer.render(scene, camera) // Render scene
}