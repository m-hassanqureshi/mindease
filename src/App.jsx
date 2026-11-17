import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Home as HomeIcon, MessageCircle, CheckSquare, BarChart3, BookOpen, Wind, User, Sun, Moon, Heart, AlertTriangle } from 'lucide-react'
import Home from './components/Home'
import Chat from './components/Chat'
import Tasks from './components/Tasks'
import Insights from './components/Insights'
import Journal from './components/Journal'
import Breathing from './components/Breathing'
import Profile from './components/Profile'
import Welcome from './components/Welcome'
import CrisisModal from './components/CrisisModal'
import DailyCheckin from './components/DailyCheckin'
import ToastHost from './components/ToastHost'
import { generateWeeklyTasks } from './utils/taskManager'
import { evaluateAchievements } from './utils/achievements'
import { celebrate } from './utils/celebrate'
import { toast } from './utils/toast'

const PAGES = [
  { id: 'home', label: 'Home', icon: HomeIcon },
  { id: 'chat', label: 'Chat', icon: MessageCircle },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'insights', label: 'Insights', icon: BarChart3 },
  { id: 'journal', label: 'Journal', icon: BookOpen },
  { id: 'breathing', label: 'Breathe', icon: Wind },
  { id: 'profile', label: 'Profile', icon: User },
]

function useLocalStorage(key, init) {
  const [val, setVal] = useState(() => { try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init } catch { return init } })
  useEffect(() => { localStorage.setItem(key, JSON.stringify(val)) }, [key, val])
  return [val, setVal]
}

