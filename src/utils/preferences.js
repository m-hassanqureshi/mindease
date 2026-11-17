export const GOAL_OPTIONS = ['Anxiety', 'Sleep', 'Self-esteem', 'Relationships', 'Work stress', 'Grief', 'Focus'];

export const TONE_OPTIONS = [
  { value: 'gentle', label: 'Gentle' },
  { value: 'direct', label: 'Direct' },
  { value: 'friendly', label: 'Friendly' },
];

const GOAL_SET = new Set(GOAL_OPTIONS);
const TONE_SET = new Set(TONE_OPTIONS.map((t) => t.value));

// Validates preferences coming from the client before they reach the AI prompt.
export function sanitizePreferences(input) {
  if (!input || typeof input !== 'object') return { goals: [] };
  const goals = Array.isArray(input.goals)
    ? [...new Set(input.goals.filter((g) => typeof g === 'string' && GOAL_SET.has(g)))].slice(0, 4)
    : [];
  const tone = TONE_SET.has(input.tone) ? input.tone : undefined;
  return { goals, tone };
}
