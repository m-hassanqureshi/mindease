import { useMemo } from 'react';

const WEEKS = 20;

// GitHub-style mood heatmap: one cell per day, colored by the day's mood score.
export default function MoodHeatmap({ moodHistory = [] }) {
  const { cells } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const scores = new Map();
    moodHistory.forEach((m) => {
      const d = new Date(m.date);
      d.setHours(0, 0, 0, 0);
      // keep the latest score for a given day
      scores.set(d.toDateString(), m.score);
    });

    const start = new Date(today);
    start.setDate(start.getDate() - (WEEKS * 7 - 1));
    start.setDate(start.getDate() - start.getDay()); // align to Sunday

    const out = [];
    const cursor = new Date(start);
    while (cursor <= today) {
      const key = cursor.toDateString();
      const score = scores.has(key) ? scores.get(key) : null;
      const level =
        score == null ? 0 : score >= 8 ? 5 : score >= 6 ? 4 : score >= 5 ? 3 : score >= 3 ? 2 : 1;
      out.push({
        key,
        score,
        level,
        label: cursor.toLocaleDateString([], { month: 'short', day: 'numeric' }),
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    return { cells: out };
  }, [moodHistory]);

  return (
    <div className="heatmap-wrap">
      <div className="heatmap">
        {cells.map((c) => (
          <div
            key={c.key}
            className={`heat-cell heat-${c.level}`}
            title={c.score != null ? `${c.label}: ${c.score}/10` : `${c.label}: no entry`}
          />
        ))}
      </div>
      <div className="heat-legend">
        <span>Less</span>
        <i className="heat-cell heat-0" />
        <i className="heat-cell heat-1" />
        <i className="heat-cell heat-2" />
        <i className="heat-cell heat-3" />
        <i className="heat-cell heat-4" />
        <i className="heat-cell heat-5" />
        <span>More</span>
      </div>
    </div>
  );
}
