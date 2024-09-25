import * as THREE from  'three';
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
import {initRenderer, 
        initCamera,
        initDefaultBasicLight,
        setDefaultMaterial,
        InfoBox,
        onWindowResize,
        createGroundPlaneXZ} from "../libs/util/util.js";
import { SphereGeometry } from '../build/three.module.js';
import GUI from '../libs/util/dat.gui.module.js';

let scene, renderer, camera, material, light, orbit; // Initial variables
scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // Init a basic renderer
camera = initCamera(new THREE.Vector3(0, 15, 30)); // Init camera in this position
material = setDefaultMaterial(); // create a basic material
light = initDefaultBasicLight(scene); // Create a basic light to illuminate the scene
orbit = new OrbitControls( camera, renderer.domElement ); // Enable mouse rotation, pan, zoom etc.

// Listen window size changes
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

// Show axes (parameter is size of each axis)
let axesHelper = new THREE.AxesHelper( 12 );
scene.add( axesHelper );

// create the ground plane
let plane = createGroundPlaneXZ(20, 20)
scene.add(plane);

// create a cube
let sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
let sphere1 = new THREE.Mesh(sphereGeometry, material);
let sphere2 = new THREE.Mesh(sphereGeometry, material);
// position the cube
sphere1.position.set(-10.0, 2.0, 5.0);
sphere2.position.set(-10.0, 2.0, -5.0);
// add the cube to the scene
scene.add(sphere1);
scene.add(sphere2);

var clock = new THREE.Clock();
let s1 = 0;
let s2 = 0;

// Animate function
let animate = function() {
    requestAnimationFrame(animate);

    var delta = clock.getDelta();

    sphere1.position.lerp(new THREE.Vector3(10, 2, 0), delta * s1);
    sphere2.position.lerp(new THREE.Vector3(10, 2, 0), delta * s2);

    renderer.render(scene, camera);
};

animate();

var reset = function() {
    sphere1.position.set(-10.0, 2, 5.0);
    sphere2.position.set(-10.0, 2, -5.0);
    s1 = 0;
    s2 = 0;
};

var startSphere1 = function() {
    s1 = 0.01;
};

var startSphere2 = function() {
    s2 = 0.02;
};

var gui = new GUI();
gui.add({Reset: reset}, 'Reset');
gui.add({Esfera1: startSphere1}, 'Esfera1');
gui.add({Esfera2: startSphere2}, 'Esfera2');