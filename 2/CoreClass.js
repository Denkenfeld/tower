// ========== NEURO CORE CLASS ==========
import * as THREE from 'three';

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

        function createCharacter(type, scale, color, eyeColor) {
            const charGroup = new THREE.Group();
            const armorMat = new THREE.MeshStandardMaterial({ 
                color: color, metalness: 0.9, roughness: 0.1,
                emissive: color, emissiveIntensity: 0.3
            });

            let torsoScale = 1, limbScale = 1, headScale = 1;
            if (type === 'SPEED') { torsoScale = 0.7; limbScale = 1.3; headScale = 0.8; }
            else if (type === 'TANK') { torsoScale = 1.5; limbScale = 0.8; headScale = 1.2; }
            else if (type === 'BOSS') { torsoScale = 2; limbScale = 1.5; headScale = 1.8; }
            else if (type === 'ASSASSIN') { torsoScale = 0.6; limbScale = 1.5; headScale = 0.7; }
            else if (type === 'JUGGERNAUT') { torsoScale = 2.5; limbScale = 1.0; headScale = 1.5; }
            else if (type === 'GHOST') { torsoScale = 0.9; limbScale = 1.1; headScale = 1.0; }
            else if (type === 'HEALER') { torsoScale = 1.1; limbScale = 1.0; headScale = 1.1; }
            else if (type === 'SPLITTER') { torsoScale = 0.8; limbScale = 0.9; headScale = 0.9; }
            else if (type === 'NATRON') { torsoScale = 1.3; limbScale = 1.2; headScale = 1.3; }

            const torso = new THREE.Mesh(
                new THREE.CapsuleGeometry(0.35 * torsoScale * scale, 0.8 * scale, 8, 16), armorMat
            );
            torso.position.y = 0;
            torso.castShadow = true;
            charGroup.add(torso);

            const head = new THREE.Mesh(
                new THREE.SphereGeometry(0.25 * headScale * scale, 16, 16), armorMat
            );
            head.position.y = (0.4 + 0.25 * headScale) * scale;
            head.castShadow = true;
            torso.add(head);

            const eye = new THREE.Mesh(
                new THREE.BoxGeometry(0.35 * headScale * scale, 0.05 * scale, 0.1 * scale), 
                new THREE.MeshBasicMaterial({color: eyeColor})
            );
            eye.position.set(0, 0.05 * scale, 0.22 * headScale * scale);
            head.add(eye);

            const limbGeo = new THREE.CapsuleGeometry(0.12 * scale, 0.5 * limbScale * scale, 6, 6);
            const armL = new THREE.Mesh(limbGeo, armorMat);
            const armR = new THREE.Mesh(limbGeo, armorMat);
            armL.position.set(-0.5 * torsoScale * scale, 0, 0);
            armR.position.set(0.5 * torsoScale * scale, 0, 0);
            armL.castShadow = true;
            armR.castShadow = true;
            torso.add(armL, armR);

            const legL = new THREE.Mesh(limbGeo, armorMat);
            const legR = new THREE.Mesh(limbGeo, armorMat);
            legL.position.set(-0.2 * torsoScale * scale, (-0.4 - 0.25 * limbScale) * scale, 0);
            legR.position.set(0.2 * torsoScale * scale, (-0.4 - 0.25 * limbScale) * scale, 0);
            legL.castShadow = true;
            legR.castShadow = true;
            torso.add(legL, legR);

            charGroup.userData = { torso, head, armL, armR, legL, legR, type, scale, limbScale };
            return charGroup;
        }

        function collapseTileWithTower() {
            const towersOnTiles = entities.towers.filter(t => !t.isCollapsed);
            if (towersOnTiles.length === 0) return;

            const randomTower = towersOnTiles[Math.floor(Math.random() * towersOnTiles.length)];
            const tilePos = randomTower.mesh.position;
            
            const tile = entities.tiles.find(t => 
                Math.abs(t.position.x - tilePos.x) < 0.1 && 
                Math.abs(t.position.z - tilePos.z) < 0.1
            );

            if (tile && !tile.userData.collapsed) {
                collapseTile(tile, randomTower);
            }
        }

        function collapseTile(tile, tower) {
            tile.userData.collapsed = true;
            tile.userData.collapsedTower = tower;
            tower.isCollapsed = true;

            sfx.playCollapse();
            shake.amount = 1;

            const fallAnim = () => {
                if (tile.position.y > -10) {
                    tile.position.y -= 0.2;
                    tower.mesh.position.y -= 0.2;
                    requestAnimationFrame(fallAnim);
                } else {
                    tile.visible = false;
                    tower.mesh.visible = false;
                }
            };
            fallAnim();

            gameState.collapsedTiles.push({tile, tower});

            const msg = document.getElementById('msg-area');
            msg.innerText = "TILE COLLAPSED!";
            msg.style.opacity = 1;
            setTimeout(() => msg.style.opacity = 0, 2000);
        }

        window.repairTile = function() {
            if (!selectedTile || !selectedTile.userData.collapsed) return;
            
            const repairCost = 200;
            if (gameState.money < repairCost) {
                sfx.playError();
                return;
            }

            gameState.money -= repairCost;
            
            const collapsedData = gameState.collapsedTiles.find(c => c.tile === selectedTile);
            if (collapsedData) {
                selectedTile.userData.collapsed = false;
                selectedTile.userData.hasTower = false;
                selectedTile.userData.collapsedTower = null;
                selectedTile.visible = true;
                selectedTile.position.y = -0.5;
                selectedTile.material.color.setHex(0x444444);
                selectedTile.material.emissive.setHex(0x000000);
                selectedTile.material.emissiveIntensity = 0;

                const tower = collapsedData.tower;
                scene.remove(tower.mesh);
                const towerIndex = entities.towers.indexOf(tower);
                if (towerIndex > -1) entities.towers.splice(towerIndex, 1);

                const colIndex = gameState.collapsedTiles.indexOf(collapsedData);
                if (colIndex > -1) gameState.collapsedTiles.splice(colIndex, 1);

                sfx.playUpgrade();
                spawnParticles(selectedTile.position, 0x00ff00, 20);
            }

            hideTowerInfo();
            updateUI();
        }

        window.updateLighting = function(type, value) {
            value = parseFloat(value);
            if (type === 'ambient') {
                ambientLight.intensity = value / 100;
                document.getElementById('ambient-val').innerText = (value / 100).toFixed(2);
            } else if (type === 'directional') {
                directionalLight.intensity = value / 100;
                document.getElementById('dir-val').innerText = (value / 100).toFixed(2);
            } else if (type === 'hue') {
                const color = new THREE.Color().setHSL(value / 360, 1, 0.5);
                directionalLight.color = color;
                document.getElementById('hue-val').innerText = value + '°';
            }
        }

        window.updateGameSpeed = function(value) {
            gameSpeed = value / 100;
            document.getElementById('speed-val').innerText = gameSpeed.toFixed(1) + 'x';
        }

        window.togglePause = function() {
            isPaused = !isPaused;
            document.getElementById('pause-overlay').style.display = isPaused ? 'flex' : 'none';
            
            if (isPaused) {
                sfx.pauseBackgroundMusic();
            } else {
                sfx.resumeBackgroundMusic();
            }
            
            const btn = document.querySelector('.control-btn.pause');
            if (btn) btn.innerText = isPaused ? '▶️ RESUME' : '⏸️ PAUSE';
        }

        window.showMenu = function() {
            sfx.stopBackgroundMusic();
            
            entities.towers.forEach(t => scene.remove(t.mesh));
            entities.enemies.forEach(e => scene.remove(e.mesh));
            entities.tiles.forEach(t => scene.remove(t));
            if (neuroCore) scene.remove(neuroCore.group);
            if (portalGateway) scene.remove(portalGateway.group);
            
            entities.towers = [];
            entities.enemies = [];
            entities.projectiles = [];
            entities.tiles = [];
            gameState.collapsedTiles = [];
            neuroCore = null;
            portalGateway = null;
            isPaused = false;
            gameState.isGameOver = true;
            
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
            const btn = document.querySelectorAll('.tower-btn')[3];
            
            if (deleteMode) {
                btn.classList.add('delete-mode');
                document.querySelectorAll('.tower-btn').forEach((b, i) => {
                    if (i < 3) b.classList.add('disabled');
                });
            } else {
                btn.classList.remove('delete-mode');
                applyTowerRestrictions();
            }
            hideTowerInfo();
        }

        function showTowerInfo(tower) {
            selectedTower = tower;
            selectedTile = null;
            const panel = document.getElementById('tower-info-panel');
            const typeData = TOWER_TYPES[tower.typeIndex];
            const currentUpgrade = typeData.upgrades[tower.level];
            
            document.getElementById('tower-info-name').innerText = typeData.name + ' HACKER';
            document.getElementById('tower-info-level').innerText = 'Level: ' + (tower.level + 1) + '/' + typeData.upgrades.length;
            document.getElementById('tower-info-damage').innerText = 'Damage: ' + currentUpgrade.damage;
            document.getElementById('tower-info-range').innerText = 'Range: ' + currentUpgrade.range;
            document.getElementById('tower-info-rate').innerText = 'Fire Rate: ' + currentUpgrade.rate + 's';
            
            const upgradeBtn = document.getElementById('upgrade-btn');
            if (tower.level < typeData.upgrades.length - 1) {
                const nextUpgrade = typeData.upgrades[tower.level + 1];
                upgradeBtn.innerText = `UPGRADE (${nextUpgrade.cost} CR)`;
                upgradeBtn.disabled = gameState.money < nextUpgrade.cost;
            } else {
                upgradeBtn.innerText = 'MAX LEVEL';
                upgradeBtn.disabled = true;
            }
            
            const sellValue = Math.floor(tower.getTotalCost() * 0.7);
            document.querySelector('.sell-btn').innerText = `SELL (${sellValue} CR)`;
            
            document.getElementById('repair-btn').style.display = 'none';
            panel.style.display = 'block';
        }

        function showTileInfo(tile) {
            selectedTile = tile;
            selectedTower = null;
            const panel = document.getElementById('tower-info-panel');
            
            document.getElementById('tower-info-name').innerText = 'COLLAPSED TILE';
            document.getElementById('tower-info-level').innerText = 'Status: Destroyed';
            document.getElementById('tower-info-damage').innerText = '';
            document.getElementById('tower-info-range').innerText = '';
            document.getElementById('tower-info-rate').innerText = '';
            
            document.getElementById('upgrade-btn').style.display = 'none';
            document.querySelector('.sell-btn').style.display = 'none';
            
            const repairBtn = document.getElementById('repair-btn');
            repairBtn.style.display = 'block';
            repairBtn.disabled = gameState.money < 200;
            
            panel.style.display = 'block';
        }

        function hideTowerInfo() {
            selectedTower = null;
            selectedTile = null;
            document.getElementById('tower-info-panel').style.display = 'none';
            document.getElementById('upgrade-btn').style.display = 'block';
            document.querySelector('.sell-btn').style.display = 'block';
            document.getElementById('repair-btn').style.display = 'none';
        }

        function upgradeTower() {
            if (!selectedTower) return;

            const typeData = TOWER_TYPES[selectedTower.type];

            if (selectedTower.level >= typeData.upgrades.length - 1) {
                return; // Already max level
            }

            const nextUpgrade = typeData.upgrades[selectedTower.level + 1];

            if (gameState.money >= nextUpgrade.cost) {
                gameState.money -= nextUpgrade.cost;
                selectedTower.level++;
                selectedTower.damage = nextUpgrade.damage;
                selectedTower.range = nextUpgrade.range;
                selectedTower.fireRate = nextUpgrade.rate;

                sfx.playBuild();
                showTowerInfo(selectedTower);
                updateUI();
            } else {
                sfx.playError();
            }
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
            } else {
                sfx.playError();
            }
        }

        window.sellTower = function() {
            if (!selectedTower) return;
            const sellValue = Math.floor(selectedTower.getTotalCost() * 0.7);
            gameState.money += sellValue;
            
            const tilePos = selectedTower.mesh.position;
            const tile = entities.tiles.find(t => 
                Math.abs(t.position.x - tilePos.x) < 0.1 && 
                Math.abs(t.position.z - tilePos.z) < 0.1
            );
            if (tile) {
                tile.userData.hasTower = false;
                tile.material.color.setHex(0x444444);
            }
            
            scene.remove(selectedTower.mesh);
            const index = entities.towers.indexOf(selectedTower);
            if (index > -1) entities.towers.splice(index, 1);
            
            hideTowerInfo();
            updateUI();
            sfx.playError();
        }

        function saveHighscore() {
            const scores = JSON.parse(localStorage.getItem('highscores') || '[]');
            const levelName = gameState.levelIndex === 4 ? 'Sandbox' : `Level ${gameState.levelIndex + 1}`;
            scores.push({
                level: levelName,
                wave: gameState.wave - 1,
                date: new Date().toLocaleDateString()
            });
            scores.sort((a, b) => b.wave - a.wave);
            scores.splice(10);
            localStorage.setItem('highscores', JSON.stringify(scores));
        }

        function loadHighscores() {
            const scores = JSON.parse(localStorage.getItem('highscores') || '[]');
            const container = document.getElementById('highscore-list');
            container.innerHTML = '';
            if (scores.length === 0) {
                container.innerHTML = '<div style="color:#666; text-align:center; padding:20px;">No scores yet</div>';
                return;
            }
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
            texHex = createCharTexture('⬡', '#00ffff');
            
            document.getElementById('start-screen').style.display = 'none';
            document.getElementById('sandbox-setup-screen').style.display = 'none';

            gameState.levelIndex = lvlIndex;
            gameState.wave = 1;
            gameState.isGameOver = false;
            gameState.collapsedTiles = [];
            isPaused = false;
            deleteMode = false;
            selectedTower = null;
            selectedTile = null;

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

            const levelColor = level.color;
            bgUniforms.uColor.value.set(levelColor.r, levelColor.g, levelColor.b);
            
            entities.towers.forEach(t => scene.remove(t.mesh));
            entities.enemies.forEach(e => scene.remove(e.mesh));
            entities.tiles.forEach(t => scene.remove(t));
            if (neuroCore) scene.remove(neuroCore.group);
            if (portalGateway) scene.remove(portalGateway.group);
            
            entities.towers = [];
            entities.enemies = [];
            entities.projectiles = [];
            entities.tiles = [];

            createGrid(level);
            
            const startPoint = level.path[0];
            portalGateway = new PortalGateway(startPoint.x, startPoint.z);
            
            const endPoint = level.path[level.path.length - 1];
            neuroCore = new NeuroCore(endPoint.x, endPoint.z);
            
            updateUI();
            applyTowerRestrictions();
            
            document.getElementById('build-menu').style.display = 'flex';
            document.getElementById('game-controls').style.display = 'flex';
            document.getElementById('light-panel').style.display = 'block';
            document.getElementById('tower-info-panel').style.display = 'none';
            
            startWave();
        }

        function applyTowerRestrictions() {
            document.querySelectorAll('.tower-btn').forEach((btn, i) => {
                if (i < 3) btn.classList.remove('disabled');
            });
        }

        window.selectTower = function(index) {
            gameState.selectedTowerType = index;
            document.querySelectorAll('.tower-btn').forEach((b, i) => {
                if (i < 3) b.classList.toggle('selected', i === index);
            });
            if (deleteMode) toggleDeleteMode();
            sfx.playBuild();
        }

        function createGrid(levelData) {
            const geo = new THREE.BoxGeometry(TILE_SIZE - 0.2, 1, TILE_SIZE - 0.2);
            const pathPoints = levelData.path;

            for (let x = -12; x <= 12; x++) {
                for (let z = -12; z <= 12; z++) {
                    const isPath = checkPath(x, z, pathPoints);
                    
                    const mat = new THREE.MeshStandardMaterial({
                        color: isPath ? 0x333333 : 0x444444,
                        emissive: isPath ? levelData.color.getHex() : 0x000000,
                        emissiveIntensity: isPath ? 0.3 : 0,
                        roughness: 0.3,
                        metalness: 0.7
                    });

                    const mesh = new THREE.Mesh(geo, mat);
                    mesh.position.set(x * TILE_SIZE, -0.5, z * TILE_SIZE);
                    mesh.receiveShadow = true;
                    mesh.castShadow = true;
                    
                    mesh.userData = { 
                        isPath, gridX: x, gridZ: z, hasTower: false,
                        collapsed: false, collapsedTower: null
                    };
                    
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
            constructor(type, isBalloon = false, balloonSize = 3) {
                this.type = type;
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
                this.animTime = Math.random() * 100;
                this.reward = this.reward || 15;
                
                if (!isBalloon || balloonSize > 1) {
                    const barGeo = new THREE.PlaneGeometry(2, 0.2);
                    const barMat = new THREE.MeshBasicMaterial({color: 0x00ff00});
                    this.hpBar = new THREE.Mesh(barGeo, barMat);
                    this.hpBar.position.y = charScale * 2.5;
                    this.mesh.add(this.hpBar);
                }
                scene.add(this.mesh);
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

                scene.add(this.mesh);
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
                scene.add(this.mesh);

                this.light = new THREE.PointLight(data.color, 0.5, 3);
                this.mesh.add(this.light);
            }

            update(dt) {
                if (!this.active) return;
                if ((this.target.dead || this.target.isPhasing) && !this.data.aoe) {
                    this.active = false; 
                    scene.remove(this.mesh); 
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
                scene.remove(this.mesh);
                
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