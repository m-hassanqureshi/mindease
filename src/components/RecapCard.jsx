import { Download, Share2 } from 'lucide-react';
import { getWeekStats, downloadRecapPng } from '../utils/recap';
import { toast } from '../utils/toast';

export default function RecapCard({ moodHistory, tasks, journals, nickname }) {
  const stats = getWeekStats({ moodHistory, tasks, journals, nickname });

  const handleSave = async () => {
    const ok = await downloadRecapPng(stats);
    toast(ok ? 'Recap image downloaded' : 'Could not create the recap image', ok ? 'success' : 'error');
  };

  return (
    <div className="card recap-card">
      <div className="recap-head">
        <h2 style={{ margin: 0, fontSize: '1rem' }}>
          <Share2 size={18} style={{ display: 'inline', marginRight: 6, color: 'var(--accent)' }} />
          Weekly recap
        </h2>
        <button className="btn btn-outline btn-small" onClick={handleSave}>
          <Download size={14} /> Save image
        </button>
      </div>
      <div className="recap-stats">
        <div className="recap-stat"><span className="recap-value">{stats.avg}</span><span className="recap-label">Avg mood</span></div>
        <div className="recap-stat"><span className="recap-value">{stats.entries}</span><span className="recap-label">Check-ins</span></div>
        <div className="recap-stat"><span className="recap-value">{stats.streak}</span><span className="recap-label">Day streak</span></div>
        <div className="recap-stat"><span className="recap-value">{stats.completed}/{stats.totalTasks}</span><span className="recap-label">Tasks</span></div>
      </div>
    </div>
  );
}
