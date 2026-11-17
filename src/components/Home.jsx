import { useState, useEffect } from 'react'
import { ChevronRight, Hand, Target, Check, Clock, Flame, MessageCircle, BarChart3, AlertCircle, Sparkles, Smile, Frown, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { getTodayTask, calculateWeekCompletion } from '../utils/taskManager'
import { getMoodTrend } from '../utils/analytics'
import { getDailyAffirmation } from '../utils/affirmations'
import DailyCard from './DailyCard'

export default function Home({ nickname, currentMood, setCurrentMood, moodHistory, tasks, onNavigate, onCrisisClick, onStartJournal }) {
  const [todayTask, setTodayTask] = useState(null)
  const [moodTrend, setMoodTrend] = useState({ trend: 'flat', change: 0 })
  const [streak, setStreak] = useState(0)
  
  useEffect(() => {
    setTodayTask(getTodayTask(tasks))
  }, [tasks])
  
  useEffect(() => {
    setMoodTrend(getMoodTrend(moodHistory.slice(-7)))
  }, [moodHistory])
  
  useEffect(() => {
    // Calculate streak
    let count = 0;
    const dates = [...new Set(moodHistory.map(m => new Date(m.date).toDateString()))];
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      if (dates.includes(d.toDateString())) count++;
      else break;
    }
    setStreak(count);
  }, [moodHistory])
  
  const weekCompletion = calculateWeekCompletion(tasks)
  const todayMood = moodHistory.length > 0 ? moodHistory[moodHistory.length - 1]?.score : null
  const affirmation = getDailyAffirmation()
  
  return (
    <div className="home-screen fade-in">
      {/* Header */}
      <div className="home-header">
        <h1><Hand size={24} style={{display: 'inline', marginRight: '8px'}} /> Hello, {nickname || 'Friend'}</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>Welcome back to MindEase</p>
      </div>
      
      {/* Daily affirmation */}
      <div className="card affirmation-card">
        <div className="affirmation-icon"><Sparkles size={18} /></div>
        <p>{affirmation}</p>
      </div>

      {/* Daily practice + journal prompt */}
      <DailyCard onStartJournal={onStartJournal} />

      {/* Daily Mood Check */}
      <div className="card mood-checkin-card">
        <h2><Smile size={18} style={{ marginRight: '6px', verticalAlign: '-2px', color: 'var(--accent)' }} /> Today's Mood Check</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 12 }}>How are you feeling today?</p>
        
        <div className="mood-slider-container">
          <Frown size={20} style={{ color: '#3b82f6', flexShrink: 0 }} />
          <input
            type="range"
            min="1"
            max="10"
            value={currentMood || todayMood || 5}
            onChange={(e) => setCurrentMood(parseInt(e.target.value))}
            className="mood-slider"
          />
          <Smile size={20} style={{ color: '#10b981', flexShrink: 0 }} />
        </div>
        
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <span style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--primary)' }}>
            {currentMood || todayMood || 5}/10
          </span>
        </div>
      </div>
      
      {/* Today's Task */}
      {todayTask && (
        <div className="card task-preview-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <h3 style={{ fontSize: '0.95rem', marginBottom: 4 }}><Target size={18} style={{display: 'inline', marginRight: '6px', color: 'var(--accent)'}} /> Today's Task</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{todayTask.title}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="btn btn-small btn-success"><Check size={16} style={{marginRight: '4px'}} /> Done</button>
            <button className="btn btn-small btn-outline"><Clock size={16} style={{marginRight: '4px'}} /> Later</button>
          </div>
        </div>
      )}
      
      {/* Stats Row */}
      <div className="stats-row">
        <div className="stat-mini">
          <div className="stat-value"><Flame size={24} style={{display: 'inline', marginRight: '4px', color: '#f97316'}} /> {streak}</div>
          <div className="stat-label">Day Streak</div>
        </div>
        <div className="stat-mini">
          <div className="stat-value">
            {moodTrend.trend === 'up' ? <TrendingUp size={24} style={{ color: '#10b981' }} /> : moodTrend.trend === 'down' ? <TrendingDown size={24} style={{ color: '#ef4444' }} /> : <Minus size={24} style={{ color: 'var(--text-muted)' }} />}
          </div>
          <div className="stat-label">{moodTrend.direction === 'improving' ? 'Improving' : moodTrend.direction === 'declining' ? 'Declining' : 'Stable'}</div>
        </div>
        <div className="stat-mini">
          <div className="stat-value">{weekCompletion}%</div>
          <div className="stat-label">Tasks Done</div>
        </div>
      </div>
      
      {/* CTA Cards */}
      <div className="cta-section">
        <button 
          onClick={() => onNavigate('chat')}
          className="card cta-card"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '0.95rem', marginBottom: 4 }}><MessageCircle size={18} style={{display: 'inline', marginRight: '6px', color: 'var(--accent)'}} /> Talk to MindEase</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Share what's on your mind</p>
            </div>
            <ChevronRight size={20} />
          </div>
        </button>
        
        <button 
          onClick={() => onNavigate('insights')}
          className="card cta-card"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '0.95rem', marginBottom: 4 }}><BarChart3 size={18} style={{display: 'inline', marginRight: '6px', color: 'var(--accent-calm)'}} /> Weekly Insights</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>See your progress</p>
            </div>
            <ChevronRight size={20} />
          </div>
        </button>
        
        {/* Crisis Button */}
        <button 
          onClick={onCrisisClick}
          className="card cta-card crisis-card"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '0.95rem', marginBottom: 4 }}><AlertCircle size={18} style={{display: 'inline', marginRight: '6px', color: 'var(--danger)'}} /> Crisis Support</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Get immediate help</p>
            </div>
            <ChevronRight size={20} />
          </div>
        </button>
      </div>
    </div>
  );
}
