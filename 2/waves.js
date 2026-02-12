// ========== WAVE SYSTEM WITH TILE DAMAGE ==========
import { Enemy } from './EnemyClass.js';
import { LEVELS } from './levels.js';
import { entities, gameState } from './gameState.js';
import { tiles } from './grid.js';
import { sfx } from './audio.js';
import { updateUI, showMessage } from './ui.js';

export let waveInProgress = false;
export let waveSpawnTimer = 0;
export let enemiesSpawnedThisWave = 0;
export let totalEnemiesToSpawn = 0;

export function startWave(hideTowerInfo, scene, neuroCore, shake) {
    if (waveInProgress) return;

    waveInProgress = true;
    const level = LEVELS[gameState.levelIndex];
    const cfg = level.isSandbox ? gameState.sandboxConfig : null;

    const baseCount = cfg ? cfg.enemyCount : (5 + gameState.wave * 2);
    totalEnemiesToSpawn = baseCount;
    enemiesSpawnedThisWave = 0;
    waveSpawnTimer = 0;

    hideTowerInfo();
    const buildMenu = document.getElementById('build-menu');
    if (buildMenu) buildMenu.style.display = 'none';
}

export function spawnEnemy(scene, neuroCore, shake, gameSpeed) {
    if (enemiesSpawnedThisWave >= totalEnemiesToSpawn) return;

    const level = LEVELS[gameState.levelIndex];
    const cfg = level.isSandbox ? gameState.sandboxConfig : null;
    const mix = cfg ? cfg.enemyMix : { normal: 0.7, speed: 0.2, tank: 0.1 };

    let type = 'NORMAL';
    const rand = Math.random();

    if (gameState.wave % (cfg ? cfg.bossInterval : 5) === 0 && 
        enemiesSpawnedThisWave === totalEnemiesToSpawn - 1) {
        type = 'BOSS';
    } else if (rand < mix.speed) {
        type = 'SPEED';
    } else if (rand < mix.speed + mix.tank) {
        type = 'TANK';
    }

    const enemy = new Enemy(type, false, 3, scene, neuroCore, shake, gameState, gameSpeed);
    entities.enemies.push(enemy);
    enemiesSpawnedThisWave++;
}

export function checkWaveComplete(scene) {
    if (!waveInProgress) return;
    if (enemiesSpawnedThisWave < totalEnemiesToSpawn) return;
    if (entities.enemies.length > 0) return;

    // Wave complete!
    waveInProgress = false;
    gameState.wave++;

    const reward = 50 + gameState.wave * 10;
    gameState.money += reward;

    // ====== TILE DAMAGE SYSTEM (NEW!) ======
    // Random tile with tower loses 1 stack level
    const tilesWithTowers = tiles.filter(t => t.tower && !t.isPath && !t.isCollapsed);

    if (tilesWithTowers.length > 0) {
        const randomTile = tilesWithTowers[Math.floor(Math.random() * tilesWithTowers.length)];
        const destroyed = randomTile.damageStack();

        if (destroyed) {
            // Tile completely destroyed
            showMessage(`⚠️ TILE DESTROYED AT (${randomTile.x}, ${randomTile.z})!`);

            // Remove tower
            if (randomTile.tower) {
                scene.remove(randomTile.tower.mesh);
                const idx = entities.towers.indexOf(randomTile.tower);
                if (idx !== -1) entities.towers.splice(idx, 1);
                randomTile.tower = null;
            }
        } else {
            // Tile lost 1 stack level
            showMessage(`⚠️ TILE DAMAGED AT (${randomTile.x}, ${randomTile.z})! Stack reduced.`);
        }

        sfx.playCollapse();
    }

    showMessage(`✅ WAVE ${gameState.wave - 1} COMPLETE! +${reward} CR`);
    updateUI();

    // Check victory condition
    const cfg = LEVELS[gameState.levelIndex].isSandbox ? gameState.sandboxConfig : null;
    if (cfg && cfg.maxWaves && gameState.wave > cfg.maxWaves) {
        victoryGame();
        return;
    }

    // Re-enable build menu after delay
    setTimeout(() => {
        const buildMenu = document.getElementById('build-menu');
        if (buildMenu) buildMenu.style.display = 'flex';
    }, 2000);
}

export function updateWaveSpawning(dt, scene, neuroCore, shake, gameSpeed) {
    if (!waveInProgress) return;

    waveSpawnTimer += dt;
    if (waveSpawnTimer >= 1.5 && enemiesSpawnedThisWave < totalEnemiesToSpawn) {
        spawnEnemy(scene, neuroCore, shake, gameSpeed);
        waveSpawnTimer = 0;
    }
}

function victoryGame() {
    gameState.isGameOver = true;
    const victoryScreen = document.getElementById('victory-screen');
    if (victoryScreen) {
        victoryScreen.style.display = 'flex';
        const msg = document.getElementById('victory-msg');
        if (msg) msg.innerText = `Completed in ${gameState.wave} waves!`;
    }
    sfx.stopBackgroundMusic();
}
