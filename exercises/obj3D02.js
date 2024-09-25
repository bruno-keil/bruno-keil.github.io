import * as THREE from 'three';
import Stats from '../build/jsm/libs/stats.module.js';
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
import { GLTFLoader } from '../build/jsm/loaders/GLTFLoader.js'; // Add this line
import KeyboardState from '../libs/util/KeyboardState.js';
import { initRenderer, 
        InfoBox,
        createGroundPlane,
        createLightSphere,        
        onWindowResize } from "../libs/util/util.js";

let scene, renderer, camera, stats, light, lightSphere, lightPosition, orbit, object;
scene = new THREE.Scene();
renderer = initRenderer("rgb(30, 30, 42)");
renderer.shadowMap.enabled = true;
camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.lookAt(0, 0, 0);
camera.position.set(6, 3, 7);
camera.up.set(0, 1, 0);
orbit = new OrbitControls(camera, renderer.domElement);
stats = new Stats();

lightPosition = new THREE.Vector3(5, 7, 5);
light = new THREE.DirectionalLight(0xffffff, 1);
light.position.copy(lightPosition);
light.castShadow = true;
light.shadow.mapSize.width = 2048;
light.shadow.mapSize.height = 2048;
light.shadow.camera.near = 0.1;
light.shadow.camera.far = 500;
scene.add(light);

lightSphere = createLightSphere(scene, 0.1, 10, 10, lightPosition);

var keyboard = new KeyboardState();

window.addEventListener('resize', function() {
    onWindowResize(camera, renderer)
}, false);

var groundPlane = createGroundPlane(40.0, 25.0, 50, 50); // Increased size
groundPlane.rotateX(THREE.MathUtils.degToRad(-90));
groundPlane.receiveShadow = true;
scene.add(groundPlane);

var axesHelper = new THREE.AxesHelper(1.5);
axesHelper.visible = false;
scene.add(axesHelper);

showInformation();

// Load the GLB object
const loader = new GLTFLoader();
loader.load(
    './uploads-files-2449357-toon_tank.glb', // Replace with the path to your GLB file
    function (gltf) {
        object = gltf.scene;
        object.traverse(function (node) {
            if (node.isMesh) {
                node.castShadow = true;
            }
        });
        object.position.set(0, 0.5, 0);
        scene.add(object);
    },
    undefined,
    function (error) {
        console.error(error);
    }
);

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
