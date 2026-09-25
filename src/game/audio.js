// All audio is synthesised with the Web Audio API, so there are no audio files to ship.
// If audio is blocked or unavailable, every call quietly does nothing and the game still works.
import { mulberry32 } from './canvasUtil.js';

const midiToFreq = (m) => 440 * Math.pow(2, (m - 69) / 12);

// Each theme: a scale (semitones above root), root note, tempo, waveform and mood.
const THEMES = {
  menu: { root: 60, scale: [0, 2, 4, 7, 9], bpm: 84, wave: 'triangle', seed: 1, rest: 0.25 },
  town: { root: 62, scale: [0, 2, 4, 7, 9], bpm: 96, wave: 'triangle', seed: 2, rest: 0.2 },
  market: { root: 64, scale: [0, 2, 4, 5, 7, 9], bpm: 116, wave: 'square', seed: 3, rest: 0.15, quiet: 0.6 },
  beach: { root: 65, scale: [0, 2, 4, 7, 9], bpm: 78, wave: 'sine', seed: 4, rest: 0.35 },
  forest: { root: 57, scale: [0, 2, 3, 7, 9], bpm: 70, wave: 'triangle', seed: 5, rest: 0.4 },
  museum: { root: 60, scale: [0, 2, 4, 7, 11], bpm: 66, wave: 'sine', seed: 6, rest: 0.4 },
  harbor: { root: 59, scale: [0, 2, 5, 7, 9], bpm: 88, wave: 'triangle', seed: 7, rest: 0.3 },
  city: { root: 63, scale: [0, 3, 5, 7, 10], bpm: 108, wave: 'square', seed: 8, rest: 0.2, quiet: 0.6 },
  dark: { root: 52, scale: [0, 1, 3, 7, 8], bpm: 56, wave: 'sine', seed: 9, rest: 0.55 },
  ruins: { root: 55, scale: [0, 2, 3, 6, 7], bpm: 60, wave: 'triangle', seed: 10, rest: 0.5 },
  secret: { root: 67, scale: [0, 2, 4, 7, 9], bpm: 72, wave: 'sine', seed: 11, rest: 0.3 },
  final: { root: 65, scale: [0, 2, 4, 7, 9], bpm: 92, wave: 'triangle', seed: 12, rest: 0.15 },
};

const CHORD_ROOTS = [0, -3, -5, -2]; // gentle progression, in semitones

