import * as THREE from 'three';

// Create the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a cube as the object
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Health bar container
const healthBarContainerGeometry = new THREE.PlaneGeometry(1, 0.1);
const healthBarContainerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const healthBarContainer = new THREE.Mesh(healthBarContainerGeometry, healthBarContainerMaterial);
healthBarContainer.position.set(0, 1, 0);
cube.add(healthBarContainer);

// Health bar
const healthBarGeometry = new THREE.PlaneGeometry(1, 0.1);
const healthBarMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const healthBar = new THREE.Mesh(healthBarGeometry, healthBarMaterial);
healthBar.position.set(0, 0, 0.01); // Slightly in front of the container to prevent z-fighting
healthBarContainer.add(healthBar);

// Set the initial camera position
camera.position.z = 5;

// Function to update the health bar
function updateHealthBar(health) {
  healthBar.scale.x = health; // Scale the health bar based on the health value
  healthBar.position.x = (1 - health) / 2 - 0.5; // Adjust the position to keep it centered
}

// Example health value
let health = 1;

// Animate function
function animate() {
  requestAnimationFrame(animate);
  
  // Example health reduction
  health -= 0.001;
  if (health < 0) health = 1;

  // Update the health bar
  updateHealthBar(health);

  // Render the scene
  renderer.render(scene, camera);
}

// Start the animation loop
animate();
