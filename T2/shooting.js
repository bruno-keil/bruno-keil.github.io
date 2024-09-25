import * as THREE from 'three';
import { wallBoxes } from './level1.js';
import { tank1, tank1BB, tank2, tank2BB, tank3, tank3BB, tank4BB } from './tank.js';
import { resetLevel, scene, selectedLevel } from './main.js';
import { reset, resetl } from './reset.js';
import { cannonBB, cannon } from './cannon.js';

let shots = []; // Array to hold all shots

let t1_hits = 0;
let t2_hits = 0;
let t3_hits = 0;

function updateHealthBar(tankId, hits) {
    const healthBar = document.getElementById(`${tankId}-health`);
    const healthPercentage = Math.max(0, (10 - hits) * 10);
    healthBar.style.width = `${healthPercentage}%`;

    if (healthPercentage > 50) {
        healthBar.style.backgroundColor = '#00ff00'; // Green
    } else if (healthPercentage > 0) {
        healthBar.style.backgroundColor = '#ffff00'; // Yellow
    } else {
        healthBar.style.backgroundColor = '#ff0000'; // Red
    }
}

export function shoot(tank, scene) {
    // Create a white sphere
    const sphereGeometry = new THREE.SphereGeometry(0.7, 64, 64);
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

    // Set the initial position of the sphere to the tank's position
    sphere.position.copy(tank.position);
    if(tank === cannon){
        sphere.translateY(0);
    }
    else{
    sphere.translateY(13);
    }
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    // Add the sphere to the scene
    scene.add(sphere);

    // Set the shot direction based on the tank's orientation
    let shotDirection = new THREE.Vector3();
    tank.getWorldDirection(shotDirection).negate();

    // Add the shot to the array
    shots.push({ sphere, direction: shotDirection, tank, ricochets: 0 });
}

export function update() {
    // Move each sphere in its own direction
    for (const shot of shots) {
        shot.sphere.translateOnAxis(shot.direction, 2);

        // Collision detection shot
        const shotBB = new THREE.Box3().setFromObject(shot.sphere);
        for (let i = 0; i < wallBoxes.length; i++) {
            if (shotBB.intersectsBox(wallBoxes[i]) && shot.tank === cannon){
                scene.remove(shot.sphere);
                shots.splice(shots.indexOf(shot), 1);
            }
            if (shotBB.intersectsBox(wallBoxes[i])) {
                if (shot.ricochets < 2) {
                    shot.ricochets++;
                    // Calculate the normal of the collision
                    let normal = new THREE.Vector3();
                    let diff = new THREE.Vector3().subVectors(shotBB.getCenter(new THREE.Vector3()), wallBoxes[i].getCenter(new THREE.Vector3()));
                    if (Math.abs(diff.x) > Math.abs(diff.y) && Math.abs(diff.x) > Math.abs(diff.z)) {
                        normal.set(Math.sign(diff.x), 0, 0);
                    } else if (Math.abs(diff.y) > Math.abs(diff.z)) {
                        normal.set(0, Math.sign(diff.y), 0);
                    } else {
                        normal.set(0, 0, Math.sign(diff.z));
                    }
                    // Reflect the shot direction based on the normal
                    shot.direction.reflect(normal);
                } else {
                    scene.remove(shot.sphere);
                    shots.splice(shots.indexOf(shot), 1);
                }
                break;
            }
        }

        if (shotBB.intersectsBox(tank1BB) && shot.tank !== tank1) {
            t1_hits++;
            updateHealthBar('t1', t1_hits);
            scene.remove(shot.sphere);
            shots.splice(shots.indexOf(shot), 1);
        }
        if (shotBB.intersectsBox(tank2BB) && shot.tank !== tank2) {
            t2_hits++;
            updateHealthBar('t2', t2_hits);
            scene.remove(shot.sphere);
            shots.splice(shots.indexOf(shot), 1);
        }
        if (shotBB.intersectsBox(tank3BB) && shot.tank !== tank3) {
            t3_hits++;
            updateHealthBar('t3', t3_hits);
            scene.remove(shot.sphere);
            shots.splice(shots.indexOf(shot), 1);
        }
        if (shotBB.intersectsBox(cannonBB) && shot.tank !== cannon) {
            scene.remove(shot.sphere);
            shots.splice(shots.indexOf(shot), 1);
            continue;
        }

        if (t3_hits === 10) {
            tank3.clear();
        }
        if (t2_hits === 10) {
            tank2.clear();
            if (selectedLevel === 1){
            resetLevel(2);
            }
        }
        if (t3_hits >= 10 && t2_hits >= 10) {
            reset(t1_hits, t2_hits);
        }
        if (t1_hits >= 10) {
            resetLevel(selectedLevel);
        }
    }
}
