import { useState, useMemo } from 'react'
import { getWeekTasks, calculateWeekCompletion } from '../utils/taskManager'
import { Check, SkipForward, Lock, Calendar, Users, Activity, Zap, Heart, Palette } from 'lucide-react'

export default function Tasks({ tasks, setTasks, currentWeekTemplate }) {
  const weekTasks = useMemo(() => getWeekTasks(tasks), [tasks])
  const completion = useMemo(() => calculateWeekCompletion(tasks), [tasks])
  
  const handleTaskComplete = (taskId) => {
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, completed: true, skipped: false } : t
    ))
  }
  
  const handleTaskSkip = (taskId) => {
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, skipped: true, completed: false } : t
    ))
  }
  
  const getTaskIcon = (category) => {
    const icons = {
      social: <Users size={16} />,
      activity: <Activity size={16} />,
      mindfulness: <Zap size={16} />,
      'self-care': <Heart size={16} />,
      creative: <Palette size={16} />
    };
    return icons[category] || <Zap size={16} />;
  }
  
  const getDayName = (day) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days[day - 1] || `Day ${day}`;
  }
  
  return (
    <div className="tasks-screen fade-in">
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1><Calendar size={24} style={{display: 'inline', marginRight: '8px'}} /> Weekly Plan</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>{currentWeekTemplate || 'Connection'} Week</p>
      </div>
      
      {/* Progress Bar */}
      <div className="card progress-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Weekly Progress</span>
          <span style={{ fontSize: '0.9rem', color: 'var(--primary)' }}>{completion}%</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${completion}%` }}
          ></div>
        </div>
      </div>
      
      {/* Tasks List */}
      <div className="tasks-list">
        {weekTasks.map((task, idx) => (
          <div 
            key={task.id} 
            className={`task-item ${task.completed ? 'completed' : ''} ${task.skipped ? 'skipped' : ''}`}
          >
            <div className="task-content">
              <div className="task-header">
                <span className="task-day">{getDayName(task.day)}</span>
                <span className="task-icon">{getTaskIcon(task.category)}</span>
                <span className="task-title">{task.title}</span>
              </div>
              <div className="task-actions">
                {!task.completed && !task.skipped && (
                  <>
                    <button 
                      onClick={() => handleTaskComplete(task.id)}
                      className="btn-task-action done"
                      title="Mark as done"
                    >
                      <Check size={16} /> Done
                    </button>
                    <button 
                      onClick={() => handleTaskSkip(task.id)}
                      className="btn-task-action skip"
                      title="Skip task"
                    >
                      <SkipForward size={16} /> Skip
                    </button>
                  </>
                )}
                {task.completed && (
                  <span className="task-status completed"><Check size={14} style={{display: 'inline', marginRight: '4px'}} /> Done</span>
                )}
                {task.skipped && (
                  <span className="task-status skipped"><SkipForward size={14} style={{display: 'inline', marginRight: '4px'}} /> Skipped</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Summary */}
      <div className="card summary-card" style={{ marginTop: 20 }}>
        <h3 style={{ marginBottom: 12, fontSize: '0.95rem' }}>Week Summary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--success)' }}>
              {weekTasks.filter(t => t.completed).length}/{weekTasks.length}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tasks Completed</div>
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--warning)' }}>
              {weekTasks.filter(t => t.skipped).length}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Skipped</div>
          </div>
        </div>
      </div>
    </div>
  );
}
