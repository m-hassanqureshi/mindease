import { computeStreak } from './achievements.js';

export function getWeekStats({ moodHistory = [], tasks = [], journals = [], nickname = '' } = {}) {
  const now = Date.now();
  const week = 7 * 86_400_000;
  const recentMoods = moodHistory.filter((m) => now - new Date(m.date).getTime() < week);
  const avg = recentMoods.length
    ? (recentMoods.reduce((s, m) => s + (Number(m.score) || 0), 0) / recentMoods.length).toFixed(1)
    : '-';
  const completed = tasks.filter((t) => t.completed).length;
  const journalCount = journals.filter((e) => now - new Date(e.date).getTime() < week).length;
  return {
    nickname: nickname || 'Friend',
    avg,
    entries: recentMoods.length,
    completed,
    totalTasks: tasks.length,
    journalCount,
    streak: computeStreak(moodHistory),
  };
}

// Draws a shareable recap card and triggers a PNG download.
export async function downloadRecapPng(stats) {
  const W = 1080;
  const H = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#1a1030');
  bg.addColorStop(0.5, '#0f0f1a');
  bg.addColorStop(1, '#0b1f2a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const glow = ctx.createRadialGradient(W * 0.82, H * 0.14, 0, W * 0.82, H * 0.14, W * 0.7);
  glow.addColorStop(0, 'rgba(124,58,237,0.55)');
  glow.addColorStop(1, 'rgba(124,58,237,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  const glow2 = ctx.createRadialGradient(W * 0.08, H * 0.96, 0, W * 0.08, H * 0.96, W * 0.6);
  glow2.addColorStop(0, 'rgba(6,182,212,0.4)');
  glow2.addColorStop(1, 'rgba(6,182,212,0)');
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, W, H);

  const font = (weight, size) => `${weight} ${size}px Inter, system-ui, -apple-system, "Segoe UI", sans-serif`;

  ctx.textAlign = 'left';
  ctx.fillStyle = '#a78bfa';
  ctx.font = font(600, 34);
  ctx.fillText('MINDEASE', 80, 120);
  ctx.fillStyle = 'rgba(226,232,240,0.75)';
  ctx.font = font(500, 30);
  ctx.fillText('Weekly recap', 80, 168);

  ctx.fillStyle = '#e2e8f0';
  ctx.font = font(700, 58);
  ctx.fillText(`Hi, ${stats.nickname}`, 80, 300);

  ctx.fillStyle = '#ffffff';
  ctx.font = font(800, 190);
  ctx.fillText(String(stats.avg), 80, 500);
  ctx.fillStyle = '#94a3b8';
  ctx.font = font(500, 34);
  ctx.fillText('average mood this week', 80, 552);

  const rows = [
    ['Check-ins', String(stats.entries)],
    ['Day streak', String(stats.streak)],
    ['Tasks done', `${stats.completed}/${stats.totalTasks}`],
    ['Journal entries', String(stats.journalCount)],
  ];
  let y = 690;
  for (const [label, value] of rows) {
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(148,163,184,0.9)';
    ctx.font = font(500, 36);
    ctx.fillText(label, 80, y);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#e2e8f0';
    ctx.font = font(700, 40);
    ctx.fillText(value, W - 80, y);
    y += 74;
  }

  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(148,163,184,0.7)';
  ctx.font = font(500, 28);
  ctx.fillText('One week at a time.', 80, H - 70);

  const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'));
  if (!blob) return false;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mindease-recap-${new Date().toISOString().slice(0, 10)}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return true;
}
