// ========== TILE CLASS WITH STACKING SUPPORT ==========
import * as THREE from 'three';
import { TILE_SIZE } from './config.js';
import { sfx } from './audio.js';

export class Tile {
    constructor(x, z, scene) {
        this.x = x;
        this.z = z;
        this.stackLevel = 1;
        this.tower = null;
        this.isPath = false;
        this.isCollapsed = false;

        this.mesh = new THREE.Group();
        this.mesh.position.set(x, 0, z);
        this.mesh.userData.tile = this;

        this.createGeometry();
        scene.add(this.mesh);
    }

    createGeometry() {
        while(this.mesh.children.length > 0) {
            this.mesh.remove(this.mesh.children[0]);
        }

        const baseHeight = 0.3 * this.stackLevel;
        const baseGeo = new THREE.BoxGeometry(TILE_SIZE * 0.95, baseHeight, TILE_SIZE * 0.95);

        let color, emissive, emissiveIntensity;
        if (this.stackLevel === 2) {
            color = 0xffaa00;
            emissive = 0xffaa00;
            emissiveIntensity = 0.3;
        } else {
            color = 0x333333;
            emissive = 0x000000;
            emissiveIntensity = 0;
        }

        const baseMat = new THREE.MeshStandardMaterial({ 
            color: color,
            emissive: emissive,
            emissiveIntensity: emissiveIntensity,
            metalness: 0.5,
            roughness: 0.7
        });

        this.baseMesh = new THREE.Mesh(baseGeo, baseMat);
        this.baseMesh.position.y = baseHeight / 2;
        this.mesh.add(this.baseMesh);

        if (this.stackLevel === 2) {
            const borderGeo = new THREE.BoxGeometry(TILE_SIZE * 0.98, baseHeight + 0.05, TILE_SIZE * 0.98);
            const borderMat = new THREE.MeshBasicMaterial({ color: 0xffcc00, wireframe: true, transparent: true, opacity: 0.5 });
            const border = new THREE.Mesh(borderGeo, borderMat);
            border.position.y = baseHeight / 2;
            this.mesh.add(border);

            this.light = new THREE.PointLight(0xffaa00, 0.5, 6);
            this.light.position.y = baseHeight + 0.5;
            this.mesh.add(this.light);
        }

        const edgeGeo = new THREE.EdgesGeometry(baseGeo);
        const edgeMat = new THREE.LineBasicMaterial({ color: 0x555555 });
        const edges = new THREE.LineSegments(edgeGeo, edgeMat);
        edges.position.y = baseHeight / 2;
        this.mesh.add(edges);
    }

    stackTile() {
        if (this.stackLevel >= 2) return false;
        if (this.tower) return false;
        this.stackLevel = 2;
        this.createGeometry();
        sfx.playBuild();
        return true;
    }

    damageStack() {
        if (this.stackLevel > 1) {
            this.stackLevel--;
            this.createGeometry();
            sfx.playCollapse();
            return false;
        } else {
            this.isCollapsed = true;
            if (this.tower) this.tower = null;
            this.mesh.visible = false;
            sfx.playCoreDestroy();
            return true;
        }
    }

    repair() {
        if (!this.isCollapsed) return false;
        this.isCollapsed = false;
        this.stackLevel = 1;
        this.mesh.visible = true;
        this.createGeometry();
        sfx.playHeal();
        return true;
    }

    update(dt) {
        if (this.stackLevel === 2 && this.light) {
            this.light.intensity = 0.5 + Math.sin(Date.now() * 0.003) * 0.2;
        }
    }
}
