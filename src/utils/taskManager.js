/**
 * Task Management System - Weekly and Daily Tasks
 */

export const WEEKLY_TASK_TEMPLATES = {
  connection: {
    theme: 'Connection Week',
    tasks: [
      { day: 1, title: 'Message a friend', category: 'social', locked: false },
      { day: 2, title: 'Go outside for 10 mins', category: 'activity', locked: false },
      { day: 3, title: 'Share something small', category: 'social', locked: false },
      { day: 4, title: 'Call someone', category: 'social', locked: false },
      { day: 5, title: 'Join a group', category: 'social', locked: false },
      { day: 6, title: 'Reflection time', category: 'mindfulness', locked: false },
      { day: 7, title: 'Reward day', category: 'self-care', locked: false },
    ]
  },
  wellness: {
    theme: 'Wellness Week',
    tasks: [
      { day: 1, title: 'Morning stretch', category: 'activity', locked: false },
      { day: 2, title: 'Journal for 5 mins', category: 'mindfulness', locked: false },
      { day: 3, title: 'Breathing exercise', category: 'mindfulness', locked: false },
      { day: 4, title: 'Hydration reminder', category: 'self-care', locked: false },
      { day: 5, title: 'Move your body', category: 'activity', locked: false },
      { day: 6, title: 'Screen-free hour', category: 'self-care', locked: false },
      { day: 7, title: 'Plan for next week', category: 'mindfulness', locked: false },
    ]
  },
  creativity: {
    theme: 'Creativity Week',
    tasks: [
      { day: 1, title: 'Express yourself', category: 'creative', locked: false },
      { day: 2, title: 'Try something new', category: 'creative', locked: false },
      { day: 3, title: 'Create or make', category: 'creative', locked: false },
      { day: 4, title: 'Write freely', category: 'creative', locked: false },
      { day: 5, title: 'Listen to music', category: 'creative', locked: false },
      { day: 6, title: 'Share your creation', category: 'creative', locked: false },
      { day: 7, title: 'Appreciate art', category: 'creative', locked: false },
    ]
  }
};

export function getWeekStart(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
}

export function getDayOfWeek(taskDate) {
  const date = new Date(taskDate);
  return date.getDay() === 0 ? 6 : date.getDay() - 1; // 0=Monday, 6=Sunday
}

export function generateWeeklyTasks(template = 'connection') {
  const weekStart = getWeekStart();
  const templateData = WEEKLY_TASK_TEMPLATES[template];
  
  return templateData.tasks.map((task, idx) => ({
    id: `${weekStart.getTime()}-${idx}`,
    ...task,
    weekStart,
    date: new Date(weekStart.getTime() + task.day * 86400000),
    completed: false,
    skipped: false,
    createdAt: new Date().toISOString(),
  }));
}

export function getTodayTask(tasks) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return tasks.find(t => {
    const taskDate = new Date(t.date);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate.getTime() === today.getTime() && !t.completed && !t.skipped;
  });
}

export function getWeekTasks(tasks) {
  const weekStart = getWeekStart();
  const weekEnd = new Date(weekStart.getTime() + 7 * 86400000);
  
  return tasks.filter(t => {
    const taskDate = new Date(t.date);
    return taskDate >= weekStart && taskDate < weekEnd;
  }).sort((a, b) => a.day - b.day);
}

export function calculateWeekCompletion(tasks) {
  const weekTasks = getWeekTasks(tasks);
  const completed = weekTasks.filter(t => t.completed).length;
  return weekTasks.length > 0 ? Math.round((completed / weekTasks.length) * 100) : 0;
}

export function getTaskStats(tasks) {
  const weekTasks = getWeekTasks(tasks);
  const categories = {};
  
  weekTasks.forEach(t => {
    if (!categories[t.category]) {
      categories[t.category] = { total: 0, completed: 0 };
    }
    categories[t.category].total++;
    if (t.completed) categories[t.category].completed++;
  });
  
  return categories;
}
