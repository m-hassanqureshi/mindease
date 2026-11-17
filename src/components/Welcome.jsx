import { useState } from 'react'
import { Heart, Check } from 'lucide-react'
import { GOAL_OPTIONS, TONE_OPTIONS } from '../utils/preferences'

export default function Welcome({ onStart }) {
  const [name, setName] = useState('')
  const [goals, setGoals] = useState([])
  const [tone, setTone] = useState('gentle')

  const toggleGoal = (goal) => {
    setGoals(prev => (
      prev.includes(goal)
        ? prev.filter(g => g !== goal)
        : prev.length >= 4 ? prev : [...prev, goal]
    ))
  }

  const start = () => onStart(name.trim(), { goals, tone })

  return (
    <div className="welcome">
      <div className="welcome-box">
        <div className="icon"><Heart size={48} style={{color: '#ec4899'}} /></div>
        <h1>MindEase</h1>
        <p>Your compassionate AI companion for mental wellness. Chat, journal, breathe, and track your mood, all in a safe, private space.</p>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Enter a nickname (optional)" onKeyDown={e => e.key === 'Enter' && start()} maxLength={40} />

        <div className="welcome-section">
          <span className="welcome-label">What would you like support with?</span>
          <div className="goal-chips">
            {GOAL_OPTIONS.map(goal => (
              <button
                key={goal}
                className={`chip${goals.includes(goal) ? ' active' : ''}`}
                onClick={() => toggleGoal(goal)}
                aria-pressed={goals.includes(goal)}
              >
                {goals.includes(goal) && <Check size={13} />} {goal}
              </button>
            ))}
          </div>
        </div>

        <div className="welcome-section">
          <span className="welcome-label">Preferred tone</span>
          <div className="tone-row">
            {TONE_OPTIONS.map(t => (
              <button
                key={t.value}
                className={`tone-option${tone === t.value ? ' active' : ''}`}
                onClick={() => setTone(t.value)}
                aria-pressed={tone === t.value}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px 0', fontSize: '1rem' }} onClick={start}>
          Continue as Guest
        </button>
        <p style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginTop: 16 }}>No signup required. Your data stays on your device.</p>
      </div>
    </div>
  )
}
