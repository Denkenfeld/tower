// ========== MAIN GAME LOOP AND INITIALIZATION ==========
import * as THREE from 'three';
import { LEVELS } from './levels.js';
import { TOWER_TYPES } from './towerTypes.js';
import { TILE_COSTS } from './config.js';
import { Tower } from './TowerClass.js';
import { Enemy } from './EnemyClass.js';
import { NeuroCore } from './CoreClass.js';
import { sfx } from './audio.js';
import { gameState, entities, shake, gameSpeed, resetGameState } from './gameState.js';
import { createGrid, markPathTiles, getTileAt, updateTiles, clearGrid } from './grid.js';
import { startWave, checkWaveComplete, updateWaveSpawning } from './waves.js';
import { updateUI, showMessage, hideTowerInfo, showTowerInfo, showTileInfo } from './ui.js';
import { initScene, scene, camera, renderer, controls, ambientLight, directionalLight, clearScene, updateSkyDome } from './scene.js';

let neuroCore = null;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let lastTime = 0;

// Global pause state
window.isPausedGlobal = false;

export function init() {
    // Clear everything
    clearScene();
    clearGrid(scene);

    resetGameState();

    entities.towers = [];
    entities.enemies = [];
    entities.projectiles = [];

    // Initialize scene if not already done
    if (!renderer) {
        initScene();
    }

    // Recreate scene basics
    scene.fog = new THREE.FogExp2(0x000000, 0.02);

    // Re-add lights
    scene.add(ambientLight);
    scene.add(directionalLight);

    // Grid
    createGrid(scene);
    markPathTiles();

    // Neuro Core
    neuroCore = new NeuroCore(scene);

    // Event listeners
    window.addEventListener('click', onMouseClick);

    // Start audio
    sfx.init();

    return true;
}

function animate() {
    requestAnimationFrame(animate);

    const now = performance.now() / 1000;
    const dt = Math.min(now - lastTime, 0.1);
    lastTime = now;

    if (window.isPausedGlobal || gameState.isGameOver) {
        renderer.render(scene, camera);
        return;
    }

    const actualDt = dt * gameSpeed;

    // Update controls
    controls.update();

    // Update sky dome
    updateSkyDome(now);

    // Update neuro core
    if (neuroCore) {
        neuroCore.update(actualDt);
    }

    // Update tiles
    updateTiles(actualDt);

    // Update towers
    entities.towers.forEach(tower => tower.update(actualDt));

    // Update enemies
    entities.enemies.forEach(enemy => enemy.update(actualDt));
    entities.enemies = entities.enemies.filter(e => !e.dead);

    // Update projectiles
    entities.projectiles.forEach(proj => proj.update(actualDt));
    entities.projectiles = entities.projectiles.filter(p => p.active);

    // Camera shake
    if (shake.amount > 0) {
        camera.position.x += (Math.random() - 0.5) * shake.amount;
        camera.position.y += (Math.random() - 0.5) * shake.amount;
        camera.position.z += (Math.random() - 0.5) * shake.amount;
        shake.amount *= 0.9;
    }

    // Wave spawning
    updateWaveSpawning(actualDt, scene, neuroCore, shake, gameSpeed);

    // Check wave completion
    checkWaveComplete(scene);

    // Render
    renderer.render(scene, camera);
}

