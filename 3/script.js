import * as THREE from 'three';
        import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

        // AUDIO ENGINE (Unverändert)
        class SfxEngine {
            constructor() {
                this.ctx = null;
                this.masterGain = null;
                this.initialized = false;
                this.enabled = true;
                this.masterVolume = 0.3;
                this.bgMusic = null;
            }

            init() {
                if (this.initialized) return;
                try {
                    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
                    this.masterGain = this.ctx.createGain();
                    this.masterGain.gain.value = this.masterVolume;
                    this.masterGain.connect(this.ctx.destination);
                    this.initialized = true;
                    if (this.ctx.state === 'suspended') this.ctx.resume();
                } catch(e) {}
            }

            playSonicWave() {
                if (!this.ctx || !this.initialized || !this.enabled) return;
                try {
                    const now = this.ctx.currentTime;
                    const gainNode = this.ctx.createGain();
                    gainNode.connect(this.masterGain);
                    const osc = this.ctx.createOscillator();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(100, now);
                    osc.frequency.linearRampToValueAtTime(50, now + 0.1); // Kürzer
                    const lfo = this.ctx.createOscillator();
                    lfo.frequency.setValueAtTime(8, now);
                    const lfoGain = this.ctx.createGain();
                    lfoGain.gain.setValueAtTime(20, now);
                    lfo.connect(lfoGain);
                    lfoGain.connect(osc.frequency);
                    osc.connect(gainNode);
                    gainNode.gain.setValueAtTime(0.1, now); // Leiser
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                    osc.start(now);
                    lfo.start(now);
                    osc.stop(now + 0.1);
                    lfo.stop(now + 0.1);
                } catch(e) {}
            }

            playTremoloWave() {
                if (!this.ctx || !this.initialized || !this.enabled) return;
                try {
                    const now = this.ctx.currentTime;
                    const gainNode = this.ctx.createGain();
                    gainNode.connect(this.masterGain);
                    const osc = this.ctx.createOscillator();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(150, now);
                    osc.connect(gainNode);
                    const lfo = this.ctx.createOscillator();
                    lfo.frequency.setValueAtTime(15, now);
                    const lfoGain = this.ctx.createGain();
                    lfoGain.gain.setValueAtTime(0.15, now);
                    lfo.connect(lfoGain);
                    lfoGain.connect(gainNode.gain);
                    gainNode.gain.setValueAtTime(0.1, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                    osc.start(now);
                    lfo.start(now);
                    osc.stop(now + 0.15);
                    lfo.stop(now + 0.15);
                } catch(e) {}
            }

            playUnderwaterEcho() {
                if (!this.ctx || !this.initialized || !this.enabled) return;
                try {
                    const now = this.ctx.currentTime;
                    const gainNode = this.ctx.createGain();
                    gainNode.connect(this.masterGain);
                    const osc = this.ctx.createOscillator();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(120, now);
                    osc.frequency.linearRampToValueAtTime(90, now + 0.1);
                    const filter = this.ctx.createBiquadFilter();
                    filter.type = 'lowpass';
                    filter.frequency.setValueAtTime(800, now);
                    filter.Q.setValueAtTime(5, now);
                    const lfo = this.ctx.createOscillator();
                    lfo.frequency.setValueAtTime(4, now);
                    const lfoGain = this.ctx.createGain();
                    lfoGain.gain.setValueAtTime(200, now);
                    lfo.connect(lfoGain);
                    lfoGain.connect(filter.frequency);
                    osc.connect(filter);
                    filter.connect(gainNode);
                    gainNode.gain.setValueAtTime(0.1, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                    osc.start(now);
                    lfo.start(now);
                    osc.stop(now + 0.1);
                    lfo.stop(now + 0.1);
                } catch(e) {}
            }

            playBuild() {
                if (!this.ctx || !this.initialized || !this.enabled) return;
                try {
                    const now = this.ctx.currentTime;
                    const gainNode = this.ctx.createGain();
                    gainNode.connect(this.masterGain);
                    const osc = this.ctx.createOscillator();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(60, now);
                    osc.frequency.linearRampToValueAtTime(30, now + 0.4);
                    const lfo = this.ctx.createOscillator();
                    lfo.frequency.setValueAtTime(3, now);
                    const lfoGain = this.ctx.createGain();
                    lfoGain.gain.setValueAtTime(15, now);
                    lfo.connect(lfoGain);
                    lfoGain.connect(osc.frequency);
                    osc.connect(gainNode);
                    gainNode.gain.setValueAtTime(0.3, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
                    osc.start(now);
                    lfo.start(now);
                    osc.stop(now + 0.4);
                    lfo.stop(now + 0.4);
                } catch(e) {}
            }

            playUpgrade() {
                if (!this.ctx || !this.initialized || !this.enabled) return;
                try {
                    const now = this.ctx.currentTime;
                    const gainNode = this.ctx.createGain();
                    gainNode.connect(this.masterGain);
                    const osc = this.ctx.createOscillator();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(80, now);
                    osc.frequency.exponentialRampToValueAtTime(300, now + 0.7);
                    const lfo = this.ctx.createOscillator();
                    lfo.frequency.setValueAtTime(6, now);
                    const lfoGain = this.ctx.createGain();
                    lfoGain.gain.setValueAtTime(25, now);
                    lfo.connect(lfoGain);
                    lfoGain.connect(osc.frequency);
                    osc.connect(gainNode);
                    gainNode.gain.setValueAtTime(0.1, now);
                    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.5);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.7);
                    osc.start(now);
                    lfo.start(now);
                    osc.stop(now + 0.7);
                    lfo.stop(now + 0.7);
                } catch(e) {}
            }

            playError() {
                if (!this.ctx || !this.initialized || !this.enabled) return;
                try {
                    const now = this.ctx.currentTime;
                    const gainNode = this.ctx.createGain();
                    gainNode.connect(this.masterGain);
                    const osc = this.ctx.createOscillator();
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(80, now);
                    const filter = this.ctx.createBiquadFilter();
                    filter.type = 'lowpass';
                    filter.frequency.setValueAtTime(200, now);
                    filter.Q.setValueAtTime(10, now);
                    const lfo = this.ctx.createOscillator();
                    lfo.frequency.setValueAtTime(6, now);
                    const lfoGain = this.ctx.createGain();
                    lfoGain.gain.setValueAtTime(800, now);
                    lfo.connect(lfoGain);
                    lfoGain.connect(filter.frequency);
                    osc.connect(filter);
                    filter.connect(gainNode);
                    gainNode.gain.setValueAtTime(0.3, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
                    osc.start(now);
                    lfo.start(now);
                    osc.stop(now + 0.4);
                    lfo.stop(now + 0.4);
                } catch(e) {}
            }

            playResonantRing() {
                if (!this.ctx || !this.initialized || !this.enabled) return;
                try {
                    const now = this.ctx.currentTime;
                    const gainNode = this.ctx.createGain();
                    gainNode.connect(this.masterGain);
                    const osc = this.ctx.createOscillator();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(400, now);
                    osc.frequency.exponentialRampToValueAtTime(200, now + 0.5);
                    const filter = this.ctx.createBiquadFilter();
                    filter.type = 'bandpass';
                    filter.frequency.setValueAtTime(400, now);
                    filter.Q.setValueAtTime(20, now);
                    const lfo = this.ctx.createOscillator();
                    lfo.frequency.setValueAtTime(7, now);
                    const lfoGain = this.ctx.createGain();
                    lfoGain.gain.setValueAtTime(100, now);
                    lfo.connect(lfoGain);
                    lfoGain.connect(filter.frequency);
                    osc.connect(filter);
                    filter.connect(gainNode);
                    gainNode.gain.setValueAtTime(0.1, now); // Leiser für viele Ballons
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
                    osc.start(now);
                    lfo.start(now);
                    osc.stop(now + 0.5);
                    lfo.stop(now + 0.5);
                } catch(e) {}
            }

            playCoreHit() {
                if (!this.ctx || !this.initialized || !this.enabled) return;
                try {
                    const now = this.ctx.currentTime;
                    const gainNode = this.ctx.createGain();
                    gainNode.connect(this.masterGain);
                    const osc1 = this.ctx.createOscillator();
                    const osc2 = this.ctx.createOscillator();
                    osc1.type = 'sine';
                    osc2.type = 'sine';
                    osc1.frequency.setValueAtTime(150, now);
                    osc2.frequency.setValueAtTime(150.5, now);
                    const lfo = this.ctx.createOscillator();
                    lfo.frequency.setValueAtTime(0.5, now);
                    const lfoGain = this.ctx.createGain();
                    lfoGain.gain.setValueAtTime(5, now);
                    lfo.connect(lfoGain);
                    lfoGain.connect(osc2.frequency);
                    osc1.connect(gainNode);
                    osc2.connect(gainNode);
                    gainNode.gain.setValueAtTime(0.3, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
                    osc1.start(now);
                    osc2.start(now);
                    lfo.start(now);
                    osc1.stop(now + 0.6);
                    osc2.stop(now + 0.6);
                    lfo.stop(now + 0.6);
                } catch(e) {}
            }

            playCoreDestroy() {
                if (!this.ctx || !this.initialized || !this.enabled) return;
                try {
                    const now = this.ctx.currentTime;
                    const gainNode = this.ctx.createGain();
                    gainNode.connect(this.masterGain);
                    const osc = this.ctx.createOscillator();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(400, now);
                    osc.frequency.exponentialRampToValueAtTime(100, now + 1.5);
                    const filter = this.ctx.createBiquadFilter();
                    filter.type = 'bandpass';
                    filter.frequency.setValueAtTime(400, now);
                    filter.Q.setValueAtTime(20, now);
                    const lfo = this.ctx.createOscillator();
                    lfo.frequency.setValueAtTime(7, now);
                    const lfoGain = this.ctx.createGain();
                    lfoGain.gain.setValueAtTime(100, now);
                    lfo.connect(lfoGain);
                    lfoGain.connect(filter.frequency);
                    osc.connect(filter);
                    filter.connect(gainNode);
                    gainNode.gain.setValueAtTime(0.4, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
                    osc.start(now);
                    lfo.start(now);
                    osc.stop(now + 1.5);
                    lfo.stop(now + 1.5);
                } catch(e) {}
            }

            playPhase() {
                if (!this.ctx || !this.initialized || !this.enabled) return;
                try {
                    const now = this.ctx.currentTime;
                    const gainNode = this.ctx.createGain();
                    gainNode.connect(this.masterGain);
                    const osc1 = this.ctx.createOscillator();
                    const osc2 = this.ctx.createOscillator();
                    osc1.type = 'sine';
                    osc2.type = 'sine';
                    osc1.frequency.setValueAtTime(200, now);
                    osc2.frequency.setValueAtTime(200.8, now);
                    osc1.connect(gainNode);
                    osc2.connect(gainNode);
                    gainNode.gain.setValueAtTime(0.2, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                    osc1.start(now);
                    osc2.start(now);
                    osc1.stop(now + 0.3);
                    osc2.stop(now + 0.3);
                } catch(e) {}
            }

            playHeal() {
                if (!this.ctx || !this.initialized || !this.enabled) return;
                try {
                    const now = this.ctx.currentTime;
                    const gainNode = this.ctx.createGain();
                    gainNode.connect(this.masterGain);
                    const fundamentalFreq = 200;
                    const harmonics = [1, 1.5, 2];
                    harmonics.forEach((harmonic, i) => {
                        const osc = this.ctx.createOscillator();
                        osc.type = 'sine';
                        osc.frequency.setValueAtTime(fundamentalFreq * harmonic, now);
                        const oscGain = this.ctx.createGain();
                        oscGain.gain.setValueAtTime(0.3 / harmonic, now);
                        osc.connect(oscGain);
                        oscGain.connect(gainNode);
                        osc.start(now);
                        osc.stop(now + 0.5);
                    });
                    gainNode.gain.setValueAtTime(0.25, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
                } catch(e) {}
            }

            playCollapse() {
                if (!this.ctx || !this.initialized || !this.enabled) return;
                try {
                    const now = this.ctx.currentTime;
                    const gainNode = this.ctx.createGain();
                    gainNode.connect(this.masterGain);
                    const osc = this.ctx.createOscillator();
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(200, now);
                    osc.frequency.exponentialRampToValueAtTime(40, now + 1.0);
                    osc.connect(gainNode);
                    gainNode.gain.setValueAtTime(0.3, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.0);
                    osc.start(now);
                    osc.stop(now + 1.0);
                } catch(e) {}
            }

            playBackgroundMusic() {
                if (!this.enabled) return;
                if (!this.bgMusic) {
                    this.bgMusic = new Audio('tower.mp3');
                    this.bgMusic.loop = true;
                    this.bgMusic.volume = 0.3;
                }
                this.bgMusic.play().catch(e => console.log("🎵 Hintergrundmusik: Autoplay blockiert oder Datei nicht gefunden"));
            }

            stopBackgroundMusic() {
                if (this.bgMusic) {
                    this.bgMusic.pause();
                    this.bgMusic.currentTime = 0;
                }
            }

            pauseBackgroundMusic() {
                if (this.bgMusic) {
                    this.bgMusic.pause();
                }
            }

            resumeBackgroundMusic() {
                if (this.bgMusic && this.enabled) {
                    this.bgMusic.play().catch(e => {});
                }
            }
        }
        
        const sfx = new SfxEngine();

        window.toggleSound = function() {
            sfx.enabled = !sfx.enabled;
            const btn = document.getElementById('sound-toggle');
            if (sfx.enabled) {
                btn.classList.add('active');
                btn.innerText = '🔊 SOUND: ON';
                if (!isPaused && !gameState.isGameOver) {
                    sfx.resumeBackgroundMusic();
                }
            } else {
                btn.classList.remove('active');
                btn.innerText = '🔇 SOUND: OFF';
                sfx.pauseBackgroundMusic();
            }
        }

        function createCharTexture(char, color) {
            const canvas = document.createElement('canvas');
            canvas.width = 64; canvas.height = 64;
            const ctx = canvas.getContext('2d');
            ctx.font = 'bold 48px Courier New';
            ctx.fillStyle = color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(char, 32, 32);
            const tex = new THREE.CanvasTexture(canvas);
            tex.needsUpdate = true;
            return tex;
        }

        let texZero, texOne, texHex;
        const TILE_SIZE = 4;
        let scene, camera, renderer, controls, raycaster, mouse;
        let ambientLight, directionalLight;
        let isPaused = false;
        let deleteMode = false;
        let selectedTower = null;
        let selectedTile = null;
        let neuroCore = null;
        let portalGateway = null;
        let gameSpeed = 1.0;
        let matrixSkyDome = null;
        
        let gameState = {
            money: 400,
            lives: 20,
            wave: 1,
            levelIndex: 0,
            selectedTowerType: 0,
            isGameOver: false,
            collapsedTiles: [],
            sandboxConfig: {
                customPath: [],
                enemyCount: 5,
                enemyMix: { normal: 0.7, speed: 0.2, tank: 0.1 },
                difficultyScale: 1.0,
                bossInterval: 5,
                startingMoney: 450,
                color: new THREE.Color(0.0, 1.0, 0.5),
                towerRestrictions: [true, true, true],
                maxWaves: null
            }
        };

        let sandboxPath = [];
        let pathGrid = [];

        window.loadPreset = function(presetName) {
            const presets = {
                snake: [{x:-8,z:-8}, {x:-8,z:-2}, {x:0,z:-2}, {x:0,z:2}, {x:8,z:2}, {x:8,z:8}],
                spiral: [{x:-10,z:-10}, {x:10,z:-10}, {x:10,z:10}, {x:-5,z:10}, {x:-5,z:-5}, {x:5,z:-5}, {x:5,z:5}, {x:0,z:5}],
                zigzag: [{x:-8,z:8}, {x:-4,z:8}, {x:-4,z:-8}, {x:0,z:-8}, {x:0,z:8}, {x:4,z:8}, {x:4,z:-8}, {x:8,z:-8}, {x:8,z:8}],
                maze: [{x:-10,z:-8}, {x:-2,z:-8}, {x:-2,z:0}, {x:8,z:0}, {x:8,z:8}],
                straight: [{x:-10,z:0}, {x:10,z:0}]
            };
            sandboxPath = presets[presetName] || [];
            renderPathGrid();
        }

        window.clearPath = function() {
            sandboxPath = [];
            renderPathGrid();
        }

        function initPathGrid() {
            const grid = document.getElementById('path-grid');
            grid.innerHTML = '';
            pathGrid = [];
            
            for (let z = 8; z >= -8; z--) {
                for (let x = -8; x <= 8; x++) {
                    const cell = document.createElement('div');
                    cell.className = 'path-cell';
                    cell.dataset.x = x;
                    cell.dataset.z = z;
                    cell.onclick = function() {
                        const cx = parseInt(this.dataset.x);
                        const cz = parseInt(this.dataset.z);
                        togglePathCell(cx, cz);
                    };
                    grid.appendChild(cell);
                    pathGrid.push({x, z, element: cell});
                }
            }
            renderPathGrid();
        }

        function togglePathCell(x, z) {
            const index = sandboxPath.findIndex(p => p.x === x && p.z === z);
            if (index === -1) {
                sandboxPath.push({x, z});
            } else {
                sandboxPath.splice(index, 1);
            }
            renderPathGrid();
        }

        function renderPathGrid() {
            pathGrid.forEach(cell => {
                const hasPath = sandboxPath.some(p => p.x === cell.x && p.z === cell.z);
                const isStart = sandboxPath.length > 0 && sandboxPath[0].x === cell.x && sandboxPath[0].z === cell.z;
                const isEnd = sandboxPath.length > 0 && sandboxPath[sandboxPath.length - 1].x === cell.x && sandboxPath[sandboxPath.length - 1].z === cell.z;
                
                cell.element.className = 'path-cell';
                if (isStart) cell.element.classList.add('start');
                else if (isEnd) cell.element.classList.add('end');
                else if (hasPath) cell.element.classList.add('path');
            });
            document.getElementById('path-length').innerText = sandboxPath.length;
        }

        window.openSandbox = function() {
            document.getElementById('start-screen').style.display = 'none';
            document.getElementById('sandbox-setup-screen').style.display = 'flex';
            initPathGrid();
            updateSandboxUI();
        }

        window.closeSandbox = function() {
            document.getElementById('sandbox-setup-screen').style.display = 'none';
            document.getElementById('start-screen').style.display = 'flex';
        }

        function updateSandboxUI() {
            document.getElementById('sandbox-difficulty').oninput = function() {
                const val = (this.value / 100).toFixed(1);
                document.getElementById('sandbox-difficulty-val').innerText = val + 'x';
            };
            document.getElementById('sandbox-normal').oninput = function() {
                document.getElementById('sandbox-normal-val').innerText = this.value + '%';
            };
            document.getElementById('sandbox-speed').oninput = function() {
                document.getElementById('sandbox-speed-val').innerText = this.value + '%';
            };
            document.getElementById('sandbox-tank').oninput = function() {
                document.getElementById('sandbox-tank-val').innerText = this.value + '%';
            };
            document.getElementById('sandbox-hue').oninput = function() {
                const hue = this.value;
                document.getElementById('sandbox-color-preview').style.background = `hsl(${hue}, 100%, 50%)`;
            };
            document.getElementById('sandbox-color-preview').style.background = 'hsl(120, 100%, 50%)';
        }

        window.startSandboxGame = function() {
            if (sandboxPath.length < 2) {
                alert('Path needs at least 2 points (start and end)!');
                return;
            }
            gameState.sandboxConfig = {
                startingMoney: parseInt(document.getElementById('sandbox-money').value),
                difficultyScale: parseFloat(document.getElementById('sandbox-difficulty').value) / 100,
                enemyCount: parseInt(document.getElementById('sandbox-enemy-count').value),
                bossInterval: parseInt(document.getElementById('sandbox-boss-interval').value),
                maxWaves: parseInt(document.getElementById('sandbox-max-waves').value) || null,
                enemyMix: {
                    normal: parseFloat(document.getElementById('sandbox-normal').value) / 100,
                    speed: parseFloat(document.getElementById('sandbox-speed').value) / 100,
                    tank: parseFloat(document.getElementById('sandbox-tank').value) / 100
                },
                hue: parseInt(document.getElementById('sandbox-hue').value),
                color: new THREE.Color().setHSL(
                    parseInt(document.getElementById('sandbox-hue').value) / 360, 1.0, 0.5
                ),
                customPath: JSON.parse(JSON.stringify(sandboxPath)),
                towerRestrictions: [true, true, true]
            };
            startGame(6); // 6 is now sandbox index (maps 0-5 are levels)
        }

        // --- NEW TOWER STATS (ACTION MODE) ---
        // Hacker-0: 5x Speed (0.12s), 1/5 Dmg (2)
        // Hacker-1: 10x Speed (0.2s), 1/10 Dmg (5) - Original was 2.0s
        // Hacker-X: 20x Speed (0.075s), 1/20 Dmg (1) - Original was 1.5s
        const TOWER_TYPES = [
            { 
                name: "HACKER-0", baseCost: 50, 
                upgrades: [
                    { damage: 2, range: 15, rate: 0.12, color: 0x00ffff, cost: 0 },
                    { damage: 4, range: 18, rate: 0.1, color: 0x00ddff, cost: 80 },
                    { damage: 7, range: 20, rate: 0.08, color: 0x0088ff, cost: 150 }
                ],
                projectileSpeed: 50
            },
            { 
                name: "HACKER-1", baseCost: 120,
                upgrades: [
                    { damage: 5, range: 30, rate: 0.2, color: 0xffff00, cost: 0 },
                    { damage: 10, range: 40, rate: 0.15, color: 0xffcc00, cost: 200 },
                    { damage: 20, range: 50, rate: 0.12, color: 0xff8800, cost: 350 }
                ],
                projectileSpeed: 80
            },
            { 
                name: "HACKER-X", baseCost: 200,
                upgrades: [
                    { damage: 1, range: 12, rate: 0.075, color: 0xff00ff, cost: 0, aoe: 8 },
                    { damage: 2, range: 15, rate: 0.06, color: 0xff00cc, cost: 250 },
                    { damage: 3.5, range: 18, rate: 0.05, color: 0xff0088, cost: 400, aoe: 12 }
                ],
                projectileSpeed: 30
            }
        ];

        const LEVELS = [
            { color: new THREE.Color(0.0, 1.0, 1.0), path: [{x:-8,z:-8}, {x:-8,z:-2}, {x:0,z:-2}, {x:0,z:2}, {x:8,z:2}, {x:8,z:8}] },
            { color: new THREE.Color(1.0, 0.0, 1.0), path: [{x:-10,z:-10}, {x:10,z:-10}, {x:10,z:10}, {x:-5,z:10}, {x:-5,z:-5}, {x:5,z:-5}, {x:5,z:5}, {x:0,z:5}] },
            { color: new THREE.Color(1.0, 1.0, 0.0), path: [{x:-8,z:8}, {x:-4,z:8}, {x:-4,z:-8}, {x:0,z:-8}, {x:0,z:8}, {x:4,z:8}, {x:4,z:-8}, {x:8,z:-8}, {x:8,z:8}] },
            // Level 4: Balloons I
            { color: new THREE.Color(1.0, 0.5, 0.0), path: [{x:-10,z:-8}, {x:-2,z:-8}, {x:-2,z:0}, {x:8,z:0}, {x:8,z:8}], isBalloonLevel: true },
            // Level 5: Balloons II (Figure 8ish)
            { color: new THREE.Color(0.2, 0.2, 1.0), path: [{x:-8,z:-8}, {x:8,z:-8}, {x:8,z:-2}, {x:-8,z:-2}, {x:-8,z:2}, {x:8,z:2}, {x:8,z:8}, {x:0,z:8}], isBalloonLevel: true },
            // Level 6: Balloons III (Complex)
            { color: new THREE.Color(1.0, 0.0, 0.5), path: [{x:-10,z:10}, {x:-10,z:-5}, {x:-5,z:-5}, {x:-5,z:5}, {x:0,z:5}, {x:0,z:-10}, {x:5,z:-10}, {x:5,z:0}, {x:10,z:0}, {x:10,z:10}], isBalloonLevel: true },
            // Sandbox
            { isSandbox: true, color: new THREE.Color(0.0, 1.0, 0.5), path: [] }
        ];

        const entities = {
            towers: [],
            enemies: [],
            projectiles: [],
            particles: [],
            tiles: []
        };

        const shake = { amount: 0 };

        const bgUniforms = {
            uTime: { value: 0 },
            uColor: { value: new THREE.Vector3(0,1,1) }
        };
        
        const bgMaterial = new THREE.ShaderMaterial({
            uniforms: bgUniforms,
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float uTime;
                uniform vec3 uColor;
                varying vec2 vUv;
                void main() {
                    vec2 grid = abs(fract(vUv * 20.0 - vec2(0, uTime * 0.2)) - 0.5) / fwidth(vUv * 20.0);
                    float line = min(grid.x, grid.y);
                    float alpha = 1.0 - min(line, 1.0);
                    float dist = distance(vUv, vec2(0.5, 0.5));
                    alpha *= (1.0 - dist * 1.5);
                    vec3 finalColor = uColor * alpha * 2.0;
                    gl_FragColor = vec4(finalColor, alpha);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        function createMatrixSkyDome() {
            const skyGeo = new THREE.SphereGeometry(100, 64, 64);
            const skyUniforms = { uTime: { value: 0 } };
            const vertexShader = `
                varying vec3 vPosition;
                varying vec2 vUv;
                void main() {
                    vPosition = position;
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `;
            const fragmentShader = `
                precision highp float;
                varying vec3 vPosition;
                varying vec2 vUv;
                uniform float uTime;
                float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
                float matrixRain(vec2 uv, float time) {
                    float col = floor(uv.x * 40.0);
                    float speed = hash(vec2(col, 0.0)) * 1.5 + 0.5;
                    float y = fract(uv.y * 12.0 - time * speed);
                    float bright = smoothstep(0.08, 0.0, y) * smoothstep(0.0, 0.15, y);
                    return hash(vec2(col, floor(uv.y * 12.0 - time * speed))) > 0.7 ? bright : 0.0;
                }
                void main() {
                    vec3 pos = normalize(vPosition);
                    float theta = atan(pos.z, pos.x);
                    float phi = acos(pos.y);
                    vec2 uv = vec2(theta / 6.28318, phi / 3.14159);
                    vec3 baseColor = vec3(0.0, 0.01, 0.03);
                    float rain = matrixRain(uv, uTime * 0.2);
                    vec3 rainColor = vec3(0.0, 0.3, 0.1) * rain;
                    gl_FragColor = vec4(baseColor + rainColor, 1.0);
                }
            `;
            const skyMat = new THREE.ShaderMaterial({
                uniforms: skyUniforms,
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                side: THREE.BackSide,
                fog: false, depthWrite: false, depthTest: false
            });
            const skyMesh = new THREE.Mesh(skyGeo, skyMat);
            skyMesh.renderOrder = -100;
            skyMesh.userData.uniforms = skyUniforms;
            return skyMesh;
        }

        // === NEBEL WOLKEN & GLITZER PARTIKEL (Vereinfacht für Performance) ===
        function createFogClouds() {
            const cloudGroup = new THREE.Group();
            for (let i = 0; i < 5; i++) {
                const cloudGeo = new THREE.SphereGeometry(15, 8, 8);
                const cloudMat = new THREE.MeshBasicMaterial({
                    color: 0x004488, transparent: true, opacity: 0.1, blending: THREE.AdditiveBlending, side: THREE.DoubleSide
                });
                const cloud = new THREE.Mesh(cloudGeo, cloudMat);
                cloud.position.set(Math.random()*40-20, Math.random()*10, Math.random()*40-20);
                cloudGroup.add(cloud);
            }
            return cloudGroup;
        }
        function createGlitterParticles() {
            const particleGroup = new THREE.Group();
            const geo = new THREE.BufferGeometry();
            const pos = [];
            for (let i = 0; i < 100; i++) pos.push(Math.random()*60-30, Math.random()*30, Math.random()*60-30);
            geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
            const mat = new THREE.PointsMaterial({color: 0xffffff, size: 0.2, transparent: true, opacity: 0.6});
            const particles = new THREE.Points(geo, mat);
            particleGroup.add(particles);
            return particleGroup;
        }

        class PortalGateway {
            constructor(x, z) {
                this.group = new THREE.Group();
                const ringGeo = new THREE.TorusGeometry(3, 0.4, 20, 50);
                const ringMat = new THREE.MeshStandardMaterial({
                    color: 0x222222, emissive: 0x001133, emissiveIntensity: 0.3
                });
                this.ringMesh = new THREE.Mesh(ringGeo, ringMat);
                this.ringMesh.rotation.x = Math.PI / 2;
                this.group.add(this.ringMesh);
                
                this.light = new THREE.PointLight(0x00ffff, 2, 20);
                this.light.position.set(0, 2, 0);
                this.group.add(this.light);

                this.group.position.set(x * TILE_SIZE, 1.5, z * TILE_SIZE);
                scene.add(this.group);
            }
            update(dt) {
                this.ringMesh.rotation.z += dt;
            }
        }

        class NeuroCore {
            constructor(x, z) {
                this.group = new THREE.Group();
                this.health = 20;
                this.maxHealth = 20;
                this.destroyed = false;
                
                const coreGeo = new THREE.IcosahedronGeometry(2, 1);
                const coreMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true, transparent: true });
                this.coreMesh = new THREE.Mesh(coreGeo, coreMat);
                this.group.add(this.coreMesh);
                
                this.light = new THREE.PointLight(0x00ffff, 2, 15);
                this.light.position.set(0, 2, 0);
                this.group.add(this.light);

                this.group.position.set(x * TILE_SIZE, 2, z * TILE_SIZE);
                this.animTime = 0;
                scene.add(this.group);
            }
            takeDamage() {
                if (this.destroyed) return;
                this.health--;
                sfx.playCoreHit();
                shake.amount = 0.8;
                if (this.health <= 0) this.destroy();
            }
            destroy() {
                this.destroyed = true;
                sfx.playCoreDestroy();
                shake.amount = 2;
                endGame();
            }
            update(dt) {
                if (this.destroyed) return;
                this.animTime += dt;
                const pulse = 1 + Math.sin(this.animTime * 3) * 0.1;
                this.coreMesh.scale.setScalar(pulse);
                this.coreMesh.rotation.y += dt * 0.5;
            }
        }

        function createCharacter(type, scale, color, eyeColor) {
            const charGroup = new THREE.Group();
            const armorMat = new THREE.MeshStandardMaterial({ 
                color: color, metalness: 0.9, roughness: 0.1,
                emissive: color, emissiveIntensity: 0.3
            });
            const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.35 * scale, 0.8 * scale, 8, 16), armorMat);
            charGroup.add(torso);
            return charGroup;
        }

        function collapseTileWithTower() {
            const towersOnTiles = entities.towers.filter(t => !t.isCollapsed);
            if (towersOnTiles.length === 0) return;
            const randomTower = towersOnTiles[Math.floor(Math.random() * towersOnTiles.length)];
            const tilePos = randomTower.mesh.position;
            const tile = entities.tiles.find(t => Math.abs(t.position.x - tilePos.x) < 0.1 && Math.abs(t.position.z - tilePos.z) < 0.1);
            if (tile && !tile.userData.collapsed) collapseTile(tile, randomTower);
        }

        function collapseTile(tile, tower) {
            tile.userData.collapsed = true;
            tile.userData.collapsedTower = tower;
            tower.isCollapsed = true;
            sfx.playCollapse();
            shake.amount = 1;
            tile.visible = false;
            tower.mesh.visible = false;
            gameState.collapsedTiles.push({tile, tower});
            const msg = document.getElementById('msg-area');
            msg.innerText = "TILE COLLAPSED!";
            msg.style.opacity = 1;
            setTimeout(() => msg.style.opacity = 0, 2000);
        }

        window.repairTile = function() {
            if (!selectedTile || !selectedTile.userData.collapsed) return;
            if (gameState.money < 200) { sfx.playError(); return; }
            gameState.money -= 200;
            const collapsedData = gameState.collapsedTiles.find(c => c.tile === selectedTile);
            if (collapsedData) {
                selectedTile.userData.collapsed = false;
                selectedTile.userData.hasTower = false;
                selectedTile.visible = true;
                scene.remove(collapsedData.tower.mesh);
                entities.towers = entities.towers.filter(t => t !== collapsedData.tower);
                gameState.collapsedTiles = gameState.collapsedTiles.filter(c => c !== collapsedData);
                sfx.playUpgrade();
            }
            hideTowerInfo();
            updateUI();
        }

        window.updateLighting = function(type, value) {
            value = parseFloat(value);
            if (type === 'ambient') ambientLight.intensity = value / 100;
            else if (type === 'directional') directionalLight.intensity = value / 100;
            else if (type === 'hue') directionalLight.color.setHSL(value / 360, 1, 0.5);
        }

        window.updateGameSpeed = function(value) {
            gameSpeed = value / 100;
            document.getElementById('speed-val').innerText = gameSpeed.toFixed(1) + 'x';
        }

        window.togglePause = function() {
            isPaused = !isPaused;
            document.getElementById('pause-overlay').style.display = isPaused ? 'flex' : 'none';
            if (isPaused) sfx.pauseBackgroundMusic();
            else sfx.resumeBackgroundMusic();
        }

        window.showMenu = function() {
            sfx.stopBackgroundMusic();
            entities.towers.forEach(t => scene.remove(t.mesh));
            entities.enemies.forEach(e => scene.remove(e.mesh));
            entities.tiles.forEach(t => scene.remove(t));
            if (neuroCore) scene.remove(neuroCore.group);
            if (portalGateway) scene.remove(portalGateway.group);
            entities.towers = []; entities.enemies = []; entities.projectiles = []; entities.tiles = [];
            gameState.collapsedTiles = [];
            document.getElementById('pause-overlay').style.display = 'none';
            document.getElementById('game-over-screen').style.display = 'none';
            document.getElementById('victory-screen').style.display = 'none';
            document.getElementById('build-menu').style.display = 'none';
            document.getElementById('game-controls').style.display = 'none';
            document.getElementById('light-panel').style.display = 'none';
            document.getElementById('tower-info-panel').style.display = 'none';
            document.getElementById('start-screen').style.display = 'flex';
            loadHighscores();
        }

        window.restartLevel = function() {
            document.getElementById('pause-overlay').style.display = 'none';
            document.getElementById('game-over-screen').style.display = 'none';
            document.getElementById('victory-screen').style.display = 'none';
            startGame(gameState.levelIndex);
        }

        window.toggleDeleteMode = function() {
            deleteMode = !deleteMode;
            document.querySelectorAll('.tower-btn')[3].classList.toggle('delete-mode');
            hideTowerInfo();
        }

        function showTowerInfo(tower) {
            selectedTower = tower;
            selectedTile = null;
            const panel = document.getElementById('tower-info-panel');
            const typeData = TOWER_TYPES[tower.typeIndex];
            const currentUpgrade = typeData.upgrades[tower.level];
            document.getElementById('tower-info-name').innerText = typeData.name;
            document.getElementById('tower-info-level').innerText = 'Level: ' + (tower.level + 1);
            document.getElementById('tower-info-damage').innerText = 'Dmg: ' + currentUpgrade.damage;
            document.getElementById('tower-info-rate').innerText = 'Rate: ' + currentUpgrade.rate + 's';
            const upgradeBtn = document.getElementById('upgrade-btn');
            if (tower.level < typeData.upgrades.length - 1) {
                upgradeBtn.innerText = `UPGRADE (${typeData.upgrades[tower.level + 1].cost})`;
                upgradeBtn.disabled = gameState.money < typeData.upgrades[tower.level + 1].cost;
            } else {
                upgradeBtn.innerText = 'MAX';
                upgradeBtn.disabled = true;
            }
            document.querySelector('.sell-btn').innerText = `SELL (${Math.floor(tower.getTotalCost() * 0.7)})`;
            document.getElementById('repair-btn').style.display = 'none';
            panel.style.display = 'block';
        }

        function showTileInfo(tile) {
            selectedTile = tile;
            selectedTower = null;
            document.getElementById('tower-info-panel').style.display = 'block';
            document.getElementById('tower-info-name').innerText = 'DESTROYED TILE';
            document.getElementById('repair-btn').style.display = 'block';
            document.getElementById('upgrade-btn').style.display = 'none';
            document.querySelector('.sell-btn').style.display = 'none';
        }

        function hideTowerInfo() {
            selectedTower = null;
            selectedTile = null;
            document.getElementById('tower-info-panel').style.display = 'none';
            document.getElementById('upgrade-btn').style.display = 'block';
            document.querySelector('.sell-btn').style.display = 'block';
        }

        window.upgradeTower = function() {
            if (!selectedTower) return;
            const typeData = TOWER_TYPES[selectedTower.typeIndex];
            if (selectedTower.level >= typeData.upgrades.length - 1) return;
            const nextUpgrade = typeData.upgrades[selectedTower.level + 1];
            if (gameState.money >= nextUpgrade.cost) {
                gameState.money -= nextUpgrade.cost;
                selectedTower.upgrade();
                updateUI();
                showTowerInfo(selectedTower);
                sfx.playUpgrade();
            } else sfx.playError();
        }

        window.sellTower = function() {
            if (!selectedTower) return;
            gameState.money += Math.floor(selectedTower.getTotalCost() * 0.7);
            const tilePos = selectedTower.mesh.position;
            const tile = entities.tiles.find(t => Math.abs(t.position.x - tilePos.x) < 0.1 && Math.abs(t.position.z - tilePos.z) < 0.1);
            if (tile) { tile.userData.hasTower = false; tile.material.color.setHex(0x444444); }
            scene.remove(selectedTower.mesh);
            entities.towers = entities.towers.filter(t => t !== selectedTower);
            hideTowerInfo();
            updateUI();
        }

        function saveHighscore() {
            const scores = JSON.parse(localStorage.getItem('highscores') || '[]');
            const lvlName = gameState.levelIndex === 6 ? 'Sandbox' : `Level ${gameState.levelIndex + 1}`;
            scores.push({ level: lvlName, wave: gameState.wave - 1, date: new Date().toLocaleDateString() });
            scores.sort((a, b) => b.wave - a.wave);
            scores.splice(10);
            localStorage.setItem('highscores', JSON.stringify(scores));
        }

        function loadHighscores() {
            const scores = JSON.parse(localStorage.getItem('highscores') || '[]');
            const container = document.getElementById('highscore-list');
            container.innerHTML = '';
            scores.forEach((score, i) => {
                const entry = document.createElement('div');
                entry.className = 'highscore-entry';
                entry.innerHTML = `<span>${i + 1}. ${score.level}</span><span>Wave ${score.wave}</span>`;
                container.appendChild(entry);
            });
        }

        window.startGame = function(lvlIndex) {
            sfx.init();
            sfx.playBackgroundMusic();
            texZero = createCharTexture('0', '#00ff41');
            texOne = createCharTexture('1', '#00ff41');
            
            document.getElementById('start-screen').style.display = 'none';
            document.getElementById('sandbox-setup-screen').style.display = 'none';

            gameState.levelIndex = lvlIndex;
            gameState.wave = 1;
            gameState.isGameOver = false;
            gameState.collapsedTiles = [];
            isPaused = false;
            deleteMode = false;
            selectedTower = null;

            const level = LEVELS[lvlIndex];
            if (level.isSandbox) {
                gameState.money = gameState.sandboxConfig.startingMoney;
                gameState.lives = 20;
                level.color = gameState.sandboxConfig.color;
                level.path = gameState.sandboxConfig.customPath;
            } else {
                gameState.money = 450;
                gameState.lives = 20;
            }

            bgUniforms.uColor.value.set(level.color.r, level.color.g, level.color.b);
            
            entities.towers.forEach(t => scene.remove(t.mesh));
            entities.enemies.forEach(e => scene.remove(e.mesh));
            entities.tiles.forEach(t => scene.remove(t));
            if (neuroCore) scene.remove(neuroCore.group);
            if (portalGateway) scene.remove(portalGateway.group);
            entities.towers = []; entities.enemies = []; entities.projectiles = []; entities.tiles = [];

            createGrid(level);
            const startPoint = level.path[0];
            portalGateway = new PortalGateway(startPoint.x, startPoint.z);
            const endPoint = level.path[level.path.length - 1];
            neuroCore = new NeuroCore(endPoint.x, endPoint.z);
            
            updateUI();
            document.getElementById('build-menu').style.display = 'flex';
            document.getElementById('game-controls').style.display = 'flex';
            document.getElementById('light-panel').style.display = 'block';
            
            startWave();
        }

        window.selectTower = function(index) {
            gameState.selectedTowerType = index;
            document.querySelectorAll('.tower-btn').forEach((b, i) => i < 3 && b.classList.toggle('selected', i === index));
            if (deleteMode) toggleDeleteMode();
            sfx.playBuild();
        }

        function createGrid(levelData) {
            const geo = new THREE.BoxGeometry(TILE_SIZE - 0.2, 1, TILE_SIZE - 0.2);
            for (let x = -12; x <= 12; x++) {
                for (let z = -12; z <= 12; z++) {
                    const isPath = checkPath(x, z, levelData.path);
                    const mat = new THREE.MeshStandardMaterial({
                        color: isPath ? 0x333333 : 0x444444,
                        emissive: isPath ? levelData.color.getHex() : 0x000000,
                        emissiveIntensity: isPath ? 0.3 : 0
                    });
                    const mesh = new THREE.Mesh(geo, mat);
                    mesh.position.set(x * TILE_SIZE, -0.5, z * TILE_SIZE);
                    mesh.userData = { isPath, hasTower: false, collapsed: false };
                    scene.add(mesh);
                    entities.tiles.push(mesh);
                }
            }
        }

        function checkPath(x, z, points) {
            for(let i=0; i<points.length-1; i++) {
                let p1 = points[i]; let p2 = points[i+1];
                if(p1.x === p2.x && x === p1.x && z >= Math.min(p1.z,p2.z) && z <= Math.max(p1.z,p2.z)) return true;
                if(p1.z === p2.z && z === p1.z && x >= Math.min(p1.x,p2.x) && x <= Math.max(p1.x,p2.x)) return true;
            }
            return false;
        }

        class Enemy {
            constructor(type, isBalloon = false, balloonTier = 1, isBoss = false) {
                this.type = type;
                this.isBalloon = isBalloon;
                this.balloonTier = balloonTier;
                this.isBoss = isBoss;
                
                let hp = (30 + gameState.wave * 15);
                let speed = 6;
                let scale = 0.8;
                let color = 0xff0055;
                
                if (isBalloon) {
                    // Logic: Tier 1=Red, 2=Blue, 3=Green, 4=Yellow, 5=Purple
                    const colors = [0xff0000, 0x0000ff, 0x00ff00, 0xffff00, 0xff00ff];
                    color = colors[(balloonTier - 1) % colors.length];
                    
                    // HP scales with Tier, but effectively it's 1 hit per layer
                    hp = balloonTier * 2; 
                    speed = 4 + (5 - balloonTier) * 0.5; // Higher tiers move slower
                    scale = 0.5 + balloonTier * 0.2;

                    if (isBoss) {
                        scale *= 3;
                        hp *= 2; // Extra armor
                        speed *= 0.5;
                    }

                    const balloonGeo = new THREE.SphereGeometry(scale, 16, 16);
                    const balloonMat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.5 });
                    this.mesh = new THREE.Mesh(balloonGeo, balloonMat);
                } else {
                    // Agent logic (simplified for this update)
                    this.mesh = createCharacter(type, scale, color, 0xffffff);
                }
                
                const start = LEVELS[gameState.levelIndex].path[0];
                this.mesh.position.set(start.x * TILE_SIZE, scale + 0.5, start.z * TILE_SIZE);
                
                this.hp = hp;
                this.maxHp = hp;
                this.speed = speed;
                this.pathIndex = 0;
                this.dead = false;
                scene.add(this.mesh);
            }

            update(dt) {
                if (this.dead) return;
                dt *= gameSpeed;
                
                const path = LEVELS[gameState.levelIndex].path;
                if (this.pathIndex >= path.length - 1) { this.hitBase(); return; }

                const targetGrid = path[this.pathIndex + 1];
                const targetPos = new THREE.Vector3(targetGrid.x * TILE_SIZE, this.mesh.position.y, targetGrid.z * TILE_SIZE);
                const dir = new THREE.Vector3().subVectors(targetPos, this.mesh.position);
                
                if (dir.length() < 0.2) this.pathIndex++;
                else {
                    dir.normalize();
                    this.mesh.position.add(dir.multiplyScalar(this.speed * dt));
                }
            }

            takeDamage(dmg) {
                this.hp -= dmg;
                
                if (this.hp <= 0 && !this.dead) {
                    this.dead = true;
                    sfx.playResonantRing();
                    
                    // RECURSIVE BALLOON LOGIC
                    if (this.isBalloon && this.balloonTier > 1) {
                        const childCount = 2;
                        const childTier = this.balloonTier - 1;
                        for(let i=0; i<childCount; i++) {
                            setTimeout(() => {
                                if(gameState.isGameOver) return;
                                const child = new Enemy('NORMAL', true, childTier);
                                child.mesh.position.copy(this.mesh.position);
                                // Offset slightly to separate visual
                                child.mesh.position.x += (Math.random()-0.5) * 1;
                                child.mesh.position.z += (Math.random()-0.5) * 1;
                                child.pathIndex = this.pathIndex;
                                entities.enemies.push(child);
                            }, i * 100);
                        }
                    }

                    gameState.money += this.isBalloon ? (this.isBoss ? 100 : 5 * this.balloonTier) : 15;
                    updateUI();
                    scene.remove(this.mesh);
                }
            }

            hitBase() {
                this.dead = true;
                scene.remove(this.mesh);
                if (neuroCore && !neuroCore.destroyed) neuroCore.takeDamage();
                gameState.lives--;
                updateUI();
            }
        }

        class Tower {
            constructor(x, z, typeIndex) {
                this.typeIndex = typeIndex;
                this.level = 0;
                this.typeData = TOWER_TYPES[typeIndex];
                this.data = this.typeData.upgrades[0];
                this.mesh = new THREE.Group();
                this.mesh.position.set(x, 1, z);
                
                this.createGeometry();
                this.cooldown = 0;
                scene.add(this.mesh);
            }

            createGeometry() {
                while(this.mesh.children.length > 0) this.mesh.remove(this.mesh.children[0]);
                const color = this.data.color;
                
                const base = new THREE.Mesh(
                    new THREE.CylinderGeometry(1.5, 2, 0.5, 6),
                    new THREE.MeshStandardMaterial({ color: 0x222222, emissive: color, emissiveIntensity: 0.3 })
                );
                this.mesh.add(base);

                const core = new THREE.Mesh(
                    new THREE.IcosahedronGeometry(1, 0),
                    new THREE.MeshBasicMaterial({ color: color, wireframe: true })
                );
                core.position.y = 1.5;
                this.mesh.add(core);
                this.core = core;
            }

            upgrade() {
                this.level++;
                this.data = this.typeData.upgrades[this.level];
                this.createGeometry();
            }

            getTotalCost() {
                let total = this.typeData.baseCost;
                for(let i=1; i<=this.level; i++) total += this.typeData.upgrades[i].cost;
                return total;
            }

            update(dt) {
                if (this.isCollapsed) return;
                this.cooldown -= dt;
                this.core.rotation.y += dt;

                let target = null;
                let minDist = this.data.range;
                for (const e of entities.enemies) {
                    if (e.dead) continue;
                    const d = this.mesh.position.distanceTo(e.mesh.position);
                    if (d < minDist) { minDist = d; target = e; }
                }

                if (target && this.cooldown <= 0) {
                    this.shoot(target);
                    this.cooldown = this.data.rate;
                }
            }

            shoot(target) {
                if(this.typeIndex === 0) sfx.playSonicWave();
                else if(this.typeIndex === 1) sfx.playTremoloWave();
                
                // Optimized Projectile without Light for High Fire Rate
                entities.projectiles.push(new Projectile(
                    this.mesh.position.clone().add(new THREE.Vector3(0, 2, 0)),
                    target,
                    this.data,
                    this.typeData.projectileSpeed
                ));
            }
        }

        class Projectile {
            constructor(pos, target, data, speed) {
                this.pos = pos;
                this.target = target;
                this.data = data;
                this.speed = speed;
                
                // No PointLight here to save performance with 20x fire rate
                const mat = new THREE.SpriteMaterial({ map: texOne, color: data.color, transparent: true });
                this.mesh = new THREE.Sprite(mat);
                this.mesh.position.copy(pos);
                this.mesh.scale.set(1.5, 1.5, 1.5); // Bigger to be visible without light
                this.active = true;
                scene.add(this.mesh);
            }

            update(dt) {
                if (!this.active) return;
                if (this.target.dead && !this.data.aoe) {
                    this.active = false; scene.remove(this.mesh); return;
                }

                const targetPos = this.target.mesh.position.clone();
                const dir = new THREE.Vector3().subVectors(targetPos, this.mesh.position).normalize();
                this.mesh.position.add(dir.multiplyScalar(this.speed * dt));

                if (this.mesh.position.distanceTo(targetPos) < 1.0) {
                    this.hit();
                }
            }

            hit() {
                this.active = false;
                scene.remove(this.mesh);
                if (this.data.aoe) {
                    entities.enemies.forEach(e => {
                        if (e.mesh.position.distanceTo(this.mesh.position) < this.data.aoe) e.takeDamage(this.data.damage);
                    });
                } else if (!this.target.dead) {
                    this.target.takeDamage(this.data.damage);
                }
            }
        }

        function startWave() {
            if (gameState.isGameOver) return;
            if (gameState.wave > 1) collapseTileWithTower();
            
            const msg = document.getElementById('msg-area');
            msg.innerText = "WAVE " + gameState.wave;
            msg.style.opacity = 1;
            setTimeout(() => msg.style.opacity = 0, 2000);

            const level = LEVELS[gameState.levelIndex];
            const isBalloonLevel = level.isBalloonLevel;
            
            let count = isBalloonLevel ? 10 + gameState.wave : 5 + gameState.wave;
            const interval = isBalloonLevel ? 800 : 1200;

            // SUPER BALLOON CHECK (Every 5 waves)
            if (isBalloonLevel && gameState.wave % 5 === 0) {
                // Determine max tier for this wave logic
                // Wave 1-2: T1. Wave 3-4: T2. Wave 5-6: T3.
                const maxTier = Math.ceil(gameState.wave / 2);
                
                // Spawn Boss
                const boss = new Enemy('BOSS', true, maxTier, true);
                entities.enemies.push(boss);
                
                // Also spawn some minions
                count = 5; 
            }

            let spawned = 0;
            const spawner = setInterval(() => {
                if (gameState.isGameOver) { clearInterval(spawner); return; }
                
                if (isBalloonLevel) {
                    // Logic: Wave 1,2 -> Tier 1. Wave 3,4 -> Tier 2. Wave 5,6 -> Tier 3.
                    const maxTier = Math.ceil(gameState.wave / 2);
                    // Spawn mix of max tier and lower tiers
                    const tier = Math.random() > 0.7 ? Math.max(1, maxTier - 1) : maxTier;
                    entities.enemies.push(new Enemy('NORMAL', true, tier));
                } else {
                    entities.enemies.push(new Enemy('NORMAL'));
                }
                
                spawned++;
                if (spawned >= count) {
                    clearInterval(spawner);
                    checkWaveEnd();
                }
            }, interval);
        }

        function checkWaveEnd() {
            const checker = setInterval(() => {
                if (entities.enemies.length === 0 && !gameState.isGameOver) {
                    clearInterval(checker);
                    gameState.wave++;
                    updateUI();
                    startWave();
                }
            }, 500);
        }

        function onPointerDown(e) {
            if (gameState.isGameOver || e.target !== renderer.domElement) return;
            mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);

            // Check Towers
            const towerIntersects = raycaster.intersectObjects(entities.towers.map(t => t.mesh), true);
            if (towerIntersects.length > 0) {
                // Find root group
                let obj = towerIntersects[0].object;
                while(obj.parent && obj.parent.type !== 'Scene') obj = obj.parent;
                const tower = entities.towers.find(t => t.mesh === obj);
                if (tower) {
                    if (deleteMode) { selectedTower = tower; sellTower(); }
                    else showTowerInfo(tower);
                    return;
                }
            }

            // Check Tiles
            const tileIntersects = raycaster.intersectObjects(entities.tiles);
            if (tileIntersects.length > 0) {
                const tile = tileIntersects[0].object;
                if (tile.userData.collapsed) { showTileInfo(tile); return; }
                if (deleteMode) return;
                
                if (!tile.userData.isPath && !tile.userData.hasTower) {
                    const cost = TOWER_TYPES[gameState.selectedTowerType].baseCost;
                    if (gameState.money >= cost) {
                        gameState.money -= cost;
                        tile.userData.hasTower = true;
                        tile.material.color.setHex(0x111111);
                        entities.towers.push(new Tower(tile.position.x, tile.position.z, gameState.selectedTowerType));
                        sfx.playBuild();
                        updateUI();
                    } else sfx.playError();
                }
                hideTowerInfo();
            }
        }

        function updateUI() {
            document.getElementById('money-val').innerText = gameState.money;
            document.getElementById('lives-val').innerText = gameState.lives;
            document.getElementById('wave-val').innerText = gameState.wave;
        }

        function endGame() {
            gameState.isGameOver = true;
            saveHighscore();
            document.getElementById('final-score').innerText = "WAVES: " + (gameState.wave - 1);
            document.getElementById('game-over-screen').style.display = 'flex';
        }

        function init() {
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);
            camera.position.set(0, 30, 40);
            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.shadowMap.enabled = true;
            document.body.appendChild(renderer.domElement);
            
            controls = new OrbitControls(camera, renderer.domElement);
            controls.maxPolarAngle = Math.PI/2 - 0.1;

            ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
            scene.add(ambientLight);
            directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
            directionalLight.position.set(20, 50, 20);
            directionalLight.castShadow = true;
            scene.add(directionalLight);

            const bgMesh = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), bgMaterial);
            bgMesh.rotation.x = -Math.PI / 2;
            bgMesh.position.y = -2;
            scene.add(bgMesh);
            
            scene.add(createMatrixSkyDome());
            scene.add(createFogClouds());
            scene.add(createGlitterParticles());

            raycaster = new THREE.Raycaster();
            mouse = new THREE.Vector2();

            window.addEventListener('resize', () => {
                camera.aspect = window.innerWidth/window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            });
            window.addEventListener('pointerdown', onPointerDown);

            const clock = new THREE.Clock();
            function animate() {
                requestAnimationFrame(animate);
                const dt = isPaused ? 0 : clock.getDelta();
                const time = clock.getElapsedTime();
                bgUniforms.uTime.value = time;
                
                if (shake.amount > 0) {
                    camera.position.addScalar((Math.random()-0.5)*shake.amount);
                    shake.amount = Math.max(0, shake.amount - dt*2);
                }
                controls.update();

                if (portalGateway) portalGateway.update(dt);
                if (neuroCore) neuroCore.update(dt);
                if (!gameState.isGameOver && !isPaused) {
                    entities.enemies.forEach((e, i) => { e.update(dt); if(e.dead) entities.enemies.splice(i, 1); });
                    entities.towers.forEach(t => t.update(dt));
                    entities.projectiles.forEach((p, i) => { p.update(dt); if(!p.active) entities.projectiles.splice(i, 1); });
                }
                renderer.render(scene, camera);
            }
            animate();
        }
        init();