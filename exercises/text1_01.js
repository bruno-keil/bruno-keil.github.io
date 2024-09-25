import * as THREE from 'three';
import Stats from '../build/jsm/libs/stats.module.js';
import {OrbitControls} from '../build/jsm/controls/OrbitControls.js';
import {initRenderer, 
        initCamera, 
        initDefaultSpotlight,
        onWindowResize, 
        lightFollowingCamera} from "../libs/util/util.js";

var scene = new THREE.Scene();    // Create main scene
var stats = new Stats();          // To show FPS information

var renderer = initRenderer();    // View function in util/utils
var camera = initCamera(new THREE.Vector3(10, 10, 10)); // Init camera in this position
var light = initDefaultSpotlight(scene, new THREE.Vector3(0, 0, 30)); // Use default light

// Listen window size changes
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

// Enable mouse rotation, pan, zoom etc.
var orbitControls = new OrbitControls(camera, renderer.domElement);

// Show axes (parameter is size of each axis)
var axesHelper = new THREE.AxesHelper( 12 );
scene.add( axesHelper );

// Create the cylinder
let loader = new THREE.TextureLoader();
let geometry = new THREE.CylinderGeometry(2, 2, 10, 32);

// Create materials for the cylinder sides and top/bottom
let sideMaterial = setMaterial('../assets/textures/wood.png', 2, 2); // Side texture
let topMaterial = setMaterial('../assets/textures/woodtop.png', 1, 1); // Top and bottom texture

// Array of materials to apply to the different parts of the cylinder
let cylinderMaterials = [
    sideMaterial,    // Top
    topMaterial,   // Side
    topMaterial     // Bottom
];

let cylinder = new THREE.Mesh(geometry, cylinderMaterials);
scene.add(cylinder);

render();

// Function to set a texture
function setMaterial(file, repeatU = 1, repeatV = 1, color = 'rgb(255,255,255)'){
   let mat = new THREE.MeshBasicMaterial({ map: loader.load(file), color:color });
   mat.map.colorSpace = THREE.SRGBColorSpace;
   mat.map.wrapS = mat.map.wrapT = THREE.RepeatWrapping;
   mat.map.minFilter = mat.map.magFilter = THREE.LinearFilter;
   mat.map.repeat.set(repeatU,repeatV); 
   return mat;
}

function render()
{
  stats.update(); // Update FPS
  orbitControls.update();
  lightFollowingCamera(light, camera); // Makes light follow the camera
  requestAnimationFrame(render); // Show events
  renderer.render(scene, camera); // Render scene
}