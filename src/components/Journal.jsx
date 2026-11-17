import { useState, useEffect } from 'react'
import { Plus, Trash2, BookOpen } from 'lucide-react'
import { MOODS, getMood } from '../utils/moods'

export default function Journal({ entries, setEntries, initialText }) {
  const [text, setText] = useState('')
  const [mood, setMood] = useState('Neutral')

  useEffect(() => {
    if (initialText) setText(initialText)
  }, [])

  const save = () => {
    if (!text.trim()) return
    setEntries(e => [{ id: Date.now(), date: new Date().toISOString(), mood, content: text.trim() }, ...e])
    setText(''); setMood('Neutral')
  }

  const remove = id => setEntries(e => e.filter(x => x.id !== id))

  return (
    <div className="journal">
      <h1>Journal</h1>
      <div className="journal-editor glass" style={{ padding: 20, marginBottom: 20 }}>
        <div className="mood-picker-row" style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {MOODS.map(m => {
            const active = mood === m.label
            return (
              <button
                key={m.label}
                onClick={() => setMood(m.label)}
                aria-label={m.label}
                title={m.label}
                style={{ color: active ? m.color : 'var(--text-muted)', opacity: active ? 1 : 0.5, transition: 'opacity .2s, color .2s' }}
              >
                <m.Icon size={24} />
              </button>
            )
          })}
        </div>
        <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Write your thoughts here..." />
        <button className="btn btn-primary" onClick={save} style={{ marginTop: 12 }}><Plus size={16} /> Save Entry</button>
      </div>
      <div className="journal-entries">
        {entries.map(e => {
          const m = getMood(e.mood)
          return (
            <div key={e.id} className="journal-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="date">{new Date(e.date).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                <button className="btn-ghost" onClick={() => remove(e.id)} aria-label="Delete entry"><Trash2 size={14} /></button>
              </div>
              <div className="mood-tag" style={{ color: m.color, background: `color-mix(in srgb, ${m.color} 15%, transparent)` }}><m.Icon size={13} style={{ verticalAlign: '-2px', marginRight: 4 }} />{m.label}</div>
              <p>{e.content}</p>
            </div>
          )
        })}
        {entries.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: 40 }}><BookOpen style={{display: 'inline', marginRight: '6px'}} /> Your journal is empty. Start writing to capture your thoughts.</p>}
      </div>
    </div>
  )
}
