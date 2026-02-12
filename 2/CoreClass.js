// ========== NEURO CORE CLASS ==========
import * as THREE from 'three';
import { TILE_SIZE } from './config.js';

export class NeuroCore {
            constructor(x, z) {
                this.group = new THREE.Group();
                this.health = 20;
                this.maxHealth = 20;
                this.destroyed = false;
                
                const coreGeo = new THREE.IcosahedronGeometry(2, 1);
                const coreMat = new THREE.MeshBasicMaterial({ 
                    color: 0x00ffff, wireframe: true, transparent: true, opacity: 0.8
                });
                this.coreMesh = new THREE.Mesh(coreGeo, coreMat);
                this.group.add(this.coreMesh);

                const innerCoreMat = new THREE.MeshBasicMaterial({ 
                    color: 0xffffff, transparent: true, opacity: 0.6
                });
                this.innerCore = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), innerCoreMat);
                this.group.add(this.innerCore);

                this.blocks = [];
                const blockGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
                const blockMat = new THREE.MeshStandardMaterial({
                    color: 0x111111, emissive: 0x00ffff, emissiveIntensity: 0.3,
                    metalness: 0.9, roughness: 0.1
                });

                for(let i = 0; i < 12; i++) {
                    const block = new THREE.Mesh(blockGeo, blockMat.clone());
                    const radius = 3 + Math.random() * 1;
                    const theta = (i / 12) * Math.PI * 2;
                    const phi = Math.PI / 4 + (Math.random() - 0.5) * 0.5;
                    block.position.setFromSphericalCoords(radius, phi, theta);
                    block.lookAt(0, 0, 0);
                    block.scale.set(1, 2 + Math.random() * 2, 1);
                    this.group.add(block);
                    this.blocks.push({ mesh: block, originalPos: block.position.clone(), offset: i * 0.5 });
                }

                this.cables = [];
                for(let i = 0; i < 6; i++) {
                    const cableGeo = new THREE.CylinderGeometry(0.1, 0.1, 3, 6);
                    const cableMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.6 });
                    const cable = new THREE.Mesh(cableGeo, cableMat);
                    const angle = (i / 6) * Math.PI * 2;
                    cable.position.set(Math.cos(angle) * 2, -2, Math.sin(angle) * 2);
                    cable.rotation.x = Math.PI / 6;
                    this.group.add(cable);
                    this.cables.push(cable);
                }

                this.light = new THREE.PointLight(0x00ffff, 2, 15);
                this.light.position.set(0, 2, 0);
                this.group.add(this.light);

                this.group.position.set(x * TILE_SIZE, 2, z * TILE_SIZE);
                this.animTime = 0;
                this.flashTime = 0;
                scene.add(this.group);
            }

            takeDamage() {
                if (this.destroyed) return;
                this.health--;
                this.flashTime = 0.3;
                sfx.playCoreHit();
                shake.amount = 0.8;

                const healthPct = this.health / this.maxHealth;
                const color = new THREE.Color().setHSL(healthPct * 0.5, 1, 0.5);
                this.coreMesh.material.color = color;
                this.light.color = color;
                this.blocks.forEach(b => { b.mesh.material.emissive = color; });

                if (this.health <= 0) this.destroy();
            }

            destroy() {
                this.destroyed = true;
                sfx.playCoreDestroy();
                shake.amount = 2;

                const growAnim = () => {
                    if (this.group.scale.x < 3) {
                        this.group.scale.multiplyScalar(1.02);
                        requestAnimationFrame(growAnim);
                    } else { endGame(); }
                };
                growAnim();

                this.coreMesh.material.color.setHex(0xff0000);
                this.innerCore.material.color.setHex(0xff0000);
                this.light.color.setHex(0xff0000);
                this.light.intensity = 5;
                this.blocks.forEach(b => {
                    b.mesh.material.emissive.setHex(0xff0000);
                    b.mesh.material.emissiveIntensity = 1;
                });
            }

            update(dt) {
                if (this.destroyed) { this.group.rotation.y += dt * 2; return; }
                this.animTime += dt;
                const pulse = 1 + Math.sin(this.animTime * 3) * 0.1;
                this.coreMesh.scale.setScalar(pulse);
                this.innerCore.scale.setScalar(pulse * 0.8);
                this.coreMesh.rotation.y += dt * 0.5;
                this.coreMesh.rotation.z += dt * 0.3;
                this.innerCore.rotation.y -= dt * 0.7;

                this.blocks.forEach(block => {
                    block.mesh.position.y = block.originalPos.y + Math.sin(this.animTime * 2 + block.offset) * 0.3;
                    block.mesh.rotation.y += dt * 0.5;
                });

                if (this.flashTime > 0) {
                    this.flashTime -= dt;
                    const flash = Math.sin(this.flashTime * 30) * 0.5 + 0.5;
                    this.coreMesh.material.opacity = 0.5 + flash * 0.5;
                    this.innerCore.material.opacity = 0.3 + flash * 0.7;
                    this.light.intensity = 2 + flash * 3;
                } else {
                    this.coreMesh.material.opacity = 0.8;
                    this.innerCore.material.opacity = 0.6;
                    this.light.intensity = 2;
                }
            }
        }
