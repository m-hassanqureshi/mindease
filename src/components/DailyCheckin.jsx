import { useState } from 'react'
import { Sun } from 'lucide-react'
import { getCheckinQuestion } from '../utils/dailyContent'

export default function DailyCheckin({ onSave, onSkip }) {
  const [score, setScore] = useState(5)
  const [note, setNote] = useState('')
  const question = getCheckinQuestion()

  return (
    <div className="modal-overlay">
      <div className="modal fade-in">
        <h2><Sun size={20} style={{display: 'inline', marginRight: '8px'}} /> Daily Check-in</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem', marginBottom: 16 }}>How are you feeling today?</p>
        <div className="checkin-score">{score}/10</div>
        <input type="range" className="checkin-slider" min="1" max="10" value={score} onChange={e => setScore(+e.target.value)} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.75rem', color: 'var(--text-muted)', marginBottom: 16 }}>
          <span>Struggling</span><span>Great</span>
        </div>
        <p className="checkin-question">{question}</p>
        <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="A few words (optional)..." style={{ width: '100%', minHeight: 70, marginBottom: 14, resize: 'vertical' }} />
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => onSave(score, note.trim(), question)}>Save</button>
          <button className="btn btn-ghost" onClick={onSkip}>Skip</button>
        </div>
      </div>
    </div>
  )
}
