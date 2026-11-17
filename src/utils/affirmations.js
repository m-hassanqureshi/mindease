// Daily rotating affirmations - deterministic by day so it stays stable all day.
const AFFIRMATIONS = [
  'You are allowed to take up space and take your time.',
  'Small steps still move you forward.',
  'Your feelings are valid, even the messy ones.',
  'Rest is part of the work, not a reward for it.',
  'You have survived every hard day so far.',
  'Progress is not always visible. Keep going anyway.',
  'You deserve the same kindness you give others.',
  'One breath at a time is enough for right now.',
  'It is okay to ask for help. That is strength.',
  'You are more than your worst day.',
  'Boundaries are a form of self-respect.',
  'You do not have to earn your own compassion.',
  'Today, done is better than perfect.',
  'Your pace is the right pace for you.',
  'Feelings pass. You are the constant.',
  'You are worthy of care on the hard days too.',
  'Reaching out is not a burden. It is connection.',
  'You can start again at any moment.',
];

export function getDailyAffirmation(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date - start) / 86_400_000);
  return AFFIRMATIONS[dayOfYear % AFFIRMATIONS.length];
}
