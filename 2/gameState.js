// ========== GAME STATE MANAGEMENT ==========
import * as THREE from 'three';
import { DEFAULT_GAME_STATE } from './config.js';

export const entities = {
    towers: [],
    enemies: [],
    projectiles: [],
    particles: [],
    tiles: []
};

export const shake = { amount: 0 };

export let gameState = {
    ...DEFAULT_GAME_STATE,
    color: new THREE.Color(0.0, 1.0, 0.5)
};

export function resetGameState() {
    gameState = {
        ...DEFAULT_GAME_STATE,
        color: new THREE.Color(0.0, 1.0, 0.5)
    };
    entities.towers = [];
    entities.enemies = [];
    entities.projectiles = [];
    entities.particles = [];
    entities.tiles = [];
}

export let gameSpeed = 1.0;
export function setGameSpeed(speed) {
    gameSpeed = speed;
}

export let isPaused = false;
export function setPaused(paused) {
    isPaused = paused;
}

export let deleteMode = false;
export function setDeleteMode(mode) {
    deleteMode = mode;
}

export let selectedTower = null;
export let selectedTile = null;

export function setSelectedTower(tower) {
    selectedTower = tower;
    selectedTile = null;
}

export function setSelectedTile(tile) {
    selectedTile = tile;
    selectedTower = null;
}

export function clearSelection() {
    selectedTower = null;
    selectedTile = null;
}
