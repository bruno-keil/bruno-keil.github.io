import * as THREE from 'three';
import { createArena, createFloor } from './level1.js';
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
import { initRenderer, initDefaultBasicLight, setDefaultMaterial } from "../libs/util/util.js";
import { keyboardUpdate, isOrbitControlsActive, initialCameraPosition } from './keyboard.js';
import { update } from './shooting.js';
import { tank1, tank2, tank3 } from './tank.js';
import { resetl } from './reset.js';
import { createArena2, createFloor2 } from './level2.js';

let scene, renderer, camera, material, light, orbit; // Initial variables

// Retrieve the selected level from localStorage or default to level 1
let selectedLevel = localStorage.getItem('selectedLevel') ? parseInt(localStorage.getItem('selectedLevel'), 10) : 1;

// Function to initialize the scene
function init(level) {
    selectedLevel = level;
    scene = new THREE.Scene();    // Create main scene
    renderer = initRenderer();    // Init a basic renderer
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000); // Init camera in this position
    material = setDefaultMaterial(); // create a basic material
    light = initDefaultBasicLight(scene); // Create a basic light to illuminate the scene
    orbit = new OrbitControls(camera, renderer.domElement); // Enable mouse rotation, pan, zoom etc.

    // Listen window size changes
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    if(selectedLevel === 1){
    createArena(200, scene);
    createFloor(200, scene);
    }
    else if(selectedLevel === 2) {
      createArena2(200, scene)
      createFloor2(200, scene)
    }

    createHealthBars();

    if(level === 1){
      tank3.clear();
    }

    render();
}

// Function to adjust the camera view
function adjustCameraView(tank1, tank2, tank3, camera) {
    const tankPositions = [tank1.position.clone(), tank2.position.clone(), tank3.position.clone()];
    const bounds = new THREE.Box3().setFromPoints(tankPositions);
    const center = new THREE.Vector3();
    bounds.getCenter(center);

    const size = new THREE.Vector3();
    bounds.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / (2 * Math.tan(fov / 2)));
    cameraZ *= 1.5; // Added some margin to ensure tanks stay within view

    // Set the new camera position
    camera.position.x = center.x;
    camera.position.y = 160; // Maintain a fixed height above the tanks
    camera.position.z = center.z + cameraZ;

    camera.lookAt(center); // Ensure the camera always points towards the center between the tanks
}

// Function to render the scene
function render() {
    requestAnimationFrame(render);

    keyboardUpdate();
    update(tank1, tank2, scene);

    if (!isOrbitControlsActive) {
        adjustCameraView(tank1, tank2, tank3, camera);
    } else {
        initialCameraPosition.copy(camera.position);
    }

    renderer.render(scene, camera); // Render scene
}

// Function to create health bars
function createHealthBars() {
    function createHealthBar(id, left, bottom, identifier) {
        const healthBarContainer = document.createElement('div');
        healthBarContainer.id = `${id}-container`;
        healthBarContainer.style.position = 'absolute';
        healthBarContainer.style.bottom = `${bottom}px`;
        healthBarContainer.style.left = `${left}px`;
        healthBarContainer.style.width = '100px';
        healthBarContainer.style.height = '20px';
        healthBarContainer.style.border = '1px solid #ffffff';
        healthBarContainer.style.backgroundColor = '#ff0000';

        const healthBar = document.createElement('div');
        healthBar.id = id;
        healthBar.style.width = '100%';
        healthBar.style.height = '100%';
        healthBar.style.backgroundColor = '#00ff00';

        const identifierText = document.createElement('span');
        identifierText.innerText = identifier;
        identifierText.style.position = 'absolute';
        identifierText.style.width = '100%';
        identifierText.style.textAlign = 'center';
        identifierText.style.color = '#000000';

        healthBar.appendChild(identifierText);
        healthBarContainer.appendChild(healthBar);
        document.body.appendChild(healthBarContainer);
    }

    createHealthBar('t1-health', 10, 10, 'Tank 1');
    createHealthBar('t2-health', window.innerWidth - 120, 40, 'Tank 2');
    if (selectedLevel === 2) {
        createHealthBar('t3-health', window.innerWidth - 120, 70, 'Tank 3');
    }
}

// Function to reset and reinitialize the level
function resetLevel(level) {
    selectedLevel = level;
    resetl(); // Reset game state
}

// Automatically start the game at the selected level
init(selectedLevel);

export { scene, selectedLevel, resetLevel }; // Export the scene, selectedLevel, and resetLevel function
