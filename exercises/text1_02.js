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

// Create the cube geometry
let loader = new THREE.TextureLoader();
let geometry = new THREE.BoxGeometry(5, 5, 5, 32);

// Array of materials to apply different tiles to each face of the cube
let cubeMaterials = [
    setMaterial('../assets/textures/tiles.jpg', 3, 3, 0, 0), // Face 1
    setMaterial('../assets/textures/tiles.jpg', 3, 3, 1, 0), // Face 2
    setMaterial('../assets/textures/tiles.jpg', 3, 3, 2, 0), // Face 3
    setMaterial('../assets/textures/tiles.jpg', 3, 3, 0, 1), // Face 4
    setMaterial('../assets/textures/tiles.jpg', 3, 3, 1, 1), // Face 5
    setMaterial('../assets/textures/tiles.jpg', 3, 3, 2, 1)  // Face 6
];

let cube = new THREE.Mesh(geometry, cubeMaterials);
scene.add(cube);

render();

// Function to set a texture with specific UV offsets
function setMaterial(file, tilesX = 1, tilesY = 1, tileX = 0, tileY = 0, color = 'rgb(255,255,255)'){
   let texture = loader.load(file);
   let mat = new THREE.MeshBasicMaterial({ map: texture, color: color });
   mat.map.colorSpace = THREE.SRGBColorSpace;
   mat.map.wrapS = mat.map.wrapT = THREE.RepeatWrapping;
   mat.map.minFilter = mat.map.magFilter = THREE.LinearFilter;

   // Set the UV offsets to select the specific tile
   mat.map.repeat.set(1 / tilesX, 1 / tilesY); 
   mat.map.offset.set(tileX / tilesX, 1 - (tileY + 1) / tilesY);

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