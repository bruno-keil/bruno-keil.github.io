import * as THREE from  'three';
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
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

// Listen window size changes
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

// Show axes (parameter is size of each axis)
let axesHelper = new THREE.AxesHelper( 12 );
scene.add( axesHelper );

// create the ground plane
let plane = createGroundPlaneXZ(20, 20)
scene.add(plane);

// Assuming you have a scene already set up
let sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);

let numSpheres = 11; // Number of spheres
let radius = 8; // Radius of the circle

/*for(let i = 0; i < numSpheres; i++) {
    let sphere = new THREE.Mesh(sphereGeometry, material);

    // Calculate position of each sphere on the circle
    let angle = (Math.PI * 2 / numSpheres) * i;
    sphere.position.x = radius * Math.cos(angle);
    sphere.position.z = radius * Math.sin(angle);
    sphere.position.y = 0.5;

    scene.add(sphere);
}
*/
for(let i = 0; i < numSpheres; i++) {
  let sphere = new THREE.Mesh(sphereGeometry, material);
  let angle = THREE.MathUtils.degToRad(360/numSpheres);
  scene.add(sphere);
  sphere.rotateY(i*angle);
  sphere.translateX(radius);
  sphere.position.y = 0.5;
}
// Use this to show information onscreen
let controls = new InfoBox();
  controls.add("Basic Scene");
  controls.addParagraph();
  controls.add("Use mouse to interact:");
  controls.add("* Left button to rotate");
  controls.add("* Right button to translate (pan)");
  controls.add("* Scroll to zoom in/out.");
  controls.show();

render();
function render()
{
  requestAnimationFrame(render);
  renderer.render(scene, camera) // Render scene
}