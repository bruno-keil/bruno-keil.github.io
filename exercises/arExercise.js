import * as THREE from 'three';
import GUI from '../libs/util/dat.gui.module.js';
import { ARjs } from '../libs/AR/ar.js';
import { GLTFLoader } from '../build/jsm/loaders/GLTFLoader.js';
import { initRenderer } from "../libs/util/util.js";

let scene, camera, renderer, spotLight;
let spotLightHelper;
renderer = initRenderer();
renderer.setClearColor(new THREE.Color('lightgrey'), 0);  
renderer.shadowMap.enabled = true;
scene = new THREE.Scene();
camera = new THREE.PerspectiveCamera();
scene.add(camera);
let target = new THREE.Object3D();
target.position.set(0, 0, 0);
scene.add(target);

spotLight = new THREE.SpotLight(0xffffff, 100);
spotLight.position.set(-5, 5, 0);
spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 4096;
spotLight.shadow.mapSize.height = 4096;
spotLight.shadow.camera.near = 0.5;
spotLight.shadow.camera.far = 50;
spotLight.shadow.bias = -0.001;
spotLight.shadow.camera.left = -10;
spotLight.shadow.camera.right = 10;
spotLight.shadow.camera.top = 10;
spotLight.shadow.camera.bottom = -10;
scene.add(spotLight);
spotLight.target = target;

spotLightHelper = new THREE.SpotLightHelper(spotLight);
//scene.add(spotLightHelper);

let AR = { source: null, context: null };
setARStuff();
window.addEventListener('resize', function() { onResize(); });

let sceneObjects = {
    plane: null,
    dog: null
};
createPlane();
loadDogModel();

createInterface();

let mixer;
render();

function render() {
    updateAR();
    if (mixer) mixer.update(0.01);
    spotLightHelper.update();
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}

function updateAR() {
    if (AR.source) {
        if (AR.source.ready === false) return;
        AR.context.update(AR.source.domElement);
        scene.visible = camera.visible;
    }
}

function createPlane() {
    let planeGeometry = new THREE.PlaneGeometry(1.5, 1.5);
    let planeMaterial = new THREE.MeshStandardMaterial({ color: 0xd3d3d3, transparent: true, opacity: 0.3 });
    let plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = true;
    scene.add(plane);
    sceneObjects.plane = plane;
}

function loadDogModel() {
    const loader = new GLTFLoader();
    loader.load('../assets/objects/dog.glb', function(gltf) {
        let dog = gltf.scene;
        dog.position.set(0, 0, 0);
        dog.castShadow = true;
        dog.traverse(function(child) {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        sceneObjects.dog = dog;
        scene.add(dog);

        mixer = new THREE.AnimationMixer(dog);
        gltf.animations.forEach((clip) => {
            mixer.clipAction(clip).play();
        });
    });
}

function createInterface() {
    let controls = new function() {
        this.toggleDogVisibility = function() {
            sceneObjects.dog.visible = !sceneObjects.dog.visible;
        };
    };
    let gui = new GUI();
    gui.add(controls, 'toggleDogVisibility').name("Toggle Dog Visibility");
}

function onResize() {
    AR.source.onResizeElement();
    AR.source.copyElementSizeTo(renderer.domElement);
    if (AR.context.arController !== null) {
        AR.source.copyElementSizeTo(AR.context.arController.canvas);
    }
}

function setARStuff() {
    AR.source = new ARjs.Source({
        sourceType: 'video',
        sourceUrl: '../assets/AR/kanjiScene.mp4'
    });

    AR.source.init(function onReady() {
        setTimeout(() => { onResize(); }, 100);
    });

    AR.context = new ARjs.Context({
        cameraParametersUrl: '../libs/AR/data/camera_para.dat',
        detectionMode: 'mono'
    });

    AR.context.init(function onCompleted() {
        camera.projectionMatrix.copy(AR.context.getProjectionMatrix());
    });

    let markerControls = new ARjs.MarkerControls(AR.context, camera, {
        type: 'pattern',
        patternUrl: '../libs/AR/data/patt.kanji',
        changeMatrixMode: 'cameraTransformMatrix'
    });

    scene.visible = false;
}