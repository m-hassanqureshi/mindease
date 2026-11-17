// Achievement definitions + evaluation from existing app data.
// Pure functions so they can be unit-reasoned about and reused anywhere.
// `iconKey` maps to a lucide SVG icon in Profile (no emoji).

export const ACHIEVEMENTS = [
  { id: 'first-checkin', title: 'First Step', desc: 'Complete your first mood check-in', iconKey: 'sprout',
    check: ({ moodHistory }) => moodHistory.length >= 1 },
  { id: 'streak-3', title: 'Building Momentum', desc: 'Check in 3 days in a row', iconKey: 'flame',
    check: ({ streak }) => streak >= 3 },
  { id: 'streak-7', title: 'Week Warrior', desc: 'Check in 7 days in a row', iconKey: 'bolt',
    check: ({ streak }) => streak >= 7 },
  { id: 'journal-1', title: 'Dear Diary', desc: 'Write your first journal entry', iconKey: 'book',
    check: ({ journals }) => journals.length >= 1 },
  { id: 'journal-10', title: 'Reflective Mind', desc: 'Write 10 journal entries', iconKey: 'pen',
    check: ({ journals }) => journals.length >= 10 },
  { id: 'tasks-5', title: 'Momentum Maker', desc: 'Complete 5 wellness tasks', iconKey: 'check',
    check: ({ completedTasks }) => completedTasks >= 5 },
  { id: 'chat-10', title: 'Opening Up', desc: 'Send 10 messages in chat', iconKey: 'chat',
    check: ({ chatCount }) => chatCount >= 10 },
  { id: 'breathe-1', title: 'Just Breathe', desc: 'Finish a breathing session', iconKey: 'wind',
    check: ({ breathingSessions }) => breathingSessions.length >= 1 },
];

export function computeStreak(moodHistory) {
  if (!Array.isArray(moodHistory) || moodHistory.length === 0) return 0;
  const dates = new Set(moodHistory.map((m) => new Date(m.date).toDateString()));
  let count = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (dates.has(d.toDateString())) count++;
    else break;
  }
  return count;
}

export function evaluateAchievements({
  moodHistory = [],
  journals = [],
  tasks = [],
  chatHistory = [],
  breathingSessions = [],
} = {}) {
  const ctx = {
    moodHistory,
    journals,
    tasks,
    chatHistory,
    breathingSessions,
    streak: computeStreak(moodHistory),
    completedTasks: tasks.filter((t) => t.completed).length,
    chatCount: chatHistory.filter((m) => m.role === 'user').length,
  };
  return ACHIEVEMENTS.map((a) => ({ ...a, unlocked: !!a.check(ctx) }));
}
