// ========== GRID AND TILE MANAGEMENT ==========
import { Tile } from './TileClass.js';
import { TILE_SIZE } from './config.js';
import { LEVELS } from './levels.js';
import { entities, gameState } from './gameState.js';

export let tiles = [];

export function createGrid(scene) {
    tiles = [];
    entities.tiles = [];

    for (let x = -10; x <= 10; x += TILE_SIZE) {
        for (let z = -10; z <= 10; z += TILE_SIZE) {
            const tile = new Tile(x, z, scene);
            tiles.push(tile);
            entities.tiles.push(tile);
        }
    }
}

export function markPathTiles() {
    const level = LEVELS[gameState.levelIndex];
    const path = level.isSandbox && gameState.sandboxConfig.customPath.length > 0 
        ? gameState.sandboxConfig.customPath 
        : level.path;

    path.forEach(p => {
        const tile = getTileAt(p.x, p.z);
        if (tile) {
            tile.isPath = true;
            tile.baseMesh.material.color.setHex(0x004400);
            tile.baseMesh.material.emissive.setHex(0x00ff00);
            tile.baseMesh.material.emissiveIntensity = 0.2;
        }
    });
}

export function getTileAt(x, z) {
    return tiles.find(t => 
        Math.abs(t.x - x) < TILE_SIZE / 2 && 
        Math.abs(t.z - z) < TILE_SIZE / 2
    );
}

export function updateTiles(dt) {
    tiles.forEach(tile => tile.update(dt));
}

export function clearGrid(scene) {
    tiles.forEach(tile => {
        if (tile.mesh) scene.remove(tile.mesh);
    });
    tiles = [];
    entities.tiles = [];
}
