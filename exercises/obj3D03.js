import * as THREE from 'three';
import Stats from '../build/jsm/libs/stats.module.js';
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
import { ConvexGeometry } from '../build/jsm/geometries/ConvexGeometry.js';
import KeyboardState from '../libs/util/KeyboardState.js';
import {
    initRenderer,
    InfoBox,
    initDefaultSpotlight,
    createGroundPlane,
    createLightSphere,
    onWindowResize
} from "../libs/util/util.js";

import { CSG } from "../libs/other/CSGMesh.js";

let scene, renderer, camera, stats, light, lightSphere, lightPosition, orbit;
scene = new THREE.Scene();
renderer = initRenderer("rgb(30, 30, 42)");
renderer.shadowMap.enabled = true;
camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.lookAt(0, 0, 0);
camera.position.set(6, 4, -4);
camera.up.set(0, 1, 0);
orbit = new OrbitControls(camera, renderer.domElement);
stats = new Stats();

lightPosition = new THREE.Vector3(2, 5, 2);
light = initDefaultSpotlight(scene, lightPosition, 15);
light.castShadow = true;
light.shadow.mapSize.width = 2048;
light.shadow.mapSize.height = 2048;
light.shadow.camera.near = 0.1;
light.shadow.camera.far = 500;
lightSphere = createLightSphere(scene, 0.1, 10, 10, lightPosition);

var keyboard = new KeyboardState();

window.addEventListener('resize', function () {
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

let mesh3;
let auxMat = new THREE.Matrix4();
let torusMesh = new THREE.Mesh( new THREE.TorusGeometry(0.8, 0.2, 20, 20));
let cubeMesh = new THREE.Mesh(new THREE.CylinderGeometry(1,1,3,32,32));
let sub = new THREE.Mesh(new THREE.CylinderGeometry(0.8,0.8,3,32,32));
let csgObject, cubeCSG, torusCSG, subCSG;

torusMesh.rotateX(THREE.MathUtils.degToRad(90));
torusMesh.rotateY(THREE.MathUtils.degToRad(90));
torusMesh.position.set(0.0, 0.3, 1.0); // reset position
sub.position.set(0.0, 0.3, 0.0);
sub.matrixAutoUpdate = false;
sub.updateMatrix();
updateObject(torusMesh);
torusCSG = CSG.fromMesh(torusMesh);
cubeCSG = CSG.fromMesh(cubeMesh);
subCSG = CSG.fromMesh(sub);

csgObject = cubeCSG.union(torusCSG); // Execute union
csgObject = csgObject.subtract(subCSG);
mesh3 = CSG.toMesh(csgObject, auxMat);
mesh3.material = new THREE.MeshPhongMaterial({ color: 'red', shininess: 200, specular: "rgb(255,255,255)"});
mesh3.position.set(0, 1.5, 0);
scene.add(mesh3);

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

function updateObject(mesh)
{
   mesh.matrixAutoUpdate = false;
   mesh.updateMatrix();
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
