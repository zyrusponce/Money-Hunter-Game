// Tiny event emitter used to connect the game engine (plain JS) to the React UI.
export class Emitter {
  constructor() {
    this.map = new Map();
  }
  on(evt, fn) {
    if (!this.map.has(evt)) this.map.set(evt, new Set());
    this.map.get(evt).add(fn);
    return () => this.off(evt, fn);
  }
  off(evt, fn) {
    const set = this.map.get(evt);
    if (set) set.delete(fn);
  }
  emit(evt, payload) {
    const set = this.map.get(evt);
    if (!set) return;
    for (const fn of [...set]) {
      try {
        fn(payload);
      } catch (err) {
        console.error('[MoneyHunter] listener error for', evt, err);
      }
    }
  }
  clear() {
    this.map.clear();
  }
}
