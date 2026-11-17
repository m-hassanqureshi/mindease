import { useMemo } from 'react'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip } from 'chart.js'
import { BarChart3, TrendingUp, TrendingDown, Minus, Check, Brain, Lightbulb } from 'lucide-react'
import { generateWeeklyInsights, getChartData } from '../utils/analytics'
import MoodHeatmap from './MoodHeatmap'
import RecapCard from './RecapCard'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

export default function Insights({ moodHistory, tasks, chatHistory, journals = [], nickname = '' }) {
  const insights = useMemo(() => {
    return generateWeeklyInsights({ moodHistory, tasks, chatHistory });
  }, [moodHistory, tasks, chatHistory]);
  
  const chartData = useMemo(() => {
    const data = getChartData(moodHistory.slice(-7));
    return {
      labels: data.labels,
      datasets: [{
        data: data.data,
        fill: true,
        tension: 0.4,
        borderColor: '#7c3aed',
        backgroundColor: 'rgba(124,58,237,.12)',
        pointBackgroundColor: '#7c3aed',
        pointRadius: 5,
      }]
    };
  }, [moodHistory]);
  
  const chartOpts = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        min: 0,
        max: 10,
        ticks: { color: '#64748b' },
        grid: { color: 'rgba(148,163,184,0.08)' }
      },
      x: {
        ticks: { color: '#64748b' },
        grid: { display: false }
      }
    }
  };
  
  const emotionBars = Object.entries(insights.emotionBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  return (
    <div className="insights-screen fade-in">
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1><BarChart3 size={28} style={{display: 'inline', marginRight: '8px', color: 'var(--accent)'}} /> Weekly Insights</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>Your wellness journey this week</p>
      </div>
      
      {/* Mood Trend */}
      <div className="card">
        <h2 style={{ marginBottom: 16, fontSize: '1rem' }}><TrendingUp size={18} style={{display: 'inline', marginRight: '6px', color: 'var(--accent)'}} /> Mood Trend</h2>
        {moodHistory.length > 1 ? (
          <>
            <div className="chart-container">
              <Line data={chartData} options={chartOpts} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Average Mood</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 600, color: 'var(--primary)' }}>
                  {insights.weekMoodAvg}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Change</div>
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: '1.8rem', 
                  fontWeight: 600,
                  color: insights.moodTrend.change > 0 ? '#10b981' : insights.moodTrend.change < 0 ? '#ef4444' : '#64748b'
                }}>
                  {insights.moodTrend.trend === 'up' ? <TrendingUp size={26} /> : insights.moodTrend.trend === 'down' ? <TrendingDown size={26} /> : <Minus size={26} />}
                  <span>{insights.moodTrend.change > 0 ? '+' : ''}{insights.moodTrend.change}</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
            More mood entries needed for trends
          </p>
        )}
      </div>
      
      {/* Weekly recap */}
      <RecapCard moodHistory={moodHistory} tasks={tasks} journals={journals} nickname={nickname} />

      {/* Mood Heatmap */}
      <div className="card" style={{ marginTop: 16 }}>
        <h2 style={{ marginBottom: 12, fontSize: '1rem' }}><BarChart3 size={18} style={{display: 'inline', marginRight: '6px', color: 'var(--accent-calm)'}} /> Mood Heatmap</h2>
        <MoodHeatmap moodHistory={moodHistory} />
      </div>

      {/* Task Completion */}
      <div className="card" style={{ marginTop: 16 }}>
        <h2 style={{ marginBottom: 12, fontSize: '1rem' }}><Check size={18} style={{display: 'inline', marginRight: '6px', color: 'var(--success)'}} /> Task Completion</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="progress-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>This Week</span>
              <span style={{ fontSize: '0.9rem', color: 'var(--primary)' }}>{insights.taskCompletion}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${insights.taskCompletion}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Emotion Breakdown */}
      <div className="card" style={{ marginTop: 16 }}>
        <h2 style={{ marginBottom: 12, fontSize: '1rem' }}><Brain size={18} style={{display: 'inline', marginRight: '6px', color: 'var(--accent-calm)'}} /> Emotion Breakdown</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {emotionBars.map(([emotion, percentage]) => (
            <div key={emotion}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: '0.9rem' }}>{emotion}</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{percentage}%</span>
              </div>
              <div className="progress-bar" style={{ height: '6px' }}>
                <div 
                  className="progress-fill" 
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Insights & Suggestions */}
      <div className="card" style={{ marginTop: 16 }}>
        <h2 style={{ marginBottom: 12, fontSize: '1rem' }}><Lightbulb size={18} style={{display: 'inline', marginRight: '6px', color: 'var(--warning)'}} /> Key Insights</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {insights.insights.map((insight, idx) => (
            <div 
              key={idx}
              style={{
                padding: '10px 12px',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '8px',
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
                borderLeft: '3px solid var(--primary)'
              }}
            >
              {insight}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
