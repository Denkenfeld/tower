// ========== ENHANCED ENEMY CLASS WITH SLOW EFFECTS ==========
import * as THREE from 'three';
import { LEVELS } from './levels.js';

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
                
                const cfg = LEVELS[this.gameState.levelIndex].isSandbox ? this.gameState.sandboxConfig : null;
                const scale = cfg ? cfg.difficultyScale : 1.0;
                
                let hp = (30 + this.gameState.wave * 15) * scale;
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
                
                const start = LEVELS[this.gameState.levelIndex].path[0];
                const yOffset = isBalloon ? charScale + 0.5 : charScale * 1.5;
                this.mesh.position.set(start.x * TILE_SIZE, yOffset, start.z * TILE_SIZE);
                
                this.hp = hp;
                this.maxHp = hp;
                this.speed = speed;
                this.pathIndex = 0;
                this.dead = false;
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
                
                const path = LEVELS[this.gameState.levelIndex].path;
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
                    this.shake.amount = this.isBalloon ? 0.1 : 0.3;
                    this.scene.remove(this.mesh);
                }
            }

            hitBase() {
                this.dead = true;
                this.scene.remove(this.mesh);
                if (neuroCore && !neuroCore.destroyed) this.neuroCore.takeDamage();
                this.gameState.lives--;
                updateUI();
            }
        }