import * as THREE from 'three';
import { GLTFLoader } from '../build/jsm/loaders/GLTFLoader.js';
import { TextureLoader } from 'three';
import { createArena, createFloor, levelcheck, updateMovingWalls } from './level1.js';
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
import { initRenderer, setDefaultMaterial, initDefaultBasicLight } from "../libs/util/util.js";
import { keyboardUpdate, isOrbitControlsActive, initialCameraPosition, godMode, isMobile, shooting, fwdValue, bkdValue, lftValue, rgtValue } from './keyboard.js';
import { t1_hits, update, updateHealthBar } from './shooting.js';
import { tank1, tank2, tank3 } from './tank.js';
import { resetl } from './reset.js';
import { updateBots } from './bot.js';
import { checkComplete } from './collisions.js';

let scene, renderer, camera, material, orbit, light; // Initial variables
let ambientLight, directionalLight;

const clock = new THREE.Clock();
let zoomDistance = 300; // Initial distance from the tank
const maxZoom = 400;
const minZoom = 100;
const tiltAngle = THREE.MathUtils.degToRad(50);

// Retrieve the selected level from localStorage or default to level 1
let selectedLevel = localStorage.getItem('selectedLevel') ? parseInt(localStorage.getItem('selectedLevel'), 10) : 1;

function loadSkybox(scene) {
    const loader = new GLTFLoader();
    const textureLoader = new TextureLoader();

    // Load the GLB skybox model
    loader.load('./skybox/source/skybox.glb', function (gltf) {
        const skybox = gltf.scene;

        // Load the texture for the skybox
        const skyboxTexture = textureLoader.load('./skybox/textures/skybox.png', function (texture) {
            // Apply the texture to the skybox (assuming it uses a MeshStandardMaterial or MeshBasicMaterial)
            skybox.traverse((child) => {
                if (child.isMesh) {
                    child.material.map = texture; // Apply the texture to the mesh
                    child.material.needsUpdate = true;
                }
            });
        });

        // Scale the skybox and add it to the scene
        skybox.scale.set(500, 500, 500); // Adjust the scale as necessary
        scene.add(skybox);
    },
    // On error callback
    undefined,
    function (error) {
        console.error('An error occurred loading the skybox:', error);
    });
}

// Function to initialize the scene
function init(level) {
    selectedLevel = level;
    scene = new THREE.Scene();    // Create main scene
    renderer = initRenderer();    // Init a basic renderer
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000); // Init camera in this position
    material = setDefaultMaterial(); // create a basic material
    orbit = new OrbitControls(camera, renderer.domElement); // Enable mouse rotation, pan, zoom etc.

    loadSkybox(scene);

    // Add lights based on the selected level
    if (level === 1 || level === 3) {
        // Basic light for level 1
        light = initDefaultBasicLight(scene);
    } else if (level === 2) {
        // Ambient and directional lights for level 2 with almost no brightness
        ambientLight = new THREE.AmbientLight(0x404040, 0.1); // Dim ambient light
        scene.add(ambientLight);

        directionalLight = new THREE.DirectionalLight(0xffffff, 0.1); // Dim directional light
        directionalLight.position.set(0, 200, 100);
        directionalLight.shadow.mapSize.width = 1024; 
        directionalLight.shadow.mapSize.height = 1024;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        scene.add(directionalLight);
    }

    createArena(200, scene, level);
    createFloor(200, scene, level);

    createHealthBars();

    if (level === 1) {
        tank3.clear();
    }

    render();
}

// Function to adjust the camera view
function adjustCameraView(tank1, camera) {
    const tankPosition = tank1.position.clone();

    const cameraOffset = new THREE.Vector3(0, zoomDistance * Math.sin(tiltAngle), zoomDistance * Math.cos(tiltAngle));

    camera.position.copy(tankPosition).add(cameraOffset);
    
    camera.lookAt(tankPosition);
}

function handleZoom(event) {
    if (event.deltaY < 0) {
        zoomDistance = Math.max(minZoom, zoomDistance - 10);
    } else if (event.deltaY > 0) {
        zoomDistance = Math.min(maxZoom, zoomDistance + 10);
    }
}


window.addEventListener('wheel', handleZoom);

function handleResize() {
    const isPortrait = window.innerHeight > window.innerWidth;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Adjust health bars for mobile
    const t1Health = document.getElementById('t1-health-container');
    const t2Health = document.getElementById('t2-health-container');
    
    if (isPortrait) {
        t1Health.style.left = '10px';  // Adjust positioning for portrait
        t2Health.style.right = '10px'; 
    } else {
        t1Health.style.left = '10px';  // Adjust for landscape
        t2Health.style.right = '10px';
    }
}

