// ========== ENHANCED ENEMY CLASS WITH SLOW EFFECTS ==========
import * as THREE from 'three';
import { LEVELS } from './levels.js';

// Export only once - at the class declaration
export class Enemy {
            constructor(type, isBalloon, balloonSize, scene, neuroCore, shake, gameState, getGameSpeed) {
                this.type = type;
                this.scene = scene;
                this.neuroCore = neuroCore;
                this.shake = shake;
                this.gameState = gameState;
                this.getGameSpeed = getGameSpeed;
                this.isBalloon = isBalloon;
                this.balloonSize = balloonSize;
                
                const cfg = LEVELS[gameState.levelIndex].isSandbox ? gameState.sandboxConfig : null;
                const scale = cfg ? cfg.difficultyScale : 1.0;
                
                let hp = (30 + gameState.wave * 15) * scale;
                let speed = 6;
                let charScale = 0.8;
                let color = 0xff0055;
                let eyeColor = 0xff0055;
                
                this.isPhasing = false;
                this.phaseTimer = 0;
                this.canHeal = false;
                this.healCooldown = 0;
                this.splits = 0;
                this.isNatron = false;
                this.damageByType = {};

                if (isBalloon) {
                    hp = 1;
                    speed = 4 + (4 - balloonSize) * 2;
                    charScale = 0.3 + balloonSize * 0.2;
                    const colors = [0xff0000, 0x0000ff, 0x00ff00, 0xffff00];
                    color = colors[balloonSize - 1] || 0xff0000;
                    eyeColor = 0xffffff;
                    const balloonGeo = new THREE.SphereGeometry(charScale, 16, 16);
                    const balloonMat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.5 });
                    this.mesh = new THREE.Mesh(balloonGeo, balloonMat);
                    this.mesh.castShadow = true;
                } else {
                    if (type === 'TANK') { hp *= 3; speed *= 0.6; charScale = 1.2; color = 0x00ff00; eyeColor = 0xff0000; }
                    if (type === 'SPEED') { hp *= 0.6; speed *= 1.4; charScale = 0.6; color = 0xffff00; eyeColor = 0xff8800; }
                    if (type === 'BOSS') { hp *= 10; speed *= 0.4; charScale = 1.8; color = 0xff00ff; eyeColor = 0x00ffff; }
                    if (type === 'ASSASSIN') { hp *= 0.4; speed *= 2.0; charScale = 0.7; color = 0x8800ff; eyeColor = 0xff00ff; this.reward = 30; }
                    if (type === 'JUGGERNAUT') { hp *= 6; speed *= 0.3; charScale = 1.6; color = 0x444444; eyeColor = 0xff0000; }
                    if (type === 'GHOST') { 
                        hp *= 1.5; speed *= 0.8; charScale = 0.9; color = 0x00ffaa; eyeColor = 0xffffff;
                        this.canPhase = true; this.phaseTimer = 3;
                    }
                    if (type === 'HEALER') { 
                        hp *= 2; speed *= 0.7; charScale = 1.0; color = 0x00ff88; eyeColor = 0xffff00;
                        this.canHeal = true; this.healCooldown = 0;
                    }
                    if (type === 'SPLITTER') { 
                        hp *= 1.5; speed *= 0.9; charScale = 0.9; color = 0xff8800; eyeColor = 0xffff00;
                        this.canSplit = true; this.splits = 0; this.maxSplits = 2;
                    }
                    if (type === 'NATRON') { 
                        hp *= 4; speed *= 0.7; charScale = 1.1; color = 0xffaa00; eyeColor = 0xff0000;
                        this.isNatron = true; this.reward = 50;
                    }
                    this.mesh = createCharacter(type, charScale, color, eyeColor);
                }
                
                const start = LEVELS[gameState.levelIndex].path[0];
                const yOffset = isBalloon ? charScale + 0.5 : charScale * 1.5;
                this.mesh.position.set(start.x * TILE_SIZE, yOffset, start.z * TILE_SIZE);
                
                this.hp = hp;
                this.maxHp = hp;
                this.speed = speed;
                this.pathIndex = 0;
                this.dead = false;

                // Slow effect properties (NEW)
                this.slowFactor = 1.0;
                this.slowDuration = 0;
                this.isSlowed = false;
                this.animTime = Math.random() * 100;
                this.reward = this.reward || 15;
                
                if (!isBalloon || balloonSize > 1) {
                    const barGeo = new THREE.PlaneGeometry(2, 0.2);
                    const barMat = new THREE.MeshBasicMaterial({color: 0x00ff00});
                    this.hpBar = new THREE.Mesh(barGeo, barMat);
                    this.hpBar.position.y = charScale * 2.5;
                    this.mesh.add(this.hpBar);
                }
                this.scene.add(this.mesh);
            }

            update(dt) {
                if (this.dead) return;
                dt *= gameSpeed;
                this.animTime += dt;
                
                if (this.canPhase) {
                    this.phaseTimer -= dt;
                    if (this.phaseTimer <= 0) {
                        this.isPhasing = !this.isPhasing;
                        this.phaseTimer = this.isPhasing ? 2 : 3;
                        
                        if (this.isPhasing) {
                            sfx.playPhase();
                            this.mesh.traverse(child => {
                                if (child.material) {
                                    child.material.transparent = true;
                                    child.material.opacity = 0.3;
                                }
                            });
                        } else {
                            this.mesh.traverse(child => {
                                if (child.material) child.material.opacity = 1.0;
                            });
                        }
                    }
                }
                
                if (this.canHeal) {
                    this.healCooldown -= dt;
                    if (this.healCooldown <= 0) {
                        this.healCooldown = 3;
                        entities.enemies.forEach(e => {
                            if (e !== this && !e.dead && this.mesh.position.distanceTo(e.mesh.position) < 10) {
                                e.hp = Math.min(e.maxHp, e.hp + e.maxHp * 0.2);
                                if (e.hpBar) {
                                    const pct = e.hp / e.maxHp;
                                    e.hpBar.scale.x = pct;
                                    e.hpBar.material.color.setHSL(pct * 0.3, 1, 0.5);
                                }
                                sfx.playHeal();
                                spawnParticles(e.mesh.position, 0x00ff88, 5);
                            }
                        });
                    }
                }
                
                const path = LEVELS[gameState.levelIndex].path;
                if (this.pathIndex >= path.length - 1) {
                    this.hitBase();
                    return;
                }

                const targetGrid = path[this.pathIndex + 1];
                const targetPos = new THREE.Vector3(targetGrid.x * TILE_SIZE, this.mesh.position.y, targetGrid.z * TILE_SIZE);
                const dir = new THREE.Vector3().subVectors(targetPos, this.mesh.position);
                const dist = dir.length();

                if (dist < 0.2) {
                    this.pathIndex++;
                } else {
                    dir.normalize();
                    const angle = Math.atan2(dir.x, dir.z);
                    this.mesh.rotation.y = angle;
                    this.mesh.position.add(dir.multiplyScalar(this.speed * dt));
                    
                    if (this.mesh.userData.legL && !this.isBalloon) {
                        const parts = this.mesh.userData;
                        parts.legL.rotation.x = Math.sin(this.animTime * 12) * 0.7;
                        parts.legR.rotation.x = Math.cos(this.animTime * 12) * 0.7;
                        parts.armL.rotation.x = Math.cos(this.animTime * 12) * 0.5;
                        parts.armR.rotation.x = Math.sin(this.animTime * 12) * 0.5;
                        parts.torso.position.y = Math.sin(this.animTime * 24) * 0.05 * parts.scale;
                    } else if (this.isBalloon) {
                        this.mesh.rotation.y += dt * 2;
                    }
                }
            }

            takeDamage(dmg, towerType) {
                if (this.isPhasing) return;
                
                if (this.isNatron && towerType !== undefined) {
                    if (!this.damageByType[towerType]) this.damageByType[towerType] = 0;
                    const maxDamageFromType = this.maxHp * 0.35;
                    const remainingAllowedDamage = maxDamageFromType - this.damageByType[towerType];
                    const actualDamage = Math.min(dmg, remainingAllowedDamage);
                    this.damageByType[towerType] += actualDamage;
                    this.hp -= actualDamage;
                } else {
                    this.hp -= dmg;
                }
                
                if (this.hpBar) {
                    const pct = Math.max(0, this.hp / this.maxHp);
                    this.hpBar.scale.x = pct;
                    this.hpBar.material.color.setHSL(pct * 0.3, 1, 0.5);
                }
                
                if (this.canSplit && this.splits < this.maxSplits && this.hp > 0 && this.hp < this.maxHp * 0.5) {
                    this.splits++;
                    setTimeout(() => {
                        const newEnemy = new Enemy(this.type);
                        newEnemy.hp = this.maxHp * 0.3;
                        newEnemy.maxHp = this.maxHp * 0.3;
                        newEnemy.mesh.position.copy(this.mesh.position);
                        newEnemy.mesh.position.x += (Math.random() - 0.5) * 3;
                        newEnemy.mesh.position.z += (Math.random() - 0.5) * 3;
                        newEnemy.pathIndex = this.pathIndex;
                        newEnemy.canSplit = false;
                        entities.enemies.push(newEnemy);
                        sfx.playResonantRing();
                    }, 100);
                }

                if (this.hp <= 0 && !this.dead) {
                    this.dead = true;
                    
                    if (this.isBalloon && this.balloonSize > 1) {
                        sfx.playResonantRing();
                        setTimeout(() => {
                            for (let i = 0; i < 2; i++) {
                                const newBalloon = new Enemy('NORMAL', true, this.balloonSize - 1);
                                newBalloon.mesh.position.copy(this.mesh.position);
                                newBalloon.mesh.position.x += (i - 0.5) * 2;
                                newBalloon.pathIndex = this.pathIndex;
                                entities.enemies.push(newBalloon);
                            }
                        }, 100);
                    } else {
                        sfx.playResonantRing();
                    }
                    
                    const moneyGain = this.isBalloon ? 5 * this.balloonSize : (this.type === 'BOSS' ? 100 : this.reward);
                    gameState.money += moneyGain;
                    updateUI();
                    
                    const particleColor = this.mesh.material ? this.mesh.material.color.getHex() : 0xff0055;
                    spawnParticles(this.mesh.position, particleColor, this.isBalloon ? 5 : 10);
                    shake.amount = this.isBalloon ? 0.1 : 0.3;
                    this.scene.remove(this.mesh);
                }
            }

            hitBase() {
                this.dead = true;
                this.scene.remove(this.mesh);
                if (neuroCore && !neuroCore.destroyed) this.neuroCore.takeDamage();
                gameState.lives--;
                updateUI();
            }
        }

        class Tower {
            constructor(x, z, typeIndex) {
                this.typeIndex = typeIndex;
                this.level = 0;
                const typeData = TOWER_TYPES[typeIndex];
                this.typeData = typeData;
                this.data = typeData.upgrades[0];
                this.isCollapsed = false;
                
                this.mesh = new THREE.Group();
                this.mesh.position.set(x, 1, z);
                this.mesh.userData.tower = this;

                this.createGeometry();
                this.mesh.scale.set(0.1,0.1,0.1);
                this.cooldown = 0;
                this.animTime = 0;
            }

            createGeometry() {
                while(this.mesh.children.length > 0) {
                    this.mesh.remove(this.mesh.children[0]);
                }

                const size = 1 + this.level * 0.15;
                const coreGeo = new THREE.IcosahedronGeometry(0.8 * size, 0);
                const coreMat = new THREE.MeshBasicMaterial({ color: this.data.color, wireframe: true });
                this.hackerCore = new THREE.Mesh(coreGeo, coreMat);
                this.hackerCore.position.y = 1;
                this.mesh.add(this.hackerCore);

                const cloudCount = 20 + this.level * 10;
                const cloudGeo = new THREE.BufferGeometry();
                const cloudPos = new Float32Array(cloudCount * 3);
                for(let i=0; i<cloudCount*3; i++) {
                    cloudPos[i] = (Math.random()-0.5) * 3 * size;
                }
                cloudGeo.setAttribute('position', new THREE.BufferAttribute(cloudPos, 3));
                const cloudMat = new THREE.PointsMaterial({ 
                    color: this.data.color, size: 0.3, transparent: true, opacity: 0.7
                });
                this.dataCloud = new THREE.Points(cloudGeo, cloudMat);
                this.dataCloud.position.y = 1;
                this.mesh.add(this.dataCloud);

                const baseGeo = new THREE.CylinderGeometry(1.5 * size, 2 * size, 0.5, 6);
                const baseMat = new THREE.MeshStandardMaterial({ 
                    color: 0x222222, emissive: this.data.color, emissiveIntensity: 0.3
                });
                const base = new THREE.Mesh(baseGeo, baseMat);
                base.position.y = 0.25;
                this.mesh.add(base);

                this.light = new THREE.PointLight(this.data.color, 1 + this.level * 0.5, 8);
                this.light.position.y = 1;
                this.mesh.add(this.light);

                this.scene.add(this.mesh);
            }

            upgrade() {
                if (this.level < this.typeData.upgrades.length - 1) {
                    this.level++;
                    this.data = this.typeData.upgrades[this.level];
                    this.createGeometry();
                }
            }

            getTotalCost() {
                let total = this.typeData.baseCost;
                for (let i = 1; i <= this.level; i++) {
                    total += this.typeData.upgrades[i].cost;
                }
                return total;
            }

            update(dt) {
                this.mesh.scale.lerp(new THREE.Vector3(1,1,1), dt * 10);
                this.cooldown -= dt;
                this.animTime += dt;

                if (this.hackerCore) {
                    this.hackerCore.rotation.y = this.animTime * 2;
                    this.hackerCore.rotation.z = this.animTime;
                    const pulse = 1 + Math.sin(this.animTime * 10) * 0.1;
                    this.hackerCore.scale.setScalar(pulse);
                }
                
                if (this.dataCloud) {
                    this.dataCloud.rotation.y = -this.animTime * 0.5;
                }

                if (this.isCollapsed) return;

                let target = null;
                let minDist = this.data.range;

                for (const e of entities.enemies) {
                    if (e.dead || e.isPhasing) continue;
                    const d = this.mesh.position.distanceTo(e.mesh.position);
                    if (d < minDist) {
                        minDist = d;
                        target = e;
                    }
                }

                if (target) {
                    if (this.cooldown <= 0) {
                        this.shoot(target);
                        this.cooldown = this.data.rate;
                    }
                }
            }

            shoot(target) {
                if(this.typeIndex === 0) sfx.playSonicWave();
                else if(this.typeIndex === 1) sfx.playTremoloWave();
                else if(this.typeIndex === 2) sfx.playUnderwaterEcho();

                if (this.light) {
                    this.light.intensity = 3;
                    setTimeout(() => { this.light.intensity = 1 + this.level * 0.5; }, 100);
                }

                entities.projectiles.push(new Projectile(
                    this.mesh.position.clone().add(new THREE.Vector3(0, 1, 0)),
                    target,
                    this.data,
                    this.typeData.projectileSpeed,
                    this.typeIndex
                ));
            }
        }

        class Projectile {
            constructor(pos, target, data, speed, towerType) {
                this.pos = pos;
                this.target = target;
                this.data = data;
                this.speed = speed;
                this.towerType = towerType;
                
                const tex = Math.random() > 0.5 ? texZero : texOne;
                const mat = new THREE.SpriteMaterial({ 
                    map: tex, color: data.color, transparent: true
                });
                this.mesh = new THREE.Sprite(mat);
                this.mesh.position.copy(pos);
                this.mesh.scale.set(1, 1, 1);
                
                this.active = true;
                this.scene.add(this.mesh);

                this.light = new THREE.PointLight(data.color, 0.5, 3);
                this.mesh.add(this.light);
            }

            update(dt) {
                if (!this.active) return;
                if ((this.target.dead || this.target.isPhasing) && !this.data.aoe) {
                    this.active = false; 
                    this.scene.remove(this.mesh); 
                    return;
                }

                const targetPos = this.target.mesh.position.clone();
                targetPos.y += 1;
                const dir = new THREE.Vector3().subVectors(targetPos, this.mesh.position).normalize();
                this.mesh.position.add(dir.multiplyScalar(this.speed * dt));

                if (this.mesh.position.distanceTo(targetPos) < 1.0) {
                    this.hit();
                }
            }

            hit() {
                this.active = false;
                this.scene.remove(this.mesh);
                
                if (this.data.aoe) {
                    spawnParticles(this.mesh.position, this.data.color, 20);
                    sfx.playResonantRing();
                    entities.enemies.forEach(e => {
                        if (e.mesh.position.distanceTo(this.mesh.position) < this.data.aoe) {
                            e.takeDamage(this.data.damage, this.towerType);
                        }
                    });
                } else {
                    if (!this.target.dead && !this.target.isPhasing) {
                        this.target.takeDamage(this.data.damage, this.towerType);
                    }
                }
            }
        }

        function spawnParticles(pos, color, count) {
            const geo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
            const mat = new THREE.MeshBasicMaterial({ color: color });
            
            for(let i=0; i<count; i++) {
                const mesh = new THREE.Mesh(geo, mat);
                mesh.position.copy(pos);
                mesh.position.x += (Math.random()-0.5);
                mesh.position.z += (Math.random()-0.5);
                
                const vel = new THREE.Vector3(
                    (Math.random()-0.5) * 10,
                    (Math.random()) * 10,
                    (Math.random()-0.5) * 10
                );
                
                entities.particles.push({ mesh, vel, life: 1.0 });
                scene.add(mesh);
            }
        }

        function startWave() {
            if (gameState.isGameOver) return;
            
            if (gameState.wave > 1) {
                collapseTileWithTower();
            }
            
            const msg = document.getElementById('msg-area');
            msg.innerText = "WAVE " + gameState.wave;
            msg.style.opacity = 1;
            setTimeout(() => msg.style.opacity = 0, 2000);

            const level = LEVELS[gameState.levelIndex];
            const cfg = level.isSandbox ? gameState.sandboxConfig : null;

            let baseCount = cfg ? cfg.enemyCount : 5;
            let diffScale = cfg ? cfg.difficultyScale : 1.0;
            let total = Math.floor(baseCount + (gameState.wave - 1) * 1.5 * diffScale);
            
            if (cfg && cfg.maxWaves && gameState.wave > cfg.maxWaves) {
                victoryScreen();
                return;
            }
            
            const intervalTime = Math.max(200, 1500 - gameState.wave * 50);
            let count = 0;

            const spawner = setInterval(() => {
                if (gameState.isGameOver || isPaused) { 
                    if (gameState.isGameOver) clearInterval(spawner);
                    return;
                }
                
                let type = 'NORMAL';
                let isBalloon = level.isBalloonLevel || false;
                
                if (!isBalloon) {
                    if (cfg) {
                        const r = Math.random();
                        const totalMix = cfg.enemyMix.normal + cfg.enemyMix.speed + cfg.enemyMix.tank;
                        const normalThreshold = cfg.enemyMix.normal / totalMix;
                        const speedThreshold = normalThreshold + (cfg.enemyMix.speed / totalMix);
                        
                        if (r < normalThreshold) type = 'NORMAL';
                        else if (r < speedThreshold) type = 'SPEED';
                        else type = 'TANK';
                    } else {
                        const r = Math.random();
                        if (gameState.wave > 3 && r > 0.85) type = 'SPEED';
                        else if (gameState.wave > 5 && r > 0.9) type = 'TANK';
                        
                        if (gameState.wave >= 7) {
                            if (r < 0.05) type = 'ASSASSIN';
                            else if (r > 0.93 && r < 0.96) type = 'GHOST';
                            else if (r > 0.96 && r < 0.98) type = 'SPLITTER';
                        }
                        if (gameState.wave >= 10) {
                            if (r > 0.88 && r < 0.91) type = 'JUGGERNAUT';
                            else if (r > 0.98 && r < 0.99) type = 'HEALER';
                            else if (r > 0.99) type = 'NATRON';
                        }
                    }
                    
                    const bossInterval = cfg ? cfg.bossInterval : 5;
                    if (gameState.wave % bossInterval === 0 && count === total - 1) type = 'BOSS';
                }

                if (isBalloon) {
                    const size = Math.min(4, Math.floor(1 + gameState.wave * 0.3));
                    entities.enemies.push(new Enemy(type, true, size));
                } else {
                    entities.enemies.push(new Enemy(type));
                }
                
                count++;

                if (count >= total) {
                    clearInterval(spawner);
                    checkWaveEnd();
                }
            }, intervalTime);
        }

        
