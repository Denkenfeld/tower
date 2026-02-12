// ========== TOWER TYPE DEFINITIONS (6 UNIQUE TOWERS) ==========

export const TOWER_TYPES = [
    // 0: SNIPER - Long range, high damage, single target
    {
        name: 'SNIPER',
        displayName: 'Sniper Tower',
        shape: 'sniper',
        baseCost: 50,
        projectileSpeed: 25,
        upgrades: [
            { cost: 0, damage: 15, range: 18, rate: 1.2, color: 0xff0000 },
            { cost: 50, damage: 30, range: 22, rate: 1.0, color: 0xff3333 },
            { cost: 100, damage: 60, range: 28, rate: 0.8, color: 0xff6666 }
        ]
    },

    // 1: SCATTER - Multiple projectiles
    {
        name: 'SCATTER',
        displayName: 'Scatter Cannon',
        shape: 'cannon',
        baseCost: 100,
        projectileSpeed: 18,
        upgrades: [
            { cost: 0, damage: 8, range: 12, rate: 1.5, color: 0xff8800, scatter: 3, spread: 0.3 },
            { cost: 80, damage: 12, range: 14, rate: 1.3, color: 0xffaa00, scatter: 5, spread: 0.4 },
            { cost: 150, damage: 18, range: 16, rate: 1.1, color: 0xffcc00, scatter: 7, spread: 0.5 }
        ]
    },

    // 2: BOMBER - AOE damage
    {
        name: 'BOMBER',
        displayName: 'Bomber',
        shape: 'sphere',
        baseCost: 180,
        projectileSpeed: 12,
        upgrades: [
            { cost: 0, damage: 20, range: 14, rate: 2.0, color: 0x00ff00, aoe: 4, explosionRadius: 3 },
            { cost: 120, damage: 35, range: 16, rate: 1.8, color: 0x33ff33, aoe: 6, explosionRadius: 4 },
            { cost: 200, damage: 55, range: 18, rate: 1.5, color: 0x66ff66, aoe: 8, explosionRadius: 5 }
        ]
    },

    // 3: LASER - Piercing beam
    {
        name: 'LASER',
        displayName: 'Laser Tower',
        shape: 'laser',
        baseCost: 160,
        projectileSpeed: 30,
        upgrades: [
            { cost: 0, damage: 12, range: 16, rate: 0.8, color: 0x00ffff, beam: true, pierce: 2 },
            { cost: 100, damage: 22, range: 20, rate: 0.7, color: 0x33ffff, beam: true, pierce: 4 },
            { cost: 180, damage: 38, range: 24, rate: 0.6, color: 0x66ffff, beam: true, pierce: 7 }
        ]
    },

    // 4: SLOW - Debuff tower
    {
        name: 'SLOW',
        displayName: 'Cryo Field',
        shape: 'ring',
        baseCost: 140,
        projectileSpeed: 20,
        upgrades: [
            { cost: 0, damage: 5, range: 10, rate: 1.0, color: 0x0088ff, slow: 0.5, slowDuration: 2 },
            { cost: 90, damage: 8, range: 13, rate: 0.9, color: 0x33aaff, slow: 0.35, slowDuration: 3 },
            { cost: 160, damage: 12, range: 16, rate: 0.8, color: 0x66ccff, slow: 0.22, slowDuration: 4 }
        ]
    },

    // 5: CHAIN - Chain lightning
    {
        name: 'CHAIN',
        displayName: 'Tesla Coil',
        shape: 'coil',
        baseCost: 220,
        projectileSpeed: 22,
        upgrades: [
            { cost: 0, damage: 18, range: 14, rate: 1.5, color: 0xff00ff, chain: 3, chainRange: 6 },
            { cost: 140, damage: 30, range: 16, rate: 1.3, color: 0xff33ff, chain: 5, chainRange: 8 },
            { cost: 240, damage: 50, range: 18, rate: 1.1, color: 0xff66ff, chain: 8, chainRange: 10 }
        ]
    }
];
