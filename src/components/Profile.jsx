import { useRef, useState } from 'react'
import { User, Save, Trash2, Download, Upload, Trophy, Lock, Sprout, Flame, Zap, BookOpen, PenLine, CheckCircle2, MessageCircle, Wind } from 'lucide-react'
import { toast } from '../utils/toast'
import { useInstallPrompt } from '../utils/useInstallPrompt'

const ACH_ICONS = {
  sprout: Sprout,
  flame: Flame,
  bolt: Zap,
  book: BookOpen,
  pen: PenLine,
  check: CheckCircle2,
  chat: MessageCircle,
  wind: Wind,
}

const ACH_COLORS = {
  sprout: '#10b981',
  flame: '#f97316',
  bolt: '#f59e0b',
  book: '#3b82f6',
  pen: '#8b5cf6',
  check: '#10b981',
  chat: '#06b6d4',
  wind: '#38bdf8',
}

export default function Profile({ nickname, setNickname, theme, toggleTheme, onClearData, achievements = [] }) {
  const [name, setName] = useState(nickname || '')
  const fileRef = useRef(null)
  const { canInstall, installed, promptInstall } = useInstallPrompt()

  const unlockedCount = achievements.filter(a => a.unlocked).length

  const exportData = () => {
    const data = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('mindease-')) data[key] = localStorage.getItem(key)
    }
    const payload = {
      app: 'MindEase',
      version: 1,
      exportedAt: new Date().toISOString(),
      data,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mindease-backup-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    toast('Backup downloaded', 'success')
  }

  const importData = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result)
        const data = parsed?.data
        if (!data || typeof data !== 'object') throw new Error('missing data')
        const keys = Object.keys(data).filter(
          k => k.startsWith('mindease-') && typeof data[k] === 'string'
        )
        if (keys.length === 0) throw new Error('no mindease data')
        keys.forEach(k => localStorage.setItem(k, data[k]))
        toast('Data imported. Reloading...', 'success')
        setTimeout(() => location.reload(), 900)
      } catch {
        toast('Import failed: not a valid MindEase backup', 'error', 4000)
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="profile-screen fade-in" style={{ padding: '20px' }}>
      <h1>
        <User size={20} style={{ marginRight: '8px', display: 'inline' }} />
        Profile
      </h1>

      <div className="card">
        <h2>Name</h2>
        <input
          type="text"
          value={name}
          onChange={e => {
            setName(e.target.value)
            setNickname(e.target.value)
          }}
          placeholder="Enter your name"
          className="input-field"
          style={{ width: '100%', marginTop: '10px' }}
          maxLength={40}
        />
      </div>

      <div className="card">
        <div className="achievements-head">
          <h2 style={{ margin: 0 }}><Trophy size={18} style={{ display: 'inline', marginRight: '6px' }} /> Achievements</h2>
          <span className="achievements-count">{unlockedCount}/{achievements.length}</span>
        </div>
        <div className="achievements-grid">
          {achievements.map(a => {
            const Icon = ACH_ICONS[a.iconKey] || Trophy
            const color = ACH_COLORS[a.iconKey] || 'var(--accent)'
            return (
              <div key={a.id} className={`ach-badge ${a.unlocked ? 'unlocked' : 'locked'}`} style={{ '--ach-color': color }} title={a.desc}>
                <div className="ach-icon">{a.unlocked ? <Icon size={20} /> : <Lock size={16} />}</div>
                <div className="ach-title">{a.title}</div>
                <div className="ach-desc">{a.desc}</div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="card">
        <h2>Theme</h2>
        <button onClick={toggleTheme} className="btn btn-primary" style={{ marginTop: '10px' }}>
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>

      <div className="card">
        <h2>App</h2>
        <p className="data-note">Install MindEase on your device for quick access and offline use.</p>
        {installed ? (
          <span className="install-badge">Installed</span>
        ) : canInstall ? (
          <button
            className="btn btn-primary"
            onClick={async () => {
              const ok = await promptInstall()
              if (ok) toast('Installing MindEase', 'info')
            }}
          >
            <Download size={16} /> Install app
          </button>
        ) : (
          <p className="data-note" style={{ margin: 0 }}>Open your browser menu and choose "Add to Home Screen" or "Install".</p>
        )}
      </div>

      <div className="card">
        <h2>Your Data</h2>
        <p className="data-note">Everything stays on this device. Back it up or move it elsewhere.</p>
        <div className="data-actions">
          <button className="btn btn-outline" onClick={exportData}>
            <Download size={16} /> Export backup
          </button>
          <button className="btn btn-outline" onClick={() => fileRef.current?.click()}>
            <Upload size={16} /> Import backup
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            style={{ display: 'none' }}
            onChange={e => {
              importData(e.target.files?.[0])
              e.target.value = ''
            }}
          />
        </div>
      </div>

      <button
        onClick={() => toast('Settings saved', 'success')}
        className="btn btn-primary"
        style={{ width: '100%', marginTop: '20px' }}
      >
        <Save size={16} style={{ marginRight: '4px', display: 'inline' }} />
        Save
      </button>

      <div className="card" style={{ marginTop: '20px', borderLeft: '3px solid #ef4444' }}>
        <h2 style={{ color: '#ef4444' }}>Danger Zone</h2>
        <button
          onClick={() => {
            if (confirm('Delete all data? This cannot be undone.')) {
              onClearData?.()
              toast('All data cleared', 'info')
            }
          }}
          className="btn btn-outline"
          style={{ color: '#ef4444', borderColor: '#ef4444', marginTop: '10px' }}
        >
          <Trash2 size={16} style={{ marginRight: '4px', display: 'inline' }} />
          Clear All Data
        </button>
      </div>
    </div>
  )
}
