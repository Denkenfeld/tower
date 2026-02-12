// ========== GAME CONFIGURATION MODULE ==========

export const TILE_SIZE = 4;

export const DEFAULT_GAME_STATE = {
    money: 400,
    lives: 100,
    wave: 1,
    levelIndex: 0,
    selectedTowerType: 0,
    isGameOver: false,
    collapsedTiles: [],
    sandboxConfig: { customPath: [] },
    enemyCount: 5,
    enemyMix: { normal: 0.7, speed: 0.2, tank: 0.1 },
    difficultyScale: 1.0,
    bossInterval: 5,
    startingMoney: 450,
    color: null,
    towerRestrictions: [true, true, true, true, true, true],
    maxWaves: null
};

export const TILE_COSTS = {
    stack: 150,
    repair: 200
};
