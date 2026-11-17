import { Sparkles, Timer, PenLine, ArrowRight } from 'lucide-react';
import { getDailyPractice, getDailyPrompt } from '../utils/dailyContent';

export default function DailyCard({ onStartJournal }) {
  const practice = getDailyPractice();
  const prompt = getDailyPrompt();

  return (
    <div className="card daily-card">
      <div className="daily-head">
        <span className="daily-badge"><Sparkles size={16} /> Today's practice</span>
        <span className="daily-time"><Timer size={14} /> {practice.minutes} min</span>
      </div>
      <h3 className="daily-title">{practice.title}</h3>
      <ol className="practice-steps">
        {practice.steps.map((s, i) => <li key={i}>{s}</li>)}
      </ol>
      <div className="prompt-box">
        <div className="prompt-label"><PenLine size={14} /> Journal prompt</div>
        <p>{prompt}</p>
        {onStartJournal && (
          <button className="btn btn-outline btn-small" onClick={() => onStartJournal(prompt)}>
            Write about this <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