export default function App() {
  const [theme, setTheme] = useLocalStorage('mindease-theme', 'light')
  const [onboarded, setOnboarded] = useLocalStorage('mindease-onboarded', false)
  const [nickname, setNickname] = useLocalStorage('mindease-nickname', '')
  const [page, setPage] = useState('home')
  const [crisisOpen, setCrisisOpen] = useState(false)
  const [showCheckin, setShowCheckin] = useState(false)
  const [moodHistory, setMoodHistory] = useLocalStorage('mindease-moods', [])
  const [chatHistory, setChatHistory] = useLocalStorage('mindease-chat', [])
  const [journals, setJournals] = useLocalStorage('mindease-journals', [])
  const [tasks, setTasks] = useLocalStorage('mindease-tasks', [])
  const [userPreferences, setUserPreferences] = useLocalStorage('mindease-preferences', {})
  const [breathingSessions, setBreathingSessions] = useLocalStorage('mindease-breathing', [])
  const [unlockedAchievements, setUnlockedAchievements] = useLocalStorage('mindease-achievements', [])
  const [currentMood, setCurrentMood] = useState(null)
  const [journalSeed, setJournalSeed] = useState('')
  const [currentWeekTemplate, setCurrentWeekTemplate] = useState('connection')
  const [error, setError] = useState(null)

  const processedRef = useRef(new Set(unlockedAchievements))

  // Initialize tasks if empty
  useEffect(() => {
    try {
      if (!tasks || tasks.length === 0) {
        const newTasks = generateWeeklyTasks('connection');
        setTasks(newTasks);
        setCurrentWeekTemplate('connection');
      }
    } catch (err) {
      console.error('Task init error:', err);
      setError('Failed to initialize tasks');
    }
  }, [])

  useEffect(() => { document.documentElement.setAttribute('data-theme', theme) }, [theme])

  // Daily check-in trigger
  useEffect(() => {
    if (!onboarded) return
    const last = localStorage.getItem('mindease-checkin-date')
    const today = new Date().toDateString()
    if (last !== today) setShowCheckin(true)
  }, [onboarded])

  // Achievement evaluation + one-time celebration for newly unlocked badges.
  const achievements = useMemo(
    () => evaluateAchievements({ moodHistory, journals, tasks, chatHistory, breathingSessions }),
    [moodHistory, journals, tasks, chatHistory, breathingSessions]
  )

  useEffect(() => {
    const unlockedIds = achievements.filter((a) => a.unlocked).map((a) => a.id)
    const fresh = unlockedIds.filter((id) => !processedRef.current.has(id))
    if (fresh.length === 0) return
    fresh.forEach((id) => processedRef.current.add(id))
    setUnlockedAchievements(Array.from(processedRef.current))
    fresh.forEach((id) => {
      const a = achievements.find((x) => x.id === id)
      if (a) toast(`Achievement unlocked: ${a.title}`, 'success', 4500)
    })
    celebrate()
  }, [achievements, setUnlockedAchievements])

  const toggleTheme = useCallback(() => setTheme(t => t === 'dark' ? 'light' : 'dark'), [])

  const saveCheckin = (score, note, question) => {
    const entry = { date: new Date().toISOString(), score, note, question }
    setMoodHistory(h => [...h, entry])
    localStorage.setItem('mindease-checkin-date', new Date().toDateString())
    setShowCheckin(false)
    celebrate(60)
    toast('Check-in saved. Thanks for showing up.', 'success')
  }

  const clearAllData = () => {
    setChatHistory([]); setMoodHistory([]); setJournals([])
    setTasks(generateWeeklyTasks('connection'))
    setBreathingSessions([]); setUnlockedAchievements([])
    processedRef.current = new Set()
    localStorage.removeItem('mindease-checkin-date')
    setNickname('')
    setOnboarded(false)
  }

  if (!onboarded) return <Welcome onStart={(name, prefs) => { setNickname(name); if (prefs) setUserPreferences(prefs); setOnboarded(true) }} />

  if (error) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-primary)', flexDirection: 'column', gap: '20px' }}>
      <div style={{ color: 'var(--danger)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}><AlertTriangle size={24} /> Error</div>
      <div style={{ color: 'var(--text-secondary)' }}>{error}</div>
      <button onClick={() => { setError(null); location.reload(); }} style={{ padding: '10px 20px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Reload App</button>
    </div>
  )

  const renderPage = () => {
    switch (page) {
      case 'home': return <Home nickname={nickname} currentMood={currentMood} setCurrentMood={setCurrentMood} moodHistory={moodHistory} tasks={tasks} onNavigate={setPage} onCrisisClick={() => setCrisisOpen(true)} onStartJournal={(prompt) => { setJournalSeed(prompt); setPage('journal') }} />
      case 'chat': return <Chat history={chatHistory} setHistory={setChatHistory} currentMood={currentMood} setCurrentMood={setCurrentMood} nickname={nickname} onCrisisClick={() => setCrisisOpen(true)} tasks={tasks} setTasks={setTasks} preferences={userPreferences} />
      case 'tasks': return <Tasks tasks={tasks} setTasks={setTasks} currentWeekTemplate={currentWeekTemplate} />
      case 'insights': return <Insights moodHistory={moodHistory} tasks={tasks} chatHistory={chatHistory} journals={journals} nickname={nickname} />
      case 'journal': return <Journal entries={journals} setEntries={setJournals} initialText={journalSeed} />
      case 'breathing': return <Breathing onSessionComplete={(n) => {
        setBreathingSessions(s => [...s, { date: new Date().toISOString(), cycles: n }])
        toast(`Breathing session complete: ${n} cycle${n > 1 ? 's' : ''}`, 'success')
        celebrate(50)
      }} />
      case 'profile': return <Profile nickname={nickname} setNickname={setNickname} userPreferences={userPreferences} setUserPreferences={setUserPreferences} theme={theme} toggleTheme={toggleTheme} onClearData={clearAllData} achievements={achievements} />
      default: return null
    }
  }

  return (
    <>
      {/* Sidebar (desktop) */}
      <aside className="sidebar" aria-label="Navigation sidebar">
        <div className="logo"><Heart size={20} style={{color: '#ec4899', display: 'inline', marginRight: '6px'}} /> <span>MindEase</span></div>
        {PAGES.map(p => (
          <button 
            key={p.id} 
            className={`nav-item${page === p.id ? ' active' : ''}`} 
            onClick={() => setPage(p.id)}
            aria-label={`Go to ${p.label}`}
            aria-current={page === p.id ? 'page' : undefined}
          >
            <p.icon size={18} /> {p.label}
          </button>
        ))}
        <div className="sidebar-footer">
          <button className="nav-item" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />} {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="main">{renderPage()}</main>

      {/* Mobile bottom nav */}
      <nav className="mobile-nav">
        {PAGES.map(p => (
          <button key={p.id} className={page === p.id ? 'active' : ''} onClick={() => setPage(p.id)} aria-label={`Go to ${p.label}`}>
            <p.icon size={18} />
          </button>
        ))}
      </nav>

      {crisisOpen && <CrisisModal onClose={() => setCrisisOpen(false)} onGoToBreathing={() => { setPage('breathing'); setCrisisOpen(false) }} />}
      {showCheckin && <DailyCheckin onSave={saveCheckin} onSkip={() => setShowCheckin(false)} />}
      <ToastHost />
    </>
  )
}
