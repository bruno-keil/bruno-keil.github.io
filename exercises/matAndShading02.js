import * as THREE from 'three';
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
import { TeapotGeometry } from '../build/jsm/geometries/TeapotGeometry.js';
import { initRenderer, initDefaultSpotlight, createGroundPlane, createLightSphere, onWindowResize } from "../libs/util/util.js";

let scene, renderer, camera, light, lightSphere, lightPosition, orbit;

// Create the scene
scene = new THREE.Scene();
renderer = initRenderer("rgb(30, 30, 42)"); // Set the background color
renderer.shadowMap.enabled = true; // Enable shadow maps
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Use soft shadows

camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.lookAt(0, 0, 0);
camera.position.set(2.18, 1.62, 3.31);
camera.up.set(0, 1, 0);

orbit = new OrbitControls(camera, renderer.domElement);

lightPosition = new THREE.Vector3(4.8, 2.5, 1.8);
light = initDefaultSpotlight(scene, lightPosition, 1); // Use default light
light.castShadow = false; // Disable shadows for the spotlight
lightSphere = createLightSphere(scene, 0.1, 10, 10, lightPosition);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(3.8, 1.5, 2);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 4096;
directionalLight.shadow.mapSize.height = 4096;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
directionalLight.shadow.bias = -0.001;
directionalLight.shadow.camera.left = -10;
directionalLight.shadow.camera.right = 10;
directionalLight.shadow.camera.top = 10;
directionalLight.shadow.camera.bottom = -10;
scene.add(directionalLight);

window.addEventListener('resize', function () { onWindowResize(camera, renderer) }, false);

var groundPlane = createGroundPlane(10.0, 10.0, 50, 50);
groundPlane.rotateX(THREE.MathUtils.degToRad(-90));
groundPlane.receiveShadow = true;
scene.add(groundPlane);

const shinyMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000, specular: 0xffffff, shininess: 40 });
const greenMatteMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00, shininess: 0});
const babyBlueColor = new THREE.Color(0x89CFF0);
const blueMatteMaterial = new THREE.MeshPhongMaterial({ color: babyBlueColor, flatShading: true, shininess: 0 });

const teapotGeometry = new TeapotGeometry(0.5);
const teapot = new THREE.Mesh(teapotGeometry, shinyMaterial);
teapot.position.set(0, 0.5, 0);
teapot.castShadow = true;
teapot.receiveShadow = true;
scene.add(teapot);

const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const sphere = new THREE.Mesh(sphereGeometry, greenMatteMaterial);
sphere.position.set(-2, 0.5, -1);
sphere.castShadow = true;
sphere.receiveShadow = true;
scene.add(sphere);

const coneGeometry = new THREE.CylinderGeometry(0.1, 1, 2.5, 16);
const cone = new THREE.Mesh(coneGeometry, blueMatteMaterial);
cone.position.set(2, 1.1, 1);
cone.castShadow = true;
cone.receiveShadow = true;
scene.add(cone);

function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}

render();
