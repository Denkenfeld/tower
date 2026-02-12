// ========== 6 UNIQUE TOWER TYPES MODULE ==========

export const TOWER_TYPES = [
    // Type 0: PULSE SNIPER - Fast precise long-range
    {
        name: 'HACKER-0',
        displayName: 'Pulse Sniper',
        icon: '🎯',
        baseCost: 50,
        shape: 'sniper',
        description: 'Fast, precise, long-range single-target tower',
        upgrades: [
            { damage: 12, range: 22, rate: 0.35, color: 0x00ffff, cost: 0 },
            { damage: 28, range: 27, rate: 0.28, color: 0x00ddff, cost: 80 },
            { damage: 55, range: 32, rate: 0.22, color: 0x0088ff, cost: 150 }
        ],
        projectileSpeed: 60
    },

    // Type 1: SCATTER CANNON - Multiple projectiles
    {
        name: 'HACKER-1',
        displayName: 'Scatter Cannon',
        icon: '💥',
        baseCost: 100,
        shape: 'cannon',
        description: 'Fires 3-7 projectiles in a spread pattern',
        upgrades: [
            { damage: 18, range: 14, rate: 1.2, color: 0xffff00, cost: 0, scatter: 3, spread: 0.3 },
            { damage: 32, range: 17, rate: 1.0, color: 0xffcc00, cost: 180, scatter: 5, spread: 0.4 },
            { damage: 55, range: 20, rate: 0.85, color: 0xff8800, cost: 320, scatter: 7, spread: 0.5 }
        ],
        projectileSpeed: 35
    },

    // Type 2: PLASMA BOMBER - AOE explosions
    {
        name: 'HACKER-X',
        displayName: 'Plasma Bomber',
        icon: '💣',
        baseCost: 180,
        shape: 'sphere',
        description: 'Slow but devastating AOE explosions',
        upgrades: [
            { damage: 30, range: 13, rate: 2.2, color: 0xff00ff, cost: 0, aoe: 6 },
            { damage: 60, range: 16, rate: 1.8, color: 0xff00cc, cost: 240, aoe: 8 },
            { damage: 110, range: 19, rate: 1.5, color: 0xff0088, cost: 420, aoe: 11 }
        ],
        projectileSpeed: 18
    },

    // Type 3: LASER BEAM - Piercing beam
    {
        name: 'HACKER-L',
        displayName: 'Laser Beam',
        icon: '⚡',
        baseCost: 160,
        shape: 'laser',
        description: 'Continuous beam that pierces multiple enemies',
        upgrades: [
            { damage: 6, range: 26, rate: 0.08, color: 0xff0000, cost: 0, beam: true, pierce: 2 },
            { damage: 12, range: 32, rate: 0.06, color: 0xff3300, cost: 210, beam: true, pierce: 4 },
            { damage: 22, range: 38, rate: 0.05, color: 0xff6600, cost: 380, beam: true, pierce: 7 }
        ],
        projectileSpeed: 120
    },

    // Type 4: SLOW FIELD - Debuff tower
    {
        name: 'HACKER-S',
        displayName: 'Slow Field',
        icon: '❄️',
        baseCost: 140,
        shape: 'ring',
        description: 'Huge range debuff tower that slows enemies',
        upgrades: [
            { damage: 4, range: 22, rate: 0.5, color: 0x00ff88, cost: 0, slow: 0.5, slowDuration: 2.5 },
            { damage: 8, range: 28, rate: 0.4, color: 0x00ffaa, cost: 170, slow: 0.35, slowDuration: 3.5 },
            { damage: 14, range: 34, rate: 0.32, color: 0x00ffcc, cost: 300, slow: 0.22, slowDuration: 4.5 }
        ],
        projectileSpeed: 28
    },

    // Type 5: CHAIN LIGHTNING - Bounces between enemies
    {
        name: 'HACKER-C',
        displayName: 'Chain Lightning',
        icon: '⚡',
        baseCost: 220,
        shape: 'coil',
        description: 'Lightning that jumps between nearby enemies',
        upgrades: [
            { damage: 35, range: 17, rate: 2.0, color: 0xccff00, cost: 0, chain: 3, chainRange: 9 },
            { damage: 65, range: 21, rate: 1.6, color: 0xaaff00, cost: 270, chain: 5, chainRange: 11 },
            { damage: 115, range: 25, rate: 1.3, color: 0x88ff00, cost: 460, chain: 8, chainRange: 14 }
        ],
        projectileSpeed: 50
    }
];
