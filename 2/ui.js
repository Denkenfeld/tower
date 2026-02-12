// ========== UI FUNCTIONS AND CONTROLS ==========
import { TOWER_TYPES } from './towerTypes.js';
import { TILE_COSTS } from './config.js';
import { gameState, entities, setSelectedTower, setSelectedTile, selectedTower, selectedTile, setDeleteMode, deleteMode } from './gameState.js';
import { getTileAt } from './grid.js';
import { sfx } from './audio.js';

export function updateUI() {
    const moneyEl = document.getElementById('money-val');
    const livesEl = document.getElementById('lives-val');
    const waveEl = document.getElementById('wave-val');

    if (moneyEl) moneyEl.innerText = gameState.money;
    if (livesEl) livesEl.innerText = gameState.lives + '%';
    if (waveEl) waveEl.innerText = gameState.wave;

    // Update tower buttons affordability
    TOWER_TYPES.forEach((type, idx) => {
        const btn = document.querySelector(`[data-type="${idx}"]`);
        if (btn) {
            if (gameState.money < type.baseCost) {
                btn.classList.add('disabled');
            } else {
                btn.classList.remove('disabled');
            }
        }
    });

    // Update tile button
    const tileBtn = document.querySelector('[data-type="tile"]');
    if (tileBtn) {
        if (gameState.money < TILE_COSTS.stack) {
            tileBtn.classList.add('disabled');
        } else {
            tileBtn.classList.remove('disabled');
        }
    }
}