class AudioManager {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.musicVol = 0.5;
    this.sfxVol = 0.7;
    this.theme = null;
    this.pendingTheme = null;
    this.timer = null;
    this.nextTime = 0;
    this.step = 0;
    this.melody = [];
    this.noiseBuf = null;
  }

  // Browsers only allow audio after a user gesture, so this is called on the first key press / click.
  unlock() {
    if (typeof window === 'undefined') return;
    try {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.master.gain.value = 1;
        this.master.connect(this.ctx.destination);
        this.musicGain = this.ctx.createGain();
        this.sfxGain = this.ctx.createGain();
        this.musicGain.connect(this.master);
        this.sfxGain.connect(this.master);
        this.applyVolumes();
        if (this.pendingTheme) {
          const t = this.pendingTheme;
          this.theme = null;
          this.music(t);
        }
      }
      if (this.ctx.state === 'suspended') this.ctx.resume();
    } catch {
      this.ctx = null;
    }
  }

  setVolumes(music, sfx) {
    this.musicVol = Math.max(0, Math.min(1, music));
    this.sfxVol = Math.max(0, Math.min(1, sfx));
    this.applyVolumes();
  }

  applyVolumes() {
    if (!this.ctx) return;
    this.musicGain.gain.value = this.musicVol * 0.22;
    this.sfxGain.gain.value = this.sfxVol * 0.5;
  }

  // ---------------------------------------------------------------- building blocks
  tone(freq, dur, { type = 'square', vol = 0.3, delay = 0, slide = 0, dest = null } = {}) {
    if (!this.ctx) return;
    try {
      const t0 = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      if (slide) osc.frequency.linearRampToValueAtTime(Math.max(30, freq + slide), t0 + dur);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(g);
      g.connect(dest || this.sfxGain);
      osc.start(t0);
      osc.stop(t0 + dur + 0.05);
    } catch {
      /* ignore */
    }
  }

  noise(dur, vol = 0.2, delay = 0) {
    if (!this.ctx) return;
    try {
      if (!this.noiseBuf) {
        const len = this.ctx.sampleRate * 0.5;
        this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
        const d = this.noiseBuf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      }
      const t0 = this.ctx.currentTime + delay;
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuf;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 1200;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(vol, t0);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      src.connect(filter);
      filter.connect(g);
      g.connect(this.sfxGain);
      src.start(t0);
      src.stop(t0 + dur + 0.02);
    } catch {
      /* ignore */
    }
  }

  // ---------------------------------------------------------------- sound effects
  sfx(name, arg = 0) {
    if (!this.ctx || this.sfxVol <= 0) return;
    switch (name) {
      case 'step':
        this.noise(0.05, 0.05);
        break;
      case 'ui':
        this.tone(660, 0.06, { type: 'square', vol: 0.18 });
        break;
      case 'confirm':
        this.tone(520, 0.07, { vol: 0.2 });
        this.tone(780, 0.1, { vol: 0.2, delay: 0.06 });
        break;
      case 'beep': {
        const f = [0, 700, 860, 1100][arg] || 700;
        this.tone(f, 0.07, { type: 'sine', vol: 0.22 });
        break;
      }
      case 'pickup':
        this.tone(880, 0.08, { vol: 0.22 });
        this.tone(1320, 0.12, { vol: 0.22, delay: 0.07 });
        break;
      case 'open':
        this.tone(330, 0.09, { type: 'triangle', vol: 0.3 });
        this.tone(495, 0.09, { type: 'triangle', vol: 0.3, delay: 0.08 });
        this.tone(660, 0.16, { type: 'triangle', vol: 0.3, delay: 0.16 });
        break;
      case 'dig':
        this.noise(0.12, 0.18);
        this.noise(0.12, 0.14, 0.14);
        this.tone(140, 0.1, { type: 'triangle', vol: 0.25, delay: 0.02 });
        break;
      case 'error':
        this.tone(180, 0.14, { type: 'sawtooth', vol: 0.2 });
        this.tone(140, 0.18, { type: 'sawtooth', vol: 0.2, delay: 0.1 });
        break;
      case 'unlock':
        this.tone(392, 0.1, { type: 'triangle', vol: 0.3 });
        this.tone(523, 0.1, { type: 'triangle', vol: 0.3, delay: 0.09 });
        this.tone(784, 0.25, { type: 'triangle', vol: 0.3, delay: 0.18 });
        break;
      case 'lever':
        this.noise(0.08, 0.2);
        this.tone(200 + arg * 60, 0.12, { type: 'square', vol: 0.2 });
        break;
      case 'quest':
        [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.14, { type: 'triangle', vol: 0.26, delay: i * 0.09 }));
        break;
      case 'level':
        [392,494,587,784,988].forEach((f,i)=>this.tone(f,.18,{type:'triangle',vol:.24,delay:i*.09}));
        break;
      case 'achievement':
        [784,988,1174].forEach((f,i)=>this.tone(f,.16,{type:'sine',vol:.24,delay:i*.12}));
        break;
      case 'item':
        [659, 880, 1174].forEach((f, i) => this.tone(f, 0.12, { type: 'square', vol: 0.2, delay: i * 0.08 }));
        break;
      case 'duplicate':
        this.tone(440, 0.09, { type: 'triangle', vol: 0.22 });
        this.tone(440, 0.09, { type: 'triangle', vol: 0.22, delay: 0.1 });
        break;
      case 'discover': {
        // arg = rarity index 0..4, richer fanfare for rarer money
        const seq = [
          [660, 880],
          [660, 880, 1100],
          [523, 659, 784, 1046],
          [523, 659, 784, 1046, 1318],
          [392, 523, 659, 784, 1046, 1318, 1568],
        ][Math.max(0, Math.min(4, arg))];
        seq.forEach((f, i) => this.tone(f, 0.16 + arg * 0.02, { type: arg >= 3 ? 'triangle' : 'square', vol: 0.24, delay: i * 0.085 }));
        if (arg >= 3) this.tone(261, 0.6, { type: 'sine', vol: 0.3, delay: 0.05 });
        break;
      }
      case 'complete':
        [523, 659, 784, 1046, 784, 1046, 1318, 1568].forEach((f, i) => this.tone(f, 0.22, { type: 'triangle', vol: 0.3, delay: i * 0.13 }));
        break;
      default:
        break;
    }
  }

  // ---------------------------------------------------------------- music
  music(themeName) {
    const name = THEMES[themeName] ? themeName : 'town';
    this.pendingTheme = name;
    if (!this.ctx || this.theme === name) return;
    this.stopMusic();
    this.theme = name;
    const th = THEMES[name];
    // A repeatable melody: 32 eighth-note steps drawn from the scale by a seeded random walk.
    const rnd = mulberry32(th.seed * 977);
    this.melody = [];
    let idx = 2;
    for (let i = 0; i < 32; i++) {
      if (rnd() < th.rest) {
        this.melody.push(null);
        continue;
      }
      idx = Math.max(0, Math.min(th.scale.length * 2 - 1, idx + Math.floor(rnd() * 5) - 2));
      const oct = Math.floor(idx / th.scale.length);
      this.melody.push(th.root + 12 + th.scale[idx % th.scale.length] + oct * 12);
    }
    this.step = 0;
    this.nextTime = this.ctx.currentTime + 0.15;
    this.timer = setInterval(() => this.schedule(), 180);
  }

  schedule() {
    if (!this.ctx || !this.theme) return;
    const th = THEMES[this.theme];
    const stepDur = 60 / th.bpm / 2;
    while (this.nextTime < this.ctx.currentTime + 0.5) {
      const delay = Math.max(0, this.nextTime - this.ctx.currentTime);
      const note = this.melody[this.step % this.melody.length];
      const vol = 0.55 * (th.quiet || 1);
      if (note !== null && note !== undefined) {
        this.tone(midiToFreq(note), stepDur * 1.6, { type: th.wave, vol: 0.5 * vol, delay, dest: this.musicGain });
      }
      if (this.step % 4 === 0) {
        const chord = CHORD_ROOTS[Math.floor(this.step / 8) % CHORD_ROOTS.length];
        this.tone(midiToFreq(th.root - 12 + chord), stepDur * 3.2, { type: 'sine', vol: 0.75 * vol, delay, dest: this.musicGain });
      }
      this.step += 1;
      this.nextTime += stepDur;
    }
  }

  stopMusic() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.theme = null;
  }
}

export const audio = new AudioManager();