window.addEventListener('resize', handleResize);

// Joystick handling for mobile
function addJoysticks() {
    joystickL = nipplejs.create({
        zone: document.getElementById('joystickWrapper1'),
        mode: 'static',
        position: { top: '50%', left: '20%' },
        color: 'blue',
        size: 150, // Smaller size for mobile
        multitouch: true,
        restJoystick: true,
    });

    joystickL.on('move', function (evt, data) {
        const forward = data.vector.y;
        const turn = data.vector.x;
        fwdValue = bkdValue = lftValue = rgtValue = 0;

        if (forward > 0) fwdValue = Math.abs(forward);  // Move forward
        else if (forward < 0) bkdValue = Math.abs(forward);  // Move backward

        if (turn > 0) rgtValue = Math.abs(turn);  // Rotate right
        else if (turn < 0) lftValue = Math.abs(turn);  // Rotate left
    });

    joystickL.on('end', function () {
        fwdValue = bkdValue = lftValue = rgtValue = 0; // Reset movement when joystick is released
    });

    joystickR = nipplejs.create({
        zone: document.getElementById('joystickWrapper2'),
        mode: 'static',
        lockY: true,
        position: { top: '50%', right: '20%' },
        color: 'green',
        size: 150, // Adjust joystick size for mobile
        multitouch: true,
        restJoystick: true,
    });

    joystickR.on('move', function (evt, data) {
        // Implement additional right joystick actions if necessary
    });
}

function addShootButton() {
    shootButton = document.getElementById('A');
    shootButton.addEventListener('mousedown', () => shooting = true);
    shootButton.addEventListener('mouseup', () => shooting = false);
    shootButton.addEventListener('touchstart', () => shooting = true);
    shootButton.addEventListener('touchend', () => shooting = false);
}

// Initialize joysticks and buttons for mobile
if (isMobile) {
    addJoysticks();
    addShootButton();
}

// Function to render the scene
function render() {
    requestAnimationFrame(render);

    const deltaTime = clock.getDelta();

    keyboardUpdate();
    update(tank1, tank2, scene);
    updateBots();

    if(checkTankPassage(tank1)){
        resetLevel(selectedLevel);
    }

    updateMovingWalls(deltaTime);

    updateHealthBarAppearance();

    if (!isOrbitControlsActive) {
        adjustCameraView(tank1, camera);
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
    if (selectedLevel === 2 || selectedLevel === 3) {
        createHealthBar('t3-health', window.innerWidth - 120, 70, 'Tank 3');
    }
    if (selectedLevel === 3){
        createHealthBar('t4-health', window.innerWidth - 120, 100, 'Tank 4');
    }
}

// Function to update health bar appearance based on godMode
function updateHealthBarAppearance() {
    const healthBar = document.getElementById('t1-health');

    if (godMode) {
        let aux = 0;
        updateHealthBar('t1', aux);
        healthBar.style.background = 'linear-gradient(90deg, red, orange, yellow, green, blue, indigo, violet)';
        healthBar.style.backgroundSize = '150% 100%'; // Gradient stretched across double the width
        healthBar.style.animation = 'rainbow-wave 4s infinite linear'; // Slower and smoother wave
    } else {
        updateHealthBar('t1', t1_hits);
        healthBar.style.background = '#00ff00'; // Restore to normal green health bar
        healthBar.style.animation = ''; // Remove animation
    }
}

export function checkTankPassage(tank) {
    // Create a bounding box for the tank
    const tankBox = new THREE.Box3().setFromObject(tank);

    // Check for level transition
    for (let i = 0; i < levelcheck.length; i++) {
        if (tankBox.intersectsBox(levelcheck[i])) {
            return true; // Return true if level transition is detected
        }
    }
}

// CSS for rainbow wave effect
const style = document.createElement('style');
style.textContent = `
  @keyframes rainbow-wave {
    0% { background-position: 0% 0%; }
    100% { background-position: 100% 0%; }
  }
  #t1-health {
    background-size: 150% 100%;
  }
`;
document.head.appendChild(style);

// Function to reset and reinitialize the level
function resetLevel(level) {
    selectedLevel = level;
    resetl(); // Reset game state
}

function onButtonPressed() {
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.classList.add('fade-out');
    loadingScreen.addEventListener('transitionend', (e) => {
        const element = e.target;
        element.remove();  
    });

    // Call the init function and pass the level (you can get level dynamically)
    init(selectedLevel);
}

// Automatically start the game at the selected level
document.getElementById('myBtn').addEventListener('click', onButtonPressed);

export { scene, selectedLevel, resetLevel }; // Export the scene, selectedLevel, and resetLevel function
