// Emotion detection and coping suggestions engine

const EMOTION_KEYWORDS = {
  sad: ['sad', 'down', 'depressed', 'unhappy', 'miserable', 'blue', 'grief', 'heartbroken', 'devastated', 'worthless', 'hopeless'],
  stressed: ['stress', 'stressed', 'stressed out', 'overwhelmed', 'pressured', 'buried', 'drowning', 'chaos', 'hectic', 'tension'],
  lonely: ['lonely', 'alone', 'isolated', 'left out', 'unwanted', 'disconnected', 'abandoned', 'forgotten'],
  anxious: ['anxious', 'worried', 'nervous', 'fear', 'scared', 'panic', 'dread', 'terrified', 'uneasy', 'restless'],
  angry: ['angry', 'furious', 'rage', 'mad', 'pissed', 'frustrated', 'irritated', 'livid', 'bitter', 'resentful'],
  tired: ['tired', 'exhausted', 'drained', 'burnt out', 'worn out', 'fatigued', 'energy', 'sleep'],
  unmotivated: ['unmotivated', 'no motivation', 'can\'t do it', 'give up', 'pointless', 'lazy', 'stuck']
};

const COPING_STRATEGIES = {
  sad: {
    techniques: ['Gentle walk or movement', 'Call someone you trust', 'Watch something comforting', 'Create or play music'],
    activity: 'Try a short walk. Fresh air helps. Who could you reach out to?',
  },
  stressed: {
    techniques: ['4-7-8 breathing exercise', 'Progressive muscle relaxation', 'Time outside', 'Break tasks into smaller steps'],
    activity: 'Try: Breathe in for 4, hold for 7, out for 8. Repeat 4 times.',
  },
  lonely: {
    techniques: ['Text a friend or family member', 'Join a community (online or local)', 'Volunteer', 'Attend a social event'],
    activity: 'Send a message to someone. Even a small "thinking of you" helps.',
  },
  anxious: {
    techniques: ['5-4-3-2-1 grounding (senses)', 'Breathing techniques', 'Reassurance journaling', 'Limit caffeine/news'],
    activity: 'Grounding: Name 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste.',
  },
  angry: {
    techniques: ['Intense exercise', 'Journaling (no filter)', 'Cold water on face', 'Power pose', 'Slow breathing'],
    activity: 'Do 20 jumping jacks or punch a pillow. Channel that energy into movement.',
  },
  tired: {
    techniques: ['Rest without guilt', 'Light stretching', 'Hydrate well', 'Take a power nap (20 min)', 'Sunlight exposure'],
    activity: 'Rest is productive. Take 20 minutes to recharge guilt-free.',
  },
  unmotivated: {
    techniques: ['Start tiny (2-minute task)', 'Change environment', 'Talk to someone', 'Remind yourself of "why"', 'Reward yourself'],
    activity: 'Pick ONE tiny thing (literally 2 minutes) and just do that.',
  },
};

// Detect dominant emotion from user message
export function detectEmotion(userMessage) {
  const lower = userMessage.toLowerCase();
  let scores = {};
  
  for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
    scores[emotion] = keywords.filter(kw => lower.includes(kw)).length;
  }
  
  const maxScore = Math.max(...Object.values(scores));
  if (maxScore === 0) return null;
  
  return Object.entries(scores).find(([_, score]) => score === maxScore)[0];
}

// Get coping suggestion based on detected emotion
export function getCopingSuggestion(emotion) {
  return COPING_STRATEGIES[emotion] || null;
}

// Calculate empathy score based on response quality
export function calculateEmpathyScore(userMessage, assistantResponse) {
  let score = 0;
  
  // Check if response validates emotion
  if (/understand|hearing|sounds|feel|valid|tough|hard|rough|difficult/.test(assistantResponse)) score += 20;
  
  // Check for personalization
  if (userMessage.length > 50) score += 15;
  if (/ask|tell me|share|talk|curious/.test(assistantResponse)) score += 15;
  
  // Check for actionable suggestions
  if (/try|suggest|breathe|exercise|reach out|activity/.test(assistantResponse)) score += 20;
  
  // Check for future-oriented language
  if (/next|tomorrow|moving forward|step|will help/.test(assistantResponse)) score += 15;
  
  // Check conversation continuity
  if (assistantResponse.length > 100 && assistantResponse.length < 500) score += 15;
  
  return Math.min(score, 100);
}

// Track mood patterns (for personalization)
export function analyzeMoodPattern(moodHistory) {
  if (!moodHistory || moodHistory.length === 0) return null;
  
  const recentMoods = moodHistory.slice(-7); // Last 7 entries
  const emotionCounts = {};
  
  recentMoods.forEach(entry => {
    const emotion = entry.mood || 'neutral';
    emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
  });
  
  const pattern = Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  
  return pattern.length > 0 ? pattern : null;
}
