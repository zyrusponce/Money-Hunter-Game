// Canvas factory. In the browser this is a real <canvas>. Outside the browser
// (unit/smoke tests in Node) it returns a harmless stand-in so game logic can be tested.

function makeFakeContext() {
  const store = {};
  const proxy = new Proxy(store, {
    get(target, key) {
      if (key in target) return target[key];
      return () => proxy;
    },
    set(target, key, value) {
      target[key] = value;
      return true;
    },
  });
  return proxy;
}

export function makeCanvas(w, h) {
  if (typeof document !== 'undefined' && document.createElement) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  }
  const ctx = makeFakeContext();
  return { width: w, height: h, getContext: () => ctx, toDataURL: () => 'data:image/png;base64,' };
}

// Small seeded PRNG so procedural art and maps are identical on every load.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
