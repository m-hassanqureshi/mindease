// Tiny global toast event bus - no context/provider plumbing needed.
const listeners = new Set();
let seq = 0;

export function toast(message, type = 'info', duration = 3200) {
  const item = { id: ++seq, message, type, duration };
  listeners.forEach((fn) => fn(item));
}

export function subscribeToasts(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
