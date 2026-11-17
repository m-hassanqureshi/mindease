import { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { subscribeToasts } from '../utils/toast';

const ICONS = { success: CheckCircle2, error: AlertTriangle, info: Info };

export default function ToastHost() {
  const [items, setItems] = useState([]);

  useEffect(
    () =>
      subscribeToasts((t) => {
        setItems((prev) => [...prev, t]);
        window.setTimeout(() => {
          setItems((prev) => prev.filter((x) => x.id !== t.id));
        }, t.duration);
      }),
    []
  );

  const dismiss = (id) => setItems((prev) => prev.filter((x) => x.id !== id));

  return (
    <div className="toast-host" role="status" aria-live="polite">
      {items.map((t) => {
        const Icon = ICONS[t.type] || Info;
        return (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <Icon size={18} className="toast-icon" />
            <span className="toast-msg">{t.message}</span>
            <button className="toast-close" onClick={() => dismiss(t.id)} aria-label="Dismiss notification">
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
