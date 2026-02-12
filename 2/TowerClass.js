// ========== ENHANCED TOWER CLASS WITH 6 UNIQUE SHAPES ==========
import * as THREE from 'three';
import { TOWER_TYPES } from './towerTypes.js';
import { Projectile } from './ProjectileClass.js';
import { sfx } from './audio.js';

export class Tower {
    constructor(x, z, typeIndex, scene, entities, gameState, getIsPaused) {
        this.typeIndex = typeIndex;
        this.level = 0;
        this.typeData = TOWER_TYPES[typeIndex];
        this.data = this.typeData.upgrades[0];
        this.scene = scene;
        this.entities = entities;
        this.gameState = gameState;
        this.getIsPaused = getIsPaused;

        this.mesh = new THREE.Group();
        this.mesh.position.set(x, 1, z);
        this.mesh.userData.tower = this;

        this.createGeometry();
        this.cooldown = 0;
        this.animTime = 0;
    }

    createGeometry() {
        while(this.mesh.children.length > 0) this.mesh.remove(this.mesh.children[0]);
        const size = 0.8 + this.level * 0.25;
        const shape = this.typeData.shape;
        const color = this.data.color;

        if (shape === 'sniper') {
            const spireMat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.5, metalness: 0.8, roughness: 0.2 });
            this.core = new THREE.Mesh(new THREE.ConeGeometry(0.3 * size, 2.5 * size, 6), spireMat);
            this.core.position.y = 1.2 * size;
            this.mesh.add(this.core);
            for (let i = 0; i < 2 + this.level; i++) {
                const ring = new THREE.Mesh(new THREE.TorusGeometry(0.4 + i * 0.15, 0.03, 8, 16), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.6 }));
                ring.rotation.x = Math.PI / 2; ring.position.y = 0.3 + i * 0.3;
                this.mesh.add(ring); this['ring' + i] = ring;
            }
        } else if (shape === 'cannon') {
            const barrelMat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.4, metalness: 0.6, roughness: 0.4 });
            this.core = new THREE.Mesh(new THREE.CylinderGeometry(0.7 * size, 0.5 * size, 1.2 * size, 8), barrelMat);
            this.core.position.y = 0.8 * size;
            this.mesh.add(this.core);
            const barrelCount = 3 + this.level * 2;
            this.barrels = [];
            for (let i = 0; i < barrelCount; i++) {
                const angle = (i / barrelCount) * Math.PI * 2;
                const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.08, 0.8, 6), barrelMat);
                barrel.position.x = Math.cos(angle) * 0.5 * size;
                barrel.position.z = Math.sin(angle) * 0.5 * size;
                barrel.position.y = 1.2 * size;
                this.mesh.add(barrel); this.barrels.push(barrel);
            }
        } else if (shape === 'sphere') {
            this.core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.8 * size, 1), new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.6, metalness: 0.4, roughness: 0.6 }));
            this.core.position.y = size;
            this.mesh.add(this.core);
            if (this.level >= 1) {
                this.shell = new THREE.Mesh(new THREE.IcosahedronGeometry(size, 1), new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.4 }));
                this.shell.position.y = size;
                this.mesh.add(this.shell);
            }
            const particleGeo = new THREE.BufferGeometry();
            const positions = new Float32Array((20 + this.level * 10) * 3);
            for (let i = 0; i < positions.length; i++) positions[i] = (Math.random() - 0.5) * 2 * size;
            particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            this.particles = new THREE.Points(particleGeo, new THREE.PointsMaterial({ color, size: 0.15, transparent: true, opacity: 0.8 }));
            this.particles.position.y = size;
            this.mesh.add(this.particles);
        } else if (shape === 'laser') {
            this.core = new THREE.Mesh(new THREE.OctahedronGeometry(0.6 * size, 0), new THREE.MeshPhysicalMaterial({ color, emissive: color, emissiveIntensity: 0.7, metalness: 0.1, roughness: 0.1, transmission: 0.9, thickness: 0.5 }));
            this.core.position.y = 1.2 * size;
            this.mesh.add(this.core);
            for (let i = 0; i < 1 + this.level; i++) {
                const lens = new THREE.Mesh(new THREE.RingGeometry(0.3 + i * 0.2, 0.35 + i * 0.2, 16), new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.7 }));
                lens.position.y = 0.5 + i * 0.4;
                this.mesh.add(lens); this['lens' + i] = lens;
            }
        } else if (shape === 'ring') {
            this.core = new THREE.Mesh(new THREE.CylinderGeometry(0.4 * size, 0.5 * size, 0.3 * size, 8), new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.3 }));
            this.core.position.y = 0.3 * size;
            this.mesh.add(this.core);
            this.fieldRings = [];
            for (let i = 0; i < 3 + this.level; i++) {
                const ring = new THREE.Mesh(new THREE.TorusGeometry((0.8 + i * 0.3) * size, 0.04, 8, 32), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5 - i * 0.08 }));
                ring.rotation.x = Math.PI / 2; ring.position.y = 0.5 + i * 0.15;
                this.mesh.add(ring); this.fieldRings.push(ring);
            }
        } else if (shape === 'coil') {
            const coilMat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.5, metalness: 0.9, roughness: 0.3 });
            this.core = new THREE.Mesh(new THREE.CylinderGeometry(0.2 * size, 0.4 * size, 1.8 * size, 8), coilMat);
            this.core.position.y = size;
            this.mesh.add(this.core);
            this.coils = [];
            for (let i = 0; i < 5 + this.level * 2; i++) {
                const angle = (i / (5 + this.level * 2)) * Math.PI * 4;
                const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshBasicMaterial({ color }));
                sphere.position.x = Math.cos(angle) * 0.4 * size;
                sphere.position.z = Math.sin(angle) * 0.4 * size;
                sphere.position.y = 0.3 + (i / (5 + this.level * 2)) * 1.6 * size;
                this.mesh.add(sphere); this.coils.push(sphere);
            }
            if (this.level >= 1) {
                this.spark = new THREE.Mesh(new THREE.SphereGeometry(0.25 * size, 8, 8), new THREE.MeshBasicMaterial({ color }));
                this.spark.position.y = 2 * size;
                this.mesh.add(this.spark);
            }
        }

        if (this.level >= 2) {
            this.shield = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.05, 8, 32), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.3 }));
            this.shield.rotation.x = Math.PI / 3; this.shield.position.y = 1;
            this.mesh.add(this.shield);
        }

        this.light = new THREE.PointLight(color, 1, 8);
        this.light.position.y = 1.5;
        this.mesh.add(this.light);
    }

    update(dt) {
        if (this.getIsPaused() || this.gameState.isGameOver) return;
        this.animTime += dt;
        this.cooldown -= dt;
        const shape = this.typeData.shape;

        if (shape === 'sniper') {
            for (let i = 0; i < 2 + this.level; i++) {
                if (this['ring' + i]) {
                    this['ring' + i].rotation.z = this.animTime * (1 + i * 0.3);
                    this['ring' + i].position.y = 0.3 + i * 0.3 + Math.sin(this.animTime * 2 + i) * 0.1;
                }
            }
            if (this.core) this.core.rotation.y = this.animTime * 0.5;
        } else if (shape === 'cannon' && this.barrels) {
            this.barrels.forEach((barrel, i) => { barrel.scale.y = 1 + Math.sin(this.animTime * 3 + i) * 0.1; });
            if (this.core) this.core.rotation.y = this.animTime * 0.8;
        } else if (shape === 'sphere') {
            if (this.core) this.core.scale.setScalar(1 + Math.sin(this.animTime * 2) * 0.1);
            if (this.shell) { this.shell.rotation.y = this.animTime; this.shell.rotation.x = this.animTime * 0.7; }
            if (this.particles) this.particles.rotation.y = this.animTime * 2;
        } else if (shape === 'laser') {
            if (this.core) { this.core.rotation.y = this.animTime * 1.5; this.core.rotation.x = this.animTime * 0.8; }
            for (let i = 0; i < 1 + this.level; i++) {
                if (this['lens' + i]) this['lens' + i].rotation.z = this.animTime * (2 + i);
            }
        } else if (shape === 'ring' && this.fieldRings) {
            this.fieldRings.forEach((ring, i) => {
                const wave = Math.sin(this.animTime * 2 - i * 0.5) * 0.5 + 0.5;
                ring.scale.setScalar(1 + wave * 0.3);
                ring.material.opacity = 0.3 + wave * 0.3;
            });
        } else if (shape === 'coil') {
            if (this.coils) this.coils.forEach((coil, i) => { coil.scale.setScalar(1 + Math.sin(this.animTime * 5 + i * 0.3) * 0.3); });
            if (this.spark) this.spark.scale.setScalar(1 + Math.sin(this.animTime * 4) * 0.2);
        }

        if (this.shield) this.shield.rotation.z += dt * 2;
        if (this.cooldown <= 0) this.attemptFire();
    }

    attemptFire() {
        const targets = this.entities.enemies.filter(e => {
            if (e.dead || e.isPhasing) return false;
            return this.mesh.position.distanceTo(e.mesh.position) <= this.data.range;
        });
        if (targets.length === 0) return;

        let target;
        if (this.typeData.shape === 'sniper') {
            target = targets.reduce((best, e) => e.pathIndex > best.pathIndex ? e : best, targets[0]);
        } else if (this.typeData.shape === 'laser') {
            target = targets.reduce((best, e) => {
                const d1 = this.mesh.position.distanceTo(e.mesh.position);
                const d2 = this.mesh.position.distanceTo(best.mesh.position);
                return d1 < d2 ? e : best;
            }, targets[0]);
        } else {
            target = targets[0];
        }

        this.fire(target);
        this.cooldown = this.data.rate;
    }

    fire(target) {
        const data = this.data;
        const speed = this.typeData.projectileSpeed;
        const pos = this.mesh.position.clone();
        pos.y += 1.5;

        if (data.scatter) {
            const spreadAngle = data.spread || 0.3;
            for (let i = 0; i < data.scatter; i++) {
                const angle = (i - (data.scatter - 1) / 2) * spreadAngle;
                const proj = new Projectile(pos.clone(), target, data, speed, this.typeIndex, this.scene, this.entities);
                proj.spreadAngle = angle;
                this.entities.projectiles.push(proj);
            }
            sfx.playSonicWave();
        } else if (data.beam) {
            const proj = new Projectile(pos, target, data, speed, this.typeIndex, this.scene, this.entities);
            proj.isBeam = true;
            proj.pierceCount = (data.pierce || 1) - 1;
            this.entities.projectiles.push(proj);
            sfx.playTremoloWave();
        } else if (data.chain) {
            const proj = new Projectile(pos, target, data, speed, this.typeIndex, this.scene, this.entities);
            proj.chainCount = (data.chain || 1) - 1;
            proj.chainRange = data.chainRange || 8;
            proj.chainedEnemies = [target];
            this.entities.projectiles.push(proj);
            sfx.playResonantRing();
        } else {
            const proj = new Projectile(pos, target, data, speed, this.typeIndex, this.scene, this.entities);
            this.entities.projectiles.push(proj);
            sfx.playSonicWave();
        }
    }

    upgrade() {
        if (this.level >= this.typeData.upgrades.length - 1) return false;
        const nextData = this.typeData.upgrades[this.level + 1];
        if (this.gameState.money >= nextData.cost) {
            this.gameState.money -= nextData.cost;
            this.level++;
            this.data = nextData;
            this.createGeometry();
            this.mesh.scale.set(0.1, 0.1, 0.1);
            const targetScale = 1 + this.level * 0.1;
            const scaleUp = () => {
                if (this.mesh.scale.x < targetScale) {
                    this.mesh.scale.addScalar(0.05);
                    requestAnimationFrame(scaleUp);
                }
            };
            scaleUp();
            sfx.playUpgrade();
            return true;
        }
        return false;
    }

    getTotalCost() {
        let total = this.typeData.baseCost;
        for (let i = 0; i <= this.level; i++) {
            total += this.typeData.upgrades[i].cost;
        }
        return total;
    }
}
