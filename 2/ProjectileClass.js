// ========== ENHANCED PROJECTILE CLASS ==========
import * as THREE from 'three';



export class Projectile {
    constructor(pos, target, data, speed, towerType, scene, entities) {
        this.pos = pos.clone();
        this.target = target;
        this.data = data;
        this.speed = speed;
        this.towerType = towerType;
        this.active = true;
        this.scene = scene;
        this.entities = entities;
        this.isBeam = data.beam || false;
        this.spreadAngle = 0;
        this.chainCount = 0;
        this.chainRange = data.chainRange || 8;
        this.chainedEnemies = [];
        this.pierceCount = 0;
        this.piercedEnemies = [];

        if (this.isBeam) {
            const lineMat = new THREE.LineBasicMaterial({ color: data.color, linewidth: 3, transparent: true, opacity: 0.9 });
            this.mesh = new THREE.Line(new THREE.BufferGeometry(), lineMat);
            this.beamLife = 0.15;
        } else {
            const tex = Math.random() > 0.5 ? texZero : texOne;
            const mat = new THREE.SpriteMaterial({ map: tex, color: data.color, transparent: true, blending: THREE.AdditiveBlending });
            this.mesh = new THREE.Sprite(mat);
            const size = data.aoe ? 1.5 : data.slow ? 1.2 : 0.8;
            this.mesh.scale.set(size, size, size);
            this.mesh.position.copy(pos);
            this.light = new THREE.PointLight(data.color, 0.5, 5);
            this.mesh.add(this.light);
        }
        scene.add(this.mesh);
    }

    update(dt) {
        if (!this.active) return;
        if (this.isBeam) {
            this.beamLife -= dt;
            if (this.beamLife <= 0) { this.active = false; this.scene.remove(this.mesh); return; }
            if (!this.target.dead && !this.target.isPhasing) {
                const targetPos = this.target.mesh.position.clone(); targetPos.y += 1;
                this.mesh.geometry.setFromPoints([this.pos, targetPos]);
                if (this.mesh.geometry.attributes.position) this.mesh.geometry.attributes.position.needsUpdate = true;
            }
            return;
        }
        if (this.target.dead || this.target.isPhasing) {
            if (!this.data.aoe) { this.active = false; this.scene.remove(this.mesh); return; }
        }
        const targetPos = this.target.mesh.position.clone(); targetPos.y += 1;
        let dir = new THREE.Vector3().subVectors(targetPos, this.mesh.position).normalize();
        if (this.spreadAngle !== 0) {
            dir.applyMatrix4(new THREE.Matrix4().makeRotationY(this.spreadAngle));
        }
        this.mesh.position.add(dir.multiplyScalar(this.speed * dt));
        if (this.mesh.position.distanceTo(targetPos) < 1.0) this.hit();
    }

    hit() {
        if (!this.target.dead) {
            this.target.takeDamage(this.data.damage, this.towerType);
            if (this.data.slow) { this.target.slowFactor = this.data.slow; this.target.slowDuration = this.data.slowDuration || 2; }
            if (this.data.aoe) {
                const aoeEnemies = this.entities.enemies.filter(e => {
                    if (e === this.target || e.dead || e.isPhasing) return false;
                    return e.mesh.position.distanceTo(this.target.mesh.position) <= this.data.aoe;
                });
                aoeEnemies.forEach(e => { e.takeDamage(this.data.damage * 0.7, this.towerType); if (this.data.slow) { e.slowFactor = this.data.slow; e.slowDuration = this.data.slowDuration || 2; } });
                const aoeMesh = new THREE.Mesh(new THREE.SphereGeometry(this.data.aoe, 16, 16), new THREE.MeshBasicMaterial({ color: this.data.color, transparent: true, opacity: 0.4, wireframe: true }));
                aoeMesh.position.copy(this.target.mesh.position);
                this.scene.add(aoeMesh);
                setTimeout(() => this.scene.remove(aoeMesh), 200);
            }
            if (this.chainCount > 0 && this.chainedEnemies.length < (this.data.chain || 1)) {
                const nearbyEnemies = this.entities.enemies.filter(e => {
                    if (e.dead || e.isPhasing || this.chainedEnemies.includes(e)) return false;
                    return e.mesh.position.distanceTo(this.target.mesh.position) <= this.chainRange;
                });
                if (nearbyEnemies.length > 0) {
                    const nextTarget = nearbyEnemies[0]; this.chainedEnemies.push(nextTarget);
                    const chainLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints([this.target.mesh.position.clone(), nextTarget.mesh.position.clone()]), new THREE.LineBasicMaterial({ color: this.data.color, linewidth: 2 }));
                    this.scene.add(chainLine); setTimeout(() => this.scene.remove(chainLine), 150);
                    this.target = nextTarget; this.chainCount--; this.pos = this.mesh.position.clone(); return;
                }
            }
            if (this.pierceCount > 0 && !this.piercedEnemies.includes(this.target)) {
                this.piercedEnemies.push(this.target); this.pierceCount--;
                const dir = new THREE.Vector3().subVectors(this.target.mesh.position, this.pos).normalize();
                const nextEnemies = this.entities.enemies.filter(e => {
                    if (e.dead || e.isPhasing || this.piercedEnemies.includes(e)) return false;
                    const toEnemy = new THREE.Vector3().subVectors(e.mesh.position, this.target.mesh.position);
                    const dist = toEnemy.length(); toEnemy.normalize();
                    return dir.dot(toEnemy) > 0.7 && dist < 10;
                });
                if (nextEnemies.length > 0) { this.target = nextEnemies[0]; return; }
            }
        }
        this.active = false; this.scene.remove(this.mesh);
    }
}