function checkWaveEnd() {
            const checker = setInterval(() => {
                if (entities.enemies.length === 0 && !gameState.isGameOver) {
                    clearInterval(checker);
                    gameState.wave++;
                    updateUI();
                    
                    const msg = document.getElementById('msg-area');
                    msg.innerText = "WAVE COMPLETE!";
                    msg.style.opacity = 1;
                    setTimeout(() => {
                        msg.style.opacity = 0;
                        startWave();
                    }, 2000);
                }
            }, 500);
        }

        function onPointerDown(e) {
            if (gameState.isGameOver) return;

            // Prüfe ob Klick auf UI-Element statt Canvas erfolgte
            if (e.target !== renderer.domElement) {
                return; // Klick war auf UI-Element, nicht auf Canvas
            }
            
            mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);

            const towerMeshes = [];
            entities.towers.forEach(t => {
                t.mesh.traverse(child => {
                    if (child.isMesh || child.isSprite) {
                        towerMeshes.push(child);
                    }
                });
            });

            const towerIntersects = raycaster.intersectObjects(towerMeshes, true);
            if (towerIntersects.length > 0) {
                let tower = null;
                let obj = towerIntersects[0].object;
                while (obj && !tower) {
                    if (obj.userData.tower) tower = obj.userData.tower;
                    obj = obj.parent;
                }
                
                if (tower) {
                    if (deleteMode) {
                        selectedTower = tower;
                        sellTower();
                    } else {
                        showTowerInfo(tower);
                    }
                    return;
                }
            }

            const intersects = raycaster.intersectObjects(entities.tiles);
            if (intersects.length > 0) {
                hideTowerInfo();
                
                const obj = intersects[0].object;
                
                if (obj.userData.collapsed) {
                    showTileInfo(obj);
                    return;
                }
                
                if (deleteMode) return;
                
                const typeData = TOWER_TYPES[gameState.selectedTowerType];
                const cost = typeData.baseCost;

                if (!obj.userData.isPath && !obj.userData.hasTower && gameState.money >= cost) {
                    gameState.money -= cost;
                    obj.userData.hasTower = true;
                    obj.material.color.setHex(0x111111);
                    
                    entities.towers.push(new Tower(obj.position.x, obj.position.z, gameState.selectedTowerType));
                    sfx.playBuild();
                    updateUI();
                } else if (gameState.money < cost) {
                    sfx.playError();
                }
            } else {
                hideTowerInfo();
            }
        }

        function updateUI() {
            document.getElementById('money-val').innerText = gameState.money;
            document.getElementById('lives-val').innerText = Math.max(0, gameState.lives * 5) + "%";
            document.getElementById('wave-val').innerText = gameState.wave;
        }

        function endGame() {
            gameState.isGameOver = true;
            saveHighscore();
            document.getElementById('final-score').innerText = "WAVES SURVIVED: " + (gameState.wave - 1);
            document.getElementById('game-over-screen').style.display = 'flex';
        }

        function victoryScreen() {
            gameState.isGameOver = true;
            saveHighscore();
            document.getElementById('victory-msg').innerText = "YOU SURVIVED ALL WAVES!";
            document.getElementById('victory-screen').style.display = 'flex';
        }

        function onResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        function init() {
            scene = new THREE.Scene();
            scene.fog = new THREE.FogExp2(0x000000, 0.012);

            camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.set(0, 30, 40);

            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            document.body.appendChild(renderer.domElement);

            controls = new OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.maxPolarAngle = Math.PI / 2 - 0.1;
            controls.minDistance = 10;
            controls.maxDistance = 80;

            ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
            scene.add(ambientLight);
            
            directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
            directionalLight.position.set(20, 50, 20);
            directionalLight.castShadow = true;
            directionalLight.shadow.mapSize.width = 2048;
            directionalLight.shadow.mapSize.height = 2048;
            directionalLight.shadow.camera.left = -50;
            directionalLight.shadow.camera.right = 50;
            directionalLight.shadow.camera.top = 50;
            directionalLight.shadow.camera.bottom = -50;
            scene.add(directionalLight);

            const fillLight = new THREE.DirectionalLight(0x4488ff, 0.3);
            fillLight.position.set(-20, 30, -20);
            scene.add(fillLight);

            const bgGeo = new THREE.PlaneGeometry(200, 200);
            const bgMesh = new THREE.Mesh(bgGeo, bgMaterial);
            bgMesh.rotation.x = -Math.PI / 2;
            bgMesh.position.y = -2;
            scene.add(bgMesh);

            matrixSkyDome = createMatrixSkyDome();
            scene.add(matrixSkyDome);

            // === SCHRITT 2: Nebel und Glitzer initialisieren ===
            fogCloudGroup = createFogClouds();
            scene.add(fogCloudGroup);

            glitterGroup = createGlitterParticles();
            scene.add(glitterGroup);
            // === END SCHRITT 2 ===

            raycaster = new THREE.Raycaster();
            mouse = new THREE.Vector2();

            window.addEventListener('resize', onResize);
            window.addEventListener('pointerdown', onPointerDown);
            loadHighscores();
            animate();
        }

        const clock = new THREE.Clock();

        function animate() {
            requestAnimationFrame(animate);

            const dt = isPaused ? 0 : clock.getDelta();
            const time = clock.getElapsedTime();

            bgUniforms.uTime.value = time;
            if (matrixSkyDome) {
                matrixSkyDome.userData.uniforms.uTime.value = time;
            }

            // === SCHRITT 3: Update Nebel und Glitzer ===
            if (!isPaused && !gameState.isGameOver) {
                updateFogClouds(dt, time);
                updateGlitterParticles(dt, time);
            }
            // === END SCHRITT 3 ===

            if (shake.amount > 0) {
                camera.position.x += (Math.random() - 0.5) * shake.amount;
                camera.position.y += (Math.random() - 0.5) * shake.amount;
                camera.position.z += (Math.random() - 0.5) * shake.amount;
                shake.amount = Math.max(0, shake.amount - (isPaused ? 0 : dt * 2));
            }
            controls.update();

            if (portalGateway && !gameState.isGameOver) {
                portalGateway.update(dt);
            }

            if (neuroCore && !gameState.isGameOver) {
                neuroCore.update(dt);
            }

            if (!gameState.isGameOver && !isPaused) {
                entities.enemies.forEach((e, i) => {
                    e.update(dt);
                    if (e.dead) entities.enemies.splice(i, 1);
                });

                entities.towers.forEach(t => t.update(dt));
                entities.projectiles.forEach((p, i) => {
                    p.update(dt);
                    if (!p.active) entities.projectiles.splice(i, 1);
                });
            }

            entities.particles.forEach((p, i) => {
                p.life -= (isPaused ? 0 : dt);
                p.vel.y -= (isPaused ? 0 : 20 * dt);
                p.mesh.position.add(p.vel.clone().multiplyScalar(isPaused ? 0 : dt));
                p.mesh.rotation.x += (isPaused ? 0 : dt * 5);
                p.mesh.scale.multiplyScalar(isPaused ? 1 : 0.95);
                if (p.life <= 0) {
                    scene.remove(p.mesh);
                    entities.particles.splice(i, 1);
                }
            });

            renderer.render(scene, camera);
        }

        init();