export function selectTower(type) {
    gameState.selectedTowerType = type;
    setDeleteMode(false);

    document.querySelectorAll('.tower-btn').forEach(btn => {
        btn.classList.remove('selected');
    });

    const selectedBtn = document.querySelector(`[data-type="${type}"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('selected');
    }
}

export function selectTileMode() {
    gameState.selectedTowerType = -1;
    setDeleteMode(false);

    document.querySelectorAll('.tower-btn').forEach(btn => {
        btn.classList.remove('selected');
    });

    const tileBtn = document.querySelector('[data-type="tile"]');
    if (tileBtn) {
        tileBtn.classList.add('selected');
    }
}

export function toggleDeleteMode() {
    setDeleteMode(!deleteMode);
    const btn = document.getElementById('delete-btn');
    if (btn) {
        if (deleteMode) {
            btn.classList.add('active');
            hideTowerInfo();
        } else {
            btn.classList.remove('active');
        }
    }
}

export function showTowerInfo(tower) {
    setSelectedTower(tower);
    const panel = document.getElementById('tower-info-panel');
    if (!panel) return;

    const typeData = TOWER_TYPES[tower.typeIndex];
    const currentUpgrade = typeData.upgrades[tower.level];

    document.getElementById('tower-info-name').innerText = typeData.displayName || typeData.name;
    document.getElementById('tower-info-level').innerText = `Level ${tower.level + 1}/${typeData.upgrades.length}`;
    document.getElementById('tower-info-damage').innerText = `Damage: ${currentUpgrade.damage}`;
    document.getElementById('tower-info-range').innerText = `Range: ${currentUpgrade.range}`;
    document.getElementById('tower-info-rate').innerText = `Fire Rate: ${currentUpgrade.rate}s`;

    const upgradeBtn = document.getElementById('upgrade-btn');
    if (tower.level < typeData.upgrades.length - 1) {
        const nextUpgrade = typeData.upgrades[tower.level + 1];
        upgradeBtn.innerText = `UPGRADE (${nextUpgrade.cost} CR)`;
        upgradeBtn.disabled = gameState.money < nextUpgrade.cost;
        upgradeBtn.style.display = 'block';
    } else {
        upgradeBtn.innerText = 'MAX LEVEL';
        upgradeBtn.disabled = true;
        upgradeBtn.style.display = 'block';
    }

    const sellValue = Math.floor(tower.getTotalCost() * 0.7);
    const sellBtn = document.querySelector('.sell-btn');
    if (sellBtn) {
        sellBtn.innerText = `SELL (${sellValue} CR)`;
        sellBtn.style.display = 'block';
    }

    const repairBtn = document.getElementById('repair-btn');
    if (repairBtn) repairBtn.style.display = 'none';

    panel.style.display = 'block';
}

export function showTileInfo(tile) {
    setSelectedTile(tile);
    const panel = document.getElementById('tower-info-panel');
    if (!panel) return;

    document.getElementById('tower-info-name').innerText = 'DESTROYED TILE';
    document.getElementById('tower-info-level').innerText = `Position: (${tile.x}, ${tile.z})`;
    document.getElementById('tower-info-damage').innerText = '';
    document.getElementById('tower-info-range').innerText = '';
    document.getElementById('tower-info-rate').innerText = '';

    const upgradeBtn = document.getElementById('upgrade-btn');
    if (upgradeBtn) upgradeBtn.style.display = 'none';

    const sellBtn = document.querySelector('.sell-btn');
    if (sellBtn) sellBtn.style.display = 'none';

    const repairBtn = document.getElementById('repair-btn');
    if (repairBtn) {
        repairBtn.style.display = 'block';
        repairBtn.disabled = gameState.money < TILE_COSTS.repair;
    }

    panel.style.display = 'block';
}

export function hideTowerInfo() {
    setSelectedTower(null);
    setSelectedTile(null);
    const panel = document.getElementById('tower-info-panel');
    if (panel) panel.style.display = 'none';
}

export function showMessage(text) {
    const msgEl = document.getElementById('msg-area');
    if (msgEl) {
        msgEl.innerText = text;
        msgEl.style.opacity = 1;
        setTimeout(() => {
            msgEl.style.opacity = 0;
        }, 2000);
    }
}

// Window-exposed functions for onclick handlers
window.selectTower = selectTower;
window.selectTileMode = selectTileMode;
window.toggleDeleteMode = toggleDeleteMode;

window.upgradeTower = function() {
    if (!selectedTower) return;
    if (selectedTower.upgrade()) {
        showTowerInfo(selectedTower);
        updateUI();
    }
};

window.sellTower = function() {
    if (!selectedTower) return;
    const refund = Math.floor(selectedTower.getTotalCost() * 0.7);
    gameState.money += refund;

    const tile = getTileAt(selectedTower.mesh.position.x, selectedTower.mesh.position.z);
    if (tile) tile.tower = null;

    // Will be removed by scene reference
    const idx = entities.towers.indexOf(selectedTower);
    if (idx !== -1) entities.towers.splice(idx, 1);

    hideTowerInfo();
    updateUI();
    sfx.playError();
};

window.repairTile = function() {
    if (!selectedTile) return;
    if (gameState.money < TILE_COSTS.repair) {
        showMessage("NOT ENOUGH CREDITS!");
        sfx.playError();
        return;
    }

    gameState.money -= TILE_COSTS.repair;
    selectedTile.repair();
    hideTowerInfo();
    updateUI();
};

window.togglePause = function() {
    const paused = !window.isPausedGlobal;
    window.isPausedGlobal = paused;

    const overlay = document.getElementById('pause-overlay');
    if (overlay) {
        overlay.style.display = paused ? 'flex' : 'none';
    }

    if (paused) {
        sfx.pauseBackgroundMusic();
    } else {
        if (sfx.enabled) sfx.resumeBackgroundMusic();
    }
};

window.startGame = function(levelIndex) {
    // Will be handled by main.js
    if (window.startGameCallback) {
        window.startGameCallback(levelIndex);
    }
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
    if (window.startGameCallback) {
        window.startGameCallback(gameState.levelIndex);
    }
};

window.updateLighting = function(type, value) {
    if (window.updateLightingCallback) {
        window.updateLightingCallback(type, value);
    }
};

window.updateGameSpeed = function(value) {
    if (window.updateGameSpeedCallback) {
        window.updateGameSpeedCallback(value);
    }
};
