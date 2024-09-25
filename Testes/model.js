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

lightPosition = new THREE.Vector3(2, 5, -13);
light = initDefaultSpotlight(scene, lightPosition, 15);
light.castShadow = true;
light.shadow.mapSize.width = 2048;
light.shadow.mapSize.height = 2048;
light.shadow.camera.near = 0.1;
light.shadow.camera.far = 500;
lightSphere = createLightSphere(scene, 0.1, 10, 10, lightPosition);

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

// Object Material
var objectMaterial = new THREE.MeshPhongMaterial({color:"rgb(255,0,0)"});
  objectMaterial.side =  THREE.DoubleSide; // Show front and back polygons
  
  function createBarrel(size, material) {
      const outerBarrelGeometry = new THREE.CylinderGeometry(size/5, size/5, size * 2, 32);
      const innerBarrelGeometry = new THREE.CylinderGeometry(size / 10, size / 10, size * 2.1, 32);
  
      const outerBarrelMesh = new THREE.Mesh(outerBarrelGeometry, material);
      const innerBarrelMesh = new THREE.Mesh(innerBarrelGeometry, material);
  
      innerBarrelMesh.position.set(0, 0, 0);
      innerBarrelMesh.updateMatrix();
  
      let outerCSG = CSG.fromMesh(outerBarrelMesh);
      let innerCSG = CSG.fromMesh(innerBarrelMesh);
      let barrelCSG = outerCSG.subtract(innerCSG);
  
      const barrel = CSG.toMesh(barrelCSG, outerBarrelMesh.matrix);
      barrel.material = material;
      barrel.castShadow = true;
      barrel.receiveShadow = true;
  
      return barrel;
  }
  
  function createCannon(size, material) {
      const cannon = new THREE.Object3D();
      const barrel = createBarrel(size, material);
      barrel.position.y = size;
      cannon.add(barrel);
      cannon.rotation.x = 90 * Math.PI / 180;
      cannon.position.y = size / 10;
      cannon.castShadow = true;
      cannon.receiveShadow = true;
      return cannon;
  }
  
  function createCannonBase(size, material) {
      const geometry = new THREE.SphereGeometry(size * 0.8, 32, 16);
      const cannonBase = new THREE.Mesh(geometry, material);
      cannonBase.castShadow = true;
      cannonBase.receiveShadow = true;
      return cannonBase;
  }
  
  function assembleTank(size, material) {
      const tank = new THREE.Object3D();
      const cannonBase = createCannonBase(size, material);
      const cannon = createCannon(size, material);
  
      tank.add(cannonBase);
      tank.add(cannon);
      tank.position.set(-size * 10, size / 2, size * 10);
      tank.rotateY(Math.PI);
      tank.castShadow = true;
      tank.receiveShadow = true;
  
      return tank;
  }
  
  const tankSize = 5;
  let blueMaterial = new THREE.MeshPhongMaterial({ color: 0x0000FF });
  
  const cannon = assembleTank(tankSize, blueMaterial);
  
  const cannonBB = new THREE.Box3();

  scene.add(cannon);
  cannon.position.set(0,0,0);

render();

function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera)
}
