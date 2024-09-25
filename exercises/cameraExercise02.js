import * as THREE from  'three';
import KeyboardState from '../libs/util/KeyboardState.js'
import {TeapotGeometry} from '../build/jsm/geometries/TeapotGeometry.js';
import {initRenderer, 
        initDefaultSpotlight,
        createGroundPlaneXZ,
        SecondaryBox, 
        onWindowResize} from "../libs/util/util.js";
import { Object3D } from '../build/three.module.js';

let scene, renderer, light, camera, keyboard;
scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // View function in util/utils
light = initDefaultSpotlight(scene, new THREE.Vector3(5.0, 5.0, 5.0)); // Use default light    
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );
keyboard = new KeyboardState();

var groundPlane = createGroundPlaneXZ(10, 10, 40, 40); // width, height, resolutionW, resolutionH
scene.add(groundPlane);

// Create objects
createTeapot( 2.0,  0.4,  0.0, Math.random() * 0xffffff);
createTeapot(0.0,  0.4,  2.0, Math.random() * 0xffffff);  
createTeapot(0.0,  0.4, -2.0, Math.random() * 0xffffff);    

let camPos  = new THREE.Vector3(0, 0.5, 0);
let camUp   = new THREE.Vector3(0.0, 1.0, 0.0);
let camLook = new THREE.Vector3(0.0, 0.5, -1.0);
var message = new SecondaryBox("");

// Main camera
camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
   camera.position.copy(camPos);
   camera.up.copy( camUp );
   camera.lookAt(camLook);

render();

let holder = new THREE.Object3D();
    holder.add(camera);
    scene.add(holder);

function updateCamera()
{
   camPos.x = camera.position.x;
   camPos.y = camera.position.y;
   camPos.z = camera.position.z;

   message.changeMessage("Pos: {" + camPos.x + ", " + camPos.y + ", " + camPos.z + "} " + 
                         "/ LookAt: {" + camLook.x + ", " + camLook.y + ", " + camLook.z + "}");
}

function keyboardUpdate() {

   keyboard.update();
   
   if (keyboard.pressed("left")) holder.rotateY(THREE.MathUtils.degToRad(1));
   if (keyboard.pressed("right")) holder.rotateY(THREE.MathUtils.degToRad(-1));
   if (keyboard.pressed("up")) holder.rotateX(THREE.MathUtils.degToRad(1));
   if (keyboard.pressed("down")) holder.rotateX(THREE.MathUtils.degToRad(-1));
   if (keyboard.pressed("pageup")) holder.rotateZ(THREE.MathUtils.degToRad(1));
   if (keyboard.pressed("pagedown")) holder.rotateZ(THREE.MathUtils.degToRad(-1));

   if (keyboard.pressed("A")) holder.translateX (-0.1);
   if (keyboard.pressed("D")) holder.translateX (0.1);
   if (keyboard.pressed("W")) holder.translateZ (-0.1);
   if (keyboard.pressed("S")) holder.translateZ (0.1);
   
   updateCamera();
}

function createTeapot(x, y, z, color )
{
   var geometry = new TeapotGeometry(0.5);
   var material = new THREE.MeshPhongMaterial({color, shininess:"200"});
      material.side = THREE.DoubleSide;
   var obj = new THREE.Mesh(geometry, material);
      obj.castShadow = true;
      obj.position.set(x, y, z);
   scene.add(obj);
}

function render()
{
   requestAnimationFrame(render);
   keyboardUpdate();
   renderer.render(scene, camera) // Render scene
}