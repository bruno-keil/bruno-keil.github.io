import * as THREE from  'three';
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
import KeyboardState from '../libs/util/KeyboardState.js'
import {initRenderer, 
        initCamera,
        initDefaultBasicLight,
        setDefaultMaterial,
        InfoBox,
        onWindowResize,
        createGroundPlaneXZ} from "../libs/util/util.js";

let scene, renderer, camera, material, light, orbit; // Initial variables
scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // Init a basic renderer
camera = initCamera(new THREE.Vector3(0, 15, 30)); // Init camera in this position
material = setDefaultMaterial(); // create a basic material
light = initDefaultBasicLight(scene); // Create a basic light to illuminate the scene
orbit = new OrbitControls( camera, renderer.domElement ); // Enable mouse rotation, pan, zoom etc.

let greyMaterial = new THREE.MeshBasicMaterial({color: 0x808080});
let redMaterial = new THREE.MeshBasicMaterial({color: 0xFF0000});
let blueMaterial = new THREE.MeshBasicMaterial({color: 0x0000FF});

// Listen window size changes
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

// Show axes (parameter is size of each axis)
let axesHelper = new THREE.AxesHelper( 12 );
scene.add( axesHelper );

// Use this to show information onscreen
let controls = new InfoBox();
  controls.add("Basic Scene");
  controls.addParagraph();
  controls.add("Use mouse to interact:");
  controls.add("* Left button to rotate");
  controls.add("* Right button to translate (pan)");
  controls.add("* Scroll to zoom in/out.");
  controls.show();

// Function to create a tank
function shoot(x, y, z, material) {
  // Create the base of the tank
  let baseGeometry = new THREE.BoxGeometry(2, 1, 4);
  let base = new THREE.Mesh(baseGeometry, material);
  base.position.set(x, y - 1, z); // Adjust the y-coordinate to make the tank touch the ground
  base.rotation.y = Math.PI; // Rotate the base 180 degrees to face north

  // Create the wheels of the tank
  let wheelGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
  let wheelMaterial = new THREE.MeshBasicMaterial({color: 0x000000});
  for (let i = -1; i <= 1; i += 2) {
    for (let j = -1; j <= 1; j += 2) {
      let wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(i, -0.5, j * 1.5); // Adjust the y-coordinate to make the wheels touch the ground
      base.add(wheel); // Add the wheel to the base
    }
  }

  // Create the base of the cannon
  let cannonBaseGeometry = new THREE.SphereGeometry(0.75, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
  let cannonBase = new THREE.Mesh(cannonBaseGeometry, material);
  cannonBase.position.set(0, 0.5, 0); // Position the base of the cannon on top of the base of the tank
  base.add(cannonBase); // Add the base of the cannon to the base

  // Create the cannon
  let cannonGeometry = new THREE.CylinderGeometry(0.25, 0.25, 4, 32);
  let cannon = new THREE.Mesh(cannonGeometry, material);
  cannon.rotation.x = Math.PI / 2;
  cannon.position.set(0, 0.75, 2); // Position the cannon to extend north
  base.add(cannon); // Add the cannon to the base

  scene.add(base)
}

// Create the floor
let floorGeometry = new THREE.PlaneGeometry(100, 100);
let floor = new THREE.Mesh(floorGeometry, material);
floor.rotation.x = -Math.PI / 2; // Rotate the floor 90 degrees
scene.add(floor);

render();
function render()
{
  requestAnimationFrame(render);
  renderer.render(scene, camera) // Render scene
}