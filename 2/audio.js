// ========== AUDIO ENGINE MODULE ==========
import * as THREE from 'three';

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
                    osc.frequency.linearRampToValueAtTime(50, now + 0.5);
                    const lfo = this.ctx.createOscillator();
                    lfo.frequency.setValueAtTime(8, now);
                    const lfoGain = this.ctx.createGain();
                    lfoGain.gain.setValueAtTime(20, now);
                    lfo.connect(lfoGain);
                    lfoGain.connect(osc.frequency);
                    osc.connect(gainNode);
                    gainNode.gain.setValueAtTime(0.25, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
                    osc.start(now);
                    lfo.start(now);
                    osc.stop(now + 0.5);
                    lfo.stop(now + 0.5);
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
                    gainNode.gain.setValueAtTime(0.2, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
                    osc.start(now);
                    lfo.start(now);
                    osc.stop(now + 0.6);
                    lfo.stop(now + 0.6);
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
                    osc.frequency.linearRampToValueAtTime(90, now + 0.6);
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
                    gainNode.gain.setValueAtTime(0.25, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
                    osc.start(now);
                    lfo.start(now);
                    osc.stop(now + 0.6);
                    lfo.stop(now + 0.6);
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
                    gainNode.gain.setValueAtTime(0.25, now);
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

export { sfx };
