import { Smile, Frown, Flame, Zap, Meh } from 'lucide-react';

// Single source of truth for moods. Icons are lucide SVGs, each with its own color.
export const MOODS = [
  { label: 'Happy', Icon: Smile, color: '#10b981' },
  { label: 'Sad', Icon: Frown, color: '#3b82f6' },
  { label: 'Angry', Icon: Flame, color: '#f97316' },
  { label: 'Anxious', Icon: Zap, color: '#f59e0b' },
  { label: 'Neutral', Icon: Meh, color: '#94a3b8' },
];

export function getMood(label) {
  return MOODS.find((m) => m.label === label) || MOODS[4];
}
