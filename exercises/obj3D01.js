import * as THREE from 'three';
import Stats from '../build/jsm/libs/stats.module.js';
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
import { ConvexGeometry } from '../build/jsm/geometries/ConvexGeometry.js';
import KeyboardState from '../libs/util/KeyboardState.js';
import { initRenderer, 
        InfoBox,
        initDefaultSpotlight,
        createGroundPlane,
        createLightSphere,        
        onWindowResize } from "../libs/util/util.js";

let scene, renderer, camera, stats, light, lightSphere, lightPosition, orbit;
scene = new THREE.Scene();
renderer = initRenderer("rgb(30, 30, 42)");
renderer.shadowMap.enabled = true;
camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.lookAt(0, 0, 0);
camera.position.set(2.18, 1.62, 3.31);
camera.up.set(0, 1, 0);
orbit = new OrbitControls(camera, renderer.domElement);
stats = new Stats();

lightPosition = new THREE.Vector3(3, 3, 2);
light = initDefaultSpotlight(scene, lightPosition, 5);
light.castShadow = true;
light.shadow.mapSize.width = 2048;
light.shadow.mapSize.height = 2048;
light.shadow.camera.near = 0.1;
light.shadow.camera.far = 500;
lightSphere = createLightSphere(scene, 0.1, 10, 10, lightPosition);

var keyboard = new KeyboardState();

window.addEventListener('resize', function() {
    onWindowResize(camera, renderer)
}, false);

var groundPlane = createGroundPlane(4.0, 2.5, 50, 50);
groundPlane.rotateX(THREE.MathUtils.degToRad(-90));
groundPlane.receiveShadow = true;
scene.add(groundPlane);

var axesHelper = new THREE.AxesHelper(1.5);
axesHelper.visible = false;
scene.add(axesHelper);

showInformation();

const vertices = [
    new THREE.Vector3(0, 0, 0), // 0
    new THREE.Vector3( 2, 0, 0), // 1
    new THREE.Vector3( 2, 0,  1), // 2
    new THREE.Vector3(0, 0,  1), // 3
    new THREE.Vector3(0, 1, 0), // 4
    new THREE.Vector3( 1, 1, 0), // 5
    new THREE.Vector3( 1, 1,  1), // 6
    new THREE.Vector3(0, 1, 1) //7
];

const geometry = new ConvexGeometry(vertices);

const material = new THREE.MeshPhongMaterial({ color: "rgb(255,20,20)" });

const polyhedron = new THREE.Mesh(geometry, material);
polyhedron.castShadow = true;
polyhedron.position.set(0, 0.5, 0);

scene.add(polyhedron);

render();

function keyboardUpdate() {
    keyboard.update();
    if (keyboard.pressed("D")) {
        lightPosition.x += 0.05;
        updateLightPosition();
    }
    if (keyboard.pressed("A")) {
        lightPosition.x -= 0.05;
        updateLightPosition();
    }
    if (keyboard.pressed("W")) {
        lightPosition.y += 0.05;
        updateLightPosition();
    }
    if (keyboard.pressed("S")) {
        lightPosition.y -= 0.05;
        updateLightPosition();
    }
    if (keyboard.pressed("E")) {
        lightPosition.z -= 0.05;
        updateLightPosition();
    }
    if (keyboard.pressed("Q")) {
        lightPosition.z += 0.05;
        updateLightPosition();
    }
}

function updateLightPosition() {
    light.position.copy(lightPosition);
    lightSphere.position.copy(lightPosition);
}

function showInformation() {
    var controls = new InfoBox();
    controls.add("Lighting - Types of Materials");
    controls.addParagraph();
    controls.add("Use the WASD-QE keys to move the light");
    controls.show();
}

function render() {
    stats.update();
    keyboardUpdate();
    requestAnimationFrame(render);
    renderer.render(scene, camera)
}
