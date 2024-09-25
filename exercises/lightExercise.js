import * as THREE from 'three';
import GUI from '../libs/util/dat.gui.module.js';
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
import { GLTFLoader } from '../../build/jsm/loaders/GLTFLoader.js';
import {
    initRenderer,
    setDefaultMaterial,
    onWindowResize,
    createLightSphere
} from "../libs/util/util.js";
import { loadLightPostScene } from "../libs/util/utilScenes.js";

let scene, renderer, camera, orbit;
let spotLight, dirLight;
let spotLightOn = true;
let dirLightOn = true;
let ambientLightOn = true;

scene = new THREE.Scene(); // Create main scene
renderer = initRenderer(); // View function in util/utils
renderer.setClearColor("rgb(30, 30, 42)");
camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.lookAt(0, 0, 0);
camera.position.set(5, 5, 5);
camera.up.set(0, 1, 0);
orbit = new OrbitControls(camera, renderer.domElement); // Enable mouse rotation, pan, zoom etc.

// Listen window size changes
window.addEventListener('resize', function () { onWindowResize(camera, renderer) }, false);

// Show axes (parameter is size of each axis)
let axesHelper = new THREE.AxesHelper(3);
axesHelper.visible = false;
scene.add(axesHelper);

// Directional light
let dirPosition = new THREE.Vector3(0, 3, 0);
dirLight = new THREE.DirectionalLight('white', 0.05);
dirLight.position.copy(dirPosition);
dirLight.castShadow = true;
scene.add(dirLight);

// Ambient light
const ambientLight = new THREE.AmbientLight(0x404040, 1);
scene.add(ambientLight);

function toggleSpotLight() {
    spotLightOn = !spotLightOn;
    spotLight.visible = spotLightOn;
}

function toggleDirLight() {
    dirLightOn = !dirLightOn;
    dirLight.visible = dirLightOn;
}

function toggleAmbientLight() {
  ambientLightOn = !ambientLightOn;
  ambientLight.visible = ambientLightOn;
}


// Load default scene
loadLightPostScene(scene);

let rectGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
let rect1Material = new THREE.MeshStandardMaterial({ color: 'green' });
let rect2Material = new THREE.MeshStandardMaterial({ color: 'red' });
let cylinder1Material = new THREE.MeshStandardMaterial({ color: 'pink' });
let cylinder2Material = new THREE.MeshStandardMaterial({ color: 'yellow' });
let cylinderGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.5, 32);

let rect1 = new THREE.Mesh(rectGeometry, rect1Material);
rect1.position.set(3, 0.25, -2);
rect1.castShadow = true;
scene.add(rect1);

let rect2 = new THREE.Mesh(rectGeometry, rect2Material);
rect2.position.set(3, 0.25, 0);
rect2.castShadow = true;
scene.add(rect2);

let cylinder1 = new THREE.Mesh(cylinderGeometry, cylinder1Material);
cylinder1.position.set(0, 0.25, 4);
cylinder1.castShadow = true;
scene.add(cylinder1);

let cylinder2 = new THREE.Mesh(cylinderGeometry, cylinder2Material);
cylinder2.position.set(1.25, 0.25, -2.5);
cylinder2.castShadow = true;
scene.add(cylinder2);

// Create spotlight
spotLight = new THREE.SpotLight(0xffffff, 15);
spotLight.position.set(1.3, 3, 0); // Position the spotlight at the top of the light post
spotLight.castShadow = true;
spotLight.angle = Math.PI / 4;
spotLight.penumbra = 0.3;
spotLight.decay = 2;
spotLight.distance = 10;
scene.add(spotLight);

// Create a target object for the spotlight to aim at
const targetObject = new THREE.Object3D();
targetObject.position.set(2, 0, 0); // Adjust the position as needed
scene.add(targetObject);

// Set the spotlight's target
spotLight.target = targetObject;

scene.add(spotLight);
// GUI interface
let gui = new GUI();

// GUI controls
let lightsFolder = gui.addFolder('Lights');
lightsFolder.add({ 'Spotlight': spotLightOn }, 'Spotlight').onChange(toggleSpotLight);
lightsFolder.add({ 'Directional Light': dirLightOn }, 'Directional Light').onChange(toggleDirLight);
lightsFolder.add({ 'Ambient Light': ambientLightOn }, 'Ambient Light').onChange(toggleAmbientLight);


//---------------------------------------------------------
// Load external objects
render();

function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}
