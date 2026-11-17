/**
 * Analytics and Insights Generation
 */

export function getMoodTrend(moodHistory) {
  if (moodHistory.length < 2) return { trend: 'flat', change: 0, direction: 'stable' };
  
  const last7Days = moodHistory.slice(-7);
  const firstHalf = last7Days.slice(0, Math.floor(last7Days.length / 2));
  const secondHalf = last7Days.slice(Math.floor(last7Days.length / 2));
  
  const avg1 = firstHalf.length ? firstHalf.reduce((s, m) => s + m.score, 0) / firstHalf.length : 0;
  const avg2 = secondHalf.length ? secondHalf.reduce((s, m) => s + m.score, 0) / secondHalf.length : 0;
  
  const change = +(avg2 - avg1).toFixed(1);
  let trend = 'flat', direction = 'stable';
  
  if (change > 0.5) { trend = 'up'; direction = 'improving'; }
  else if (change < -0.5) { trend = 'down'; direction = 'declining'; }
  
  return { trend, change, direction };
}

export function getEmotionBreakdown(moodHistory) {
  const emotions = {};
  const emotionMap = {
    'Happy': 'Happy',
    'Sad': 'Sad',
    'Angry': 'Angry',
    'Anxious': 'Stressed',
    'Neutral': 'Neutral'
  };
  
  moodHistory.forEach(m => {
    const emotion = m.emotion || (m.score > 7 ? 'Happy' : m.score > 5 ? 'Neutral' : m.score > 3 ? 'Sad' : 'Anxious');
    emotions[emotion] = (emotions[emotion] || 0) + 1;
  });
  
  const total = Object.values(emotions).reduce((s, v) => s + v, 0);
  const breakdown = {};
  Object.entries(emotions).forEach(([e, count]) => {
    breakdown[e] = Math.round((count / total) * 100);
  });
  
  return breakdown;
}

export function generateWeeklyInsights({ moodHistory, tasks, chatHistory }) {
  const last7Moods = moodHistory.slice(-7);
  const moodTrend = getMoodTrend(last7Moods);
  const emotionBreakdown = getEmotionBreakdown(last7Moods);
  const taskCompletion = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  
  const insights = [];
  
  // Insight 1: Mood trend
  if (moodTrend.direction === 'improving') {
    insights.push('Your mood is improving! Keep up what you\'re doing.');
  } else if (moodTrend.direction === 'declining') {
    insights.push('Your mood seems to be declining. Consider reaching out for support.');
  } else {
    insights.push('Your mood is stable this week. Focus on maintaining your routine.');
  }
  
  // Insight 2: Task completion correlation
  if (taskCompletion > 0 && moodTrend.change > 0) {
    insights.push(`Completing tasks correlated with improved mood! You're making progress.`);
  }
  
  // Insight 3: Emotion pattern
  const dominantEmotion = Object.entries(emotionBreakdown).sort((a, b) => b[1] - a[1])[0];
  if (dominantEmotion) {
    insights.push(`You've been experiencing a lot of ${dominantEmotion[0].toLowerCase()} (${dominantEmotion[1]}%). Consider activities that help with this.`);
  }
  
  // Insight 4: Activity suggestion
  if (chatHistory.length < 3) {
    insights.push('Try using the chat more. Talking about your feelings helps!');
  } else {
    insights.push('Great job staying engaged with your mental wellness routine!');
  }
  
  return {
    moodTrend,
    emotionBreakdown,
    taskCompletion: Math.round((taskCompletion / Math.max(totalTasks, 1)) * 100),
    insights,
    weekMoodAvg: last7Moods.length ? (last7Moods.reduce((s, m) => s + m.score, 0) / last7Moods.length).toFixed(1) : '-'
  };
}

export function getChartData(moodHistory) {
  const last7 = moodHistory.slice(-7);
  const labels = last7.map(m => {
    const date = new Date(m.date);
    return date.toLocaleDateString([], { weekday: 'short' });
  });
  
  const data = last7.map(m => m.score);
  
  return { labels, data };
}
