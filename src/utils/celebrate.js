// Lightweight confetti burst using the Web Animations API - no dependencies.
const COLORS = ['#7c3aed', '#06b6d4', '#ec4899', '#10b981', '#f59e0b', '#6366f1'];

export function celebrate(pieces = 70) {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden';
  document.body.appendChild(overlay);

  const height = window.innerHeight + 80;

  for (let i = 0; i < pieces; i++) {
    const piece = document.createElement('div');
    const size = 5 + Math.random() * 8;
    piece.style.cssText = [
      'position:absolute',
      'top:-24px',
      `left:${Math.random() * 100}%`,
      `width:${size}px`,
      `height:${size * 0.55}px`,
      `background:${COLORS[i % COLORS.length]}`,
      'border-radius:2px',
      'opacity:.95',
    ].join(';');
    overlay.appendChild(piece);

    const drift = (Math.random() - 0.5) * 260;
    const spin = Math.random() * 900 - 450;
    piece.animate(
      [
        { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
        { transform: `translate(${drift}px, ${height}px) rotate(${spin}deg)`, opacity: 0 },
      ],
      {
        duration: 1500 + Math.random() * 1300,
        delay: Math.random() * 260,
        easing: 'cubic-bezier(0.2, 0.6, 0.4, 1)',
        fill: 'forwards',
      }
    );
  }

  setTimeout(() => overlay.remove(), 3400);
}
