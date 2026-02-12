// ========== LEVELS MODULE ==========
import * as THREE from 'three';

const LEVELS = [
            { color: new THREE.Color(0.0, 1.0, 1.0), path: [{x:-8,z:-8}, {x:-8,z:-2}, {x:0,z:-2}, {x:0,z:2}, {x:8,z:2}, {x:8,z:8}] },
            { color: new THREE.Color(1.0, 0.0, 1.0), path: [{x:-10,z:-10}, {x:10,z:-10}, {x:10,z:10}, {x:-5,z:10}, {x:-5,z:-5}, {x:5,z:-5}, {x:5,z:5}, {x:0,z:5}] },
            { color: new THREE.Color(1.0, 1.0, 0.0), path: [{x:-8,z:8}, {x:-4,z:8}, {x:-4,z:-8}, {x:0,z:-8}, {x:0,z:8}, {x:4,z:8}, {x:4,z:-8}, {x:8,z:-8}, {x:8,z:8}] },
            { color: new THREE.Color(1.0, 0.5, 0.0), path: [{x:-10,z:-8}, {x:-2,z:-8}, {x:-2,z:0}, {x:8,z:0}, {x:8,z:8}], isBalloonLevel: true },
            { isSandbox: true, color: new THREE.Color(0.0, 1.0, 0.5), path: [] }
        ];

export { LEVELS };