function onMouseClick(event) {
    if (window.isPausedGlobal || gameState.isGameOver) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        const obj = intersects[0].object;

        // Find tile or tower
        let tile = null;
        let tower = null;

        let parent = obj;
        while (parent) {
            if (parent.userData && parent.userData.tile) {
                tile = parent.userData.tile;
                break;
            }
            if (parent.userData && parent.userData.tower) {
                tower = parent.userData.tower;
                break;
            }
            parent = parent.parent;
        }

        // DELETE MODE
        if (window.deleteMode && tower) {
            const refund = Math.floor(tower.getTotalCost() * 0.7);
            gameState.money += refund;
            tile = getTileAt(tower.mesh.position.x, tower.mesh.position.z);
            if (tile) tile.tower = null;
            scene.remove(tower.mesh);
            const idx = entities.towers.indexOf(tower);
            if (idx !== -1) entities.towers.splice(idx, 1);
            hideTowerInfo();
            updateUI();
            sfx.playError();
            return;
        }

        // SHOW TOWER INFO
        if (tower) {
            showTowerInfo(tower);
            return;
        }

        // TILE INTERACTIONS
        if (tile) {
            // Show repair info for destroyed tiles
            if (tile.isCollapsed) {
                showTileInfo(tile);
                return;
            }

            // Can't build on path
            if (tile.isPath) {
                showMessage("CAN'T BUILD ON PATH!");
                sfx.playError();
                return;
            }

            // Show existing tower info
            if (tile.tower) {
                showTowerInfo(tile.tower);
                return;
            }

            // TILE STACKING MODE
            if (gameState.selectedTowerType === -1) {
                if (tile.stackLevel >= 2) {
                    showMessage("TILE ALREADY DOUBLE-STACKED!");
                    sfx.playError();
                    return;
                }
                if (gameState.money < TILE_COSTS.stack) {
                    showMessage("NOT ENOUGH CREDITS!");
                    sfx.playError();
                    return;
                }
                gameState.money -= TILE_COSTS.stack;
                tile.stackTile();
                updateUI();
                return;
            }

            // BUILD TOWER
            const towerType = TOWER_TYPES[gameState.selectedTowerType];
            if (gameState.money >= towerType.baseCost) {
                gameState.money -= towerType.baseCost;
                const newTower = new Tower(
                    tile.x, tile.z, 
                    gameState.selectedTowerType, 
                    scene, entities, gameState,
                    () => window.isPausedGlobal
                );
                tile.tower = newTower;
                entities.towers.push(newTower);
                scene.add(newTower.mesh);

                // Spawn animation
                newTower.mesh.scale.set(0.1, 0.1, 0.1);
                const scaleUp = () => {
                    if (newTower.mesh.scale.x < 1) {
                        newTower.mesh.scale.addScalar(0.05);
                        requestAnimationFrame(scaleUp);
                    }
                };
                scaleUp();

                updateUI();
                sfx.playBuild();
            } else {
                showMessage("NOT ENOUGH CREDITS!");
                sfx.playError();
            }
        }
    }
}

function endGame() {
    gameState.isGameOver = true;
    document.getElementById('game-over-screen').style.display = 'flex';
    document.getElementById('final-score').innerText = `Wave Reached: ${gameState.wave}`;
    sfx.stopBackgroundMusic();
}

// Callback for UI
window.startGameCallback = function(levelIndex) {
    gameState.levelIndex = levelIndex;
    gameState.wave = 1;
    gameState.money = LEVELS[levelIndex].isSandbox ? gameState.sandboxConfig.startingMoney : 450;
    gameState.lives = 100;
    gameState.isGameOver = false;
    gameState.selectedTowerType = 0;

    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('game-over-screen').style.display = 'none';
    document.getElementById('victory-screen').style.display = 'none';
    document.getElementById('ui-layer').style.display = 'flex';
    document.getElementById('build-menu').style.display = 'flex';

    init();
    updateUI();

    if (sfx.enabled) {
        sfx.resumeBackgroundMusic();
    }
};

window.updateLightingCallback = function(type, value) {
    const val = parseFloat(value) / 100;
    if (type === 'ambient') {
        ambientLight.intensity = val * 2;
        document.getElementById('ambient-val').innerText = val.toFixed(1);
    } else if (type === 'directional') {
        directionalLight.intensity = val * 3;
        document.getElementById('dir-val').innerText = val.toFixed(1);
    }
};

window.updateGameSpeedCallback = function(value) {
    const speed = parseFloat(value) / 100;
    // gameSpeed is exported from gameState, need setter
    document.getElementById('speed-val').innerText = speed.toFixed(1) + 'x';
};

// Start animation loop
document.addEventListener('DOMContentLoaded', () => {
    sfx.init();
    initScene();
    updateUI();
    animate();
});

// Expose for wave system
window.startWave = () => startWave(hideTowerInfo, scene, neuroCore, shake);
