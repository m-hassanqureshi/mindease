import { useState, useRef, useEffect } from 'react'
import { Send, Mic, MicOff, Phone, Zap, Lightbulb, Target, Check, SkipForward, AlertCircle, Heart } from 'lucide-react'
import { detectEmotion, getCopingSuggestion, calculateEmpathyScore } from '../utils/emotionDetection'
import { getTodayTask } from '../utils/taskManager'
import { toast } from '../utils/toast'
import { MOODS } from '../utils/moods'

export default function Chat({ history, setHistory, currentMood, setCurrentMood, nickname, onCrisisClick, tasks, setTasks, preferences }) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [listening, setListening] = useState(false)
  const [justFinishedListening, setJustFinishedListening] = useState(false) // Show "Send Voice" button
  const [interimTranscript, setInterimTranscript] = useState('') // Show live transcription
  const [empathyScore, setEmpathyScore] = useState(0)
  const [detectedEmotion, setDetectedEmotion] = useState(null)
  const [copingSuggestion, setCopingSuggestion] = useState(null)
  const [rateLimitInfo, setRateLimitInfo] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const [todayTask, setTodayTask] = useState(null)
  const endRef = useRef(null)
  const recogRef = useRef(null)
  const retryQueueRef = useRef(null) // Store pending message for retry

  useEffect(() => {
    if (tasks) {
      setTodayTask(getTodayTask(tasks))
    }
  }, [tasks])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [history, loading])

  // Enhanced Web Speech API
  const toggleVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      toast("Voice input isn't supported in this browser", 'error')
      return
    }
    
    if (listening) { 
      recogRef.current?.stop()
      setListening(false)
      setInterimTranscript('')
      return 
    }
    
    const r = new SR()
    r.continuous = false // Stop after one sentence
    r.interimResults = true // Show text while speaking
    r.lang = 'en-US'
    
    // Track transcripts at function level (closure)
    let finalTranscript = ''
    let lastResultIndex = 0
    
    r.onstart = () => {
      setListening(true)
      setInterimTranscript('')
      finalTranscript = ''
      lastResultIndex = 0
    }
    
    r.onresult = (e) => {
      let interim = ''
      
      // Process only new results since last callback
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript
        
        if (e.results[i].isFinal) {
          finalTranscript += transcript + ' '
          // Add final result to input immediately
          setInput(prev => {
            const newText = (prev + ' ' + transcript).trim()
            return newText
          })
        } else {
          interim += transcript
        }
      }
      
      // Show live interim text while speaking
      setInterimTranscript(interim || finalTranscript.trim())
    }
    
    r.onerror = (e) => {
      console.error('Speech error:', e.error)
      let errorMsg = ''
      switch(e.error) {
        case 'no-speech': errorMsg = 'No speech detected. Try again.'; break
        case 'network': errorMsg = 'Network error. Check connection.'; break
        case 'not-allowed': errorMsg = 'Microphone permission denied.'; break
        default: errorMsg = 'Voice input error. Try again.'
      }
      setInterimTranscript(errorMsg)
      setListening(false)
    }
    
    r.onend = () => {
      setListening(false)
      if (input.trim()) {
        setJustFinishedListening(true) // Show "Send Voice Message" button
      }
      setInterimTranscript('') // Clear the transcript display
      // Text remains in input field for user to review/send
    }
    
    recogRef.current = r
    try {
      r.start()
    } catch (err) {
      console.error('Speech recognition error:', err)
      setListening(false)
    }
  }

  const send = async (messageData = null, attempt = 0) => {
    // Retry mechanism for rate limiting
    if (messageData && attempt > 0) {
      // Exponential backoff: 2^attempt seconds (2s, 4s, 8s, etc.)
      const delayMs = Math.pow(2, attempt) * 1000;
      console.log(`Retry attempt ${attempt} in ${delayMs}ms`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
    
    const data = messageData || {
      text: input.trim(),
      emotion: detectedEmotion,
    };
    
    if (!data.text || loading) return;
    
    const text = data.text;
    const emotion = data.emotion || detectEmotion(text);
    if (emotion && !data.emotion) {
      setDetectedEmotion(emotion);
      setCopingSuggestion(getCopingSuggestion(emotion));
    }
    
    const userMsg = { role: 'user', content: text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    const next = messageData ? history : [...history, userMsg];
    
    if (!messageData) {
      setHistory(next);
      setInput('');
    }
    
    setLoading(true);
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next.map(m => ({ role: m.role, content: m.content })),
          mood: currentMood,
          detectedEmotion: emotion,
          preferences,
        }),
      });
      
      // Safely parse JSON - prevents crash on empty/HTML 502 responses
      const responseText = await res.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        console.error('Non-JSON response:', res.status, responseText.slice(0, 200));
        throw new Error(
          res.status === 502
            ? 'API server is not running. Start it with: npm run dev:api'
            : `Server returned invalid response (${res.status})`
        );
      }
      
      // Capture rate limit info
      if (responseData.remaining_requests || responseData.remaining_tokens) {
        setRateLimitInfo({
          requests: parseInt(responseData.remaining_requests) || null,
          tokens: parseInt(responseData.remaining_tokens) || null,
        });
      }
      
      if (!res.ok) {
        // Handle rate limit with exponential backoff
        if (res.status === 429 && attempt < 3) {
          setRetryCount(attempt + 1);
          const retryAfter = responseData.retryAfter || Math.pow(2, attempt + 1);
          
          setHistory([
            ...next,
            {
              role: 'assistant',
              content: `I'm taking a quick breather (limit). Retrying in ${retryAfter}s...`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
          
          // Store message data and retry
          retryQueueRef.current = { text, emotion };
          return send(messageData || { text, emotion }, attempt + 1);
        }
        
        const error = responseData.error || `API error: ${res.status}`;
        throw new Error(error);
      }
      
      const reply = responseData.reply || 'I appreciate you sharing that. Please try again.';
      
      // Calculate empathy score
      const score = calculateEmpathyScore(text, reply);
      setEmpathyScore(prev => Math.round((prev + score) / 2));
      
      setHistory([
        ...next,
        {
          role: 'assistant',
          content: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setRetryCount(0);
    } catch (err) {
      console.error('Chat error:', err);
      let errorMsg = "Sorry, I'm having trouble right now. Please try again in a moment.";
      if (err.message.includes('rate_limit')) {
        errorMsg =
          "I've reached my limit. Please wait a moment and try again. I'll get back to you as soon as I can.";
      } else if (err.message.includes('fetch')) {
        errorMsg = "I'm having trouble connecting. Please check your internet and try again.";
      }
      setHistory([
        ...next,
        { role: 'assistant', content: errorMsg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      ]);
      setRetryCount(0);
    }
    setLoading(false);
  }

  // Send voice message (after transcription is complete)
  const sendVoiceMessage = () => {
    send()
    setJustFinishedListening(false)
  }

  // Mood selector overlay
  if (!currentMood) return (
    <div className="mood-overlay">
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: 6 }}>How are you feeling{nickname ? `, ${nickname}` : ''}?</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: '.9rem' }}>This helps me tailor my support for you</p>
        <div className="mood-card-grid">
          {MOODS.map(m => (
            <div key={m.label} className="mood-card" style={{ '--mood-color': m.color }} onClick={() => setCurrentMood(m.label)}>
              <div className="emoji" style={{ color: m.color }}><m.Icon size={36} /></div>
              <div className="label">{m.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <>
      <div className="chat-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '8px', flexWrap: 'wrap' }}>
          <h2 style={{ minWidth: '120px' }}><Heart size={20} style={{display: 'inline', marginRight: '8px', color: '#ec4899'}} /> MindEase Chat</h2>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'nowrap' }}>
            {empathyScore > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '.75rem', color: 'var(--primary)', fontWeight: '500', whiteSpace: 'nowrap' }}>
                <Zap size={14} />
                <span style={{ display: 'none' }}>Empathy: </span>{empathyScore}%
              </div>
            )}
            {rateLimitInfo && rateLimitInfo.tokens && (
              <div style={{ fontSize: '.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }} title={`Tokens remaining: ${rateLimitInfo.tokens}`}>
                {rateLimitInfo.tokens < 1000 ? <><AlertCircle size={12} /> Low</> : <Check size={12} />}
              </div>
            )}
            <button className="btn btn-ghost" style={{ fontSize: '.75rem', padding: '6px 12px' }} onClick={() => setCurrentMood(null)}>Change mood</button>
            {onCrisisClick && <button 
              className="crisis-header-btn" 
              onClick={onCrisisClick}
              aria-label="Open crisis support"
              title="Crisis Support"
            >
              <Phone size={18} />
            </button>}
          </div>
        </div>
      </div>
      
      {detectedEmotion && copingSuggestion && (
        <div style={{ 
          padding: '12px 16px', 
          background: 'linear-gradient(135deg, var(--bg-secondary), var(--primary-light))',
          borderLeft: '4px solid var(--primary)',
          fontSize: '.9rem',
          margin: '8px 16px 0'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '6px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}><Lightbulb size={16} /> {copingSuggestion.activity}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '.85rem' }}>Try: {copingSuggestion.techniques.slice(0, 2).join(', ')}</div>
        </div>
      )}
      
      <div className="messages" role="log" aria-label="Chat message history" aria-live="polite">
        {history.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: '20vh', color: 'var(--text-muted)' }} className="fade-in">
            <p style={{ fontSize: '2.5rem', marginBottom: 8 }}><Heart size={40} style={{color: '#ec4899'}} /></p>
            <p style={{ fontSize: '.95rem' }}>Hi{nickname ? ` ${nickname}` : ''}! I'm here to listen. Share what's on your mind.</p>
          </div>
        )}
        {todayTask && history.length === 0 && (
          <div style={{
            padding: '14px',
            margin: '16px 8px 0',
            background: 'linear-gradient(135deg, var(--bg-secondary), rgba(124,58,237,.08))',
            border: '1px solid rgba(124,58,237,.2)',
            borderRadius: 'var(--radius)',
            fontSize: '.9rem'
          }}>
            <div style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '6px' }}><Target size={16} /> Today's Task</div>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '10px' }}>{todayTask.title}</div>
            <div style={{ display: 'flex', gap: '8px', fontSize: '.85rem' }}>
              <button 
                onClick={() => {
                  if (setTasks) {
                    setTasks(t => t.map(task => 
                      task.id === todayTask.id ? { ...task, completed: true } : task
                    ))
                  }
                }}
                style={{
                  padding: '6px 12px',
                  background: 'var(--success)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  justifyContent: 'center'
                }}
              >
                <Check size={14} /> Done
              </button>
              <button 
                onClick={() => {
                  if (setTasks) {
                    setTasks(t => t.map(task => 
                      task.id === todayTask.id ? { ...task, skipped:true } : task
                    ))
                  }
                }}
                style={{
                  padding: '6px 12px',
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  justifyContent: 'center'
                }}
              >
                <SkipForward size={14} /> Skip
              </button>
            </div>
          </div>
        )}
        {history.map((m, i) => (
          <div key={i} className={`msg ${m.role === 'user' ? 'user' : 'bot'}`}>
            {m.content}
            <div className="meta">{m.time}</div>
          </div>
        ))}
        {loading && <div className="typing"><span /><span /><span /></div>}
        <div ref={endRef} />
      </div>
      {interimTranscript && (
        <div style={{ 
          padding: '8px 16px', 
          background: 'var(--bg-tertiary)', 
          borderBottom: '1px solid var(--border)',
          fontSize: '.85rem',
          color: listening ? 'var(--accent)' : 'var(--danger)',
          fontStyle: 'italic',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          {listening ? <Mic size={16} /> : <MicOff size={16} />} {interimTranscript}
        </div>
      )}
      <div className="chat-input-bar">
        <button 
          onClick={toggleVoice} 
          style={{ background: listening ? 'var(--danger)' : 'var(--bg-tertiary)', color: listening ? '#fff' : 'var(--text-secondary)' }}
          aria-label={listening ? 'Stop voice input' : 'Start voice input'}
          aria-pressed={listening}
          title={listening ? 'Click to stop recording' : 'Click to start voice input'}
        >
          {listening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>
        <input 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && send()} 
          placeholder={listening ? 'Listening...' : 'Type your thoughts...'} 
          aria-label="Chat message input"
        />
        <button 
          onClick={() => justFinishedListening ? sendVoiceMessage() : send()} 
          disabled={!input.trim() || loading}
          aria-label={justFinishedListening ? 'Send voice message' : 'Send message'}
          title={justFinishedListening ? 'Send voice message' : 'Send message'}
          style={{ background: justFinishedListening ? 'linear-gradient(135deg, var(--accent), var(--accent-calm))' : 'var(--accent)', transition: 'all 0.3s' }}
        >
          {justFinishedListening ? <Send size={18} style={{animation: 'pulse 1.5s infinite'}} /> : <Send size={18} />}
        </button>
      </div>
      {justFinishedListening && (
        <div style={{
          padding: '10px 16px',
          background: 'linear-gradient(135deg, rgba(124,58,237,.1), rgba(6,182,212,.1))',
          borderTop: '2px solid var(--accent)',
          fontSize: '.85rem',
          color: 'var(--accent)',
          fontWeight: '500',
          textAlign: 'center',
          animation: 'pulse 1s infinite',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px'
        }}>
          <Mic size={16} /> Voice transcribed - Ready to send
        </div>
      )}
    </>
  )
}
