// ========== MAIN GAME LOOP AND INITIALIZATION ==========
import * as THREE from 'three';
import { LEVELS } from './levels.js';
import { TOWER_TYPES } from './towerTypes.js';
import { TILE_COSTS } from './config.js';
import { Tower } from './TowerClass.js';
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

window.isPausedGlobal = false;
window.deleteMode = false;

export function init() {
    clearScene();
    clearGrid(scene);

    resetGameState();
    entities.towers = [];
    entities.enemies = [];
    entities.projectiles = [];

    if (!renderer) initScene();

    scene.fog = new THREE.FogExp2(0x000000, 0.02);
    scene.add(ambientLight);
    scene.add(directionalLight);

    createGrid(scene);
    markPathTiles();

    neuroCore = new NeuroCore(scene);

    window.addEventListener('click', onMouseClick);

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

    controls.update();
    updateSkyDome(now);

    if (neuroCore) neuroCore.update(actualDt);

    updateTiles(actualDt);
    entities.towers.forEach(tower => tower.update(actualDt));
    entities.enemies.forEach(enemy => enemy.update(actualDt));
    entities.enemies = entities.enemies.filter(e => !e.dead);
    entities.projectiles.forEach(proj => proj.update(actualDt));
    entities.projectiles = entities.projectiles.filter(p => p.active);

    if (shake.amount > 0) {
        camera.position.x += (Math.random() - 0.5) * shake.amount;
        camera.position.y += (Math.random() - 0.5) * shake.amount;
        camera.position.z += (Math.random() - 0.5) * shake.amount;
        shake.amount *= 0.9;
    }

    updateWaveSpawning(actualDt, scene, neuroCore, shake, () => gameSpeed);
    checkWaveComplete(scene, updateUI, showMessage);

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

        if (tower) {
            showTowerInfo(tower);
            return;
        }

        if (tile) {
            if (tile.isCollapsed) {
                showTileInfo(tile);
                return;
            }

            if (tile.isPath) {
                showMessage("CAN'T BUILD ON PATH!");
                sfx.playError();
                return;
            }

            if (tile.tower) {
                showTowerInfo(tile.tower);
                return;
            }

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

    if (sfx.enabled) sfx.resumeBackgroundMusic();
};

window.startGame = function(levelIndex) {
    window.startGameCallback(levelIndex);
};

window.showMenu = function() {
    document.getElementById('start-screen').style.display = 'flex';
    document.getElementById('ui-layer').style.display = 'none';
    document.getElementById('game-over-screen').style.display = 'none';
    document.getElementById('victory-screen').style.display = 'none';
    document.getElementById('pause-overlay').style.display = 'none';
    window.isPausedGlobal = false;
    sfx.stopBackgroundMusic();
};

window.restartLevel = function() {
    window.startGameCallback(gameState.levelIndex);
};

window.startWave = () => startWave(hideTowerInfo, scene, neuroCore, shake);

document.addEventListener('DOMContentLoaded', () => {
    sfx.init();
    initScene();
    updateUI();
    animate();
});
