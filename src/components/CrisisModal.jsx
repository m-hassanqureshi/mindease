import { X, Heart, Wind, AlertTriangle } from 'lucide-react'

const HELPLINES = [
  { name: 'Umang Helpline (PK)', number: '0311-7786264', desc: 'Mental health support in Pakistan' },
  { name: 'Rozan Counseling (PK)', number: '0800-22444', desc: 'Crisis counseling' },
  { name: 'Taskeen (PK)', number: '0316-8275336', desc: 'Emotional support helpline' },
  { name: 'Crisis Text Line (US)', number: 'Text HOME to 741741', desc: 'Free 24/7 text support' },
  { name: 'Samaritans (UK)', number: '116 123', desc: '24/7 emotional support' },
  { name: 'Befrienders (International)', number: 'befrienders.org', desc: 'Global crisis center directory' },
]

export default function CrisisModal({ onClose, onGoToBreathing }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><AlertTriangle size={20} /> Crisis Support</h2>
          <button className="btn-ghost" onClick={onClose} aria-label="Close crisis support modal"><X size={20} /></button>
        </div>
        <div style={{ padding: 14, borderRadius: 10, background: 'rgba(124,58,237,.08)', marginBottom: 16, textAlign: 'center' }}>
          <Heart size={20} style={{ color: 'var(--accent)', marginBottom: 4 }} />
          <p style={{ fontSize: '.9rem', fontWeight: 500 }}>You are not alone. Help is available.</p>
        </div>
        <h3 style={{ fontSize: '.95rem', marginBottom: 10, fontWeight: 600, color: 'var(--text-secondary)' }}>Immediate Support</h3>
        {onGoToBreathing && (
          <button 
            className="btn btn-primary" 
            onClick={onGoToBreathing} 
            style={{ width: '100%', marginBottom: 14, justifyContent: 'center' }}
            aria-label="Go to guided breathing exercise"
          >
            <Wind size={16} /> Calming Breathing Exercise
          </button>
        )}
        <h3 style={{ fontSize: '.95rem', marginBottom: 10, fontWeight: 600, color: 'var(--text-secondary)', marginTop: 14 }}>Helpline Resources</h3>
        {HELPLINES.map((h, i) => (
          <div key={i} className="helpline">
            <div className="name">{h.name}</div>
            <div className="number">{h.number}</div>
            <div className="desc">{h.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
