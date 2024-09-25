// Import necessary components
import * as THREE from 'three';
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xaaaaaa);

// Cubes
const cubeSize = 20;
const cube1 = new THREE.Mesh(
  new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize),
  new THREE.MeshBasicMaterial({ color: 0xff0000 })
);
const cube2 = new THREE.Mesh(
  new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize),
  new THREE.MeshBasicMaterial({ color: 0x00ff00 })
);
cube1.position.x = -50;
cube2.position.x = 50;
scene.add(cube1, cube2);

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 200; // move the camera back along the z-axis
const cameraTarget = new THREE.Vector3();
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Resize Handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation
let time = 0;

function animateCubes() {
  const distance = 100 + Math.sin(time) * 50; // oscillate between 50 and 150
  cube1.position.x = -distance / 2;
  cube2.position.x = distance / 2;

  time += 0.01;

  requestAnimationFrame(animateCubes);
}

animateCubes();

// Render loop
function render() {
  // Update camera target to be the middle point between the cubes
  cameraTarget.copy(cube1.position).add(cube2.position).multiplyScalar(0.5);
  camera.lookAt(cameraTarget);

  // Move the camera along with the cubes
  camera.position.x = (cube1.position.x + cube2.position.x) / 2;

  // Render scene
  renderer.render(scene, camera);

  requestAnimationFrame(render);
}
render();
