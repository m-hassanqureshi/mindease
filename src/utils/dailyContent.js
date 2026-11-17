// Rotating daily content, deterministic by day of year so it stays stable all day.

function dayIndex(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date - start) / 86_400_000);
}

const PRACTICES = [
  {
    title: 'Box breathing',
    minutes: 3,
    steps: ['Inhale through your nose for 4', 'Hold for 4', 'Exhale for 4', 'Hold for 4, then repeat'],
  },
  {
    title: '5-4-3-2-1 grounding',
    minutes: 3,
    steps: ['Name 5 things you can see', '4 you can touch', '3 you can hear, 2 you can smell, 1 you can taste'],
  },
  {
    title: 'Three good things',
    minutes: 2,
    steps: ['Think of three small things that went okay today', 'Say why each one happened', 'Notice how that feels'],
  },
  {
    title: 'Two-minute body scan',
    minutes: 2,
    steps: ['Close your eyes and breathe naturally', 'Scan from your head to your toes', 'Let each area soften as you pass it'],
  },
  {
    title: 'Self-compassion pause',
    minutes: 2,
    steps: ['Place a hand on your chest', 'Say: this is hard right now', 'Say: I am allowed to be kind to myself'],
  },
  {
    title: 'Mindful walk',
    minutes: 10,
    steps: ['Step outside or walk in place', 'Notice your feet and your breath', 'Name one thing you hear and one you see'],
  },
  {
    title: 'Digital sunset',
    minutes: 1,
    steps: ['Put your phone face down for the next hour', 'Name one thing you will do instead', 'Notice the quiet'],
  },
  {
    title: 'Shoulder release',
    minutes: 2,
    steps: ['Roll your shoulders back five times', 'Lift them to your ears and drop them', 'Take three slow breaths'],
  },
];

const PROMPTS = [
  'What is one thing you are carrying today that you could set down for a moment?',
  'Describe a small moment today that felt okay.',
  'What would you say to a friend feeling exactly the way you feel right now?',
  'What is one boundary you could set this week?',
  'Name three things within reach that you are grateful for.',
  'What does your body need right now: rest, movement, food, or connection?',
  'Write about a time you got through something hard.',
  'What is one worry you can postpone until tomorrow?',
];

const CHECKIN_QUESTIONS = [
  'What is taking up the most space in your head today?',
  'What helped you yesterday?',
  'What do you need most right now?',
  'What is one small win from today?',
  'What are you looking forward to?',
  'Who or what made today a little easier?',
];

export function getDailyPractice(date = new Date()) {
  return PRACTICES[dayIndex(date) % PRACTICES.length];
}

export function getDailyPrompt(date = new Date()) {
  return PROMPTS[dayIndex(date) % PROMPTS.length];
}

export function getCheckinQuestion(date = new Date()) {
  return CHECKIN_QUESTIONS[dayIndex(date) % CHECKIN_QUESTIONS.length];
}
