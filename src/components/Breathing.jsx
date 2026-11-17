import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Square, Wind, Volume2, VolumeX } from 'lucide-react';

const PHASES = [
  { label: 'Breathe In', dur: 4000, cls: 'inhale' },
  { label: 'Hold', dur: 7000, cls: 'hold' },
  { label: 'Breathe Out', dur: 8000, cls: 'exhale' },
];

const RADIUS = 130;
const CIRC = 2 * Math.PI * RADIUS;

export default function Breathing({ onSessionComplete }) {
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [remaining, setRemaining] = useState(PHASES[0].dur);
  const [soundOn, setSoundOn] = useState(false);

  const timer = useRef(null);
  const audioRef = useRef(null);
  const prevPhaseRef = useRef(0);

  // Ambient drone via the Web Audio API (no audio files needed).
  const stopSound = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    try {
      a.osc.stop();
      a.ctx.close();
    } catch {
      /* already stopped */
    }
    audioRef.current = null;
  }, []);

  const startSound = useCallback(() => {
    if (audioRef.current) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 174;
      gain.gain.value = 0.0001;
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 1.2);
      audioRef.current = { ctx, osc, gain };
    } catch {
      /* audio unsupported */
    }
  }, []);

  // Advance phases.
  useEffect(() => {
    if (!active) return;
    timer.current = setTimeout(() => {
      setPhase((p) => (p + 1) % 3);
    }, PHASES[phase].dur);
    return () => clearTimeout(timer.current);
  }, [active, phase]);

  // Count a completed cycle when we wrap from exhale back to inhale.
  useEffect(() => {
    if (active && phase === 0 && prevPhaseRef.current === 2) {
      setCycles((c) => c + 1);
    }
    prevPhaseRef.current = phase;
  }, [phase, active]);

  // Phase countdown for the progress ring.
  useEffect(() => {
    if (!active) {
      setRemaining(PHASES[0].dur);
      return;
    }
    setRemaining(PHASES[phase].dur);
    const started = Date.now();
    const id = setInterval(() => {
      setRemaining(Math.max(0, PHASES[phase].dur - (Date.now() - started)));
    }, 100);
    return () => clearInterval(id);
  }, [active, phase]);

  // Swell the drone with the breath.
  useEffect(() => {
    const a = audioRef.current;
    if (!a || !active) return;
    const now = a.ctx.currentTime;
    const target = phase === 0 ? 0.07 : phase === 1 ? 0.045 : 0.018;
    a.gain.gain.cancelScheduledValues(now);
    a.gain.gain.setValueAtTime(a.gain.gain.value, now);
    a.gain.gain.linearRampToValueAtTime(target, now + PHASES[phase].dur / 1000);
  }, [phase, active]);

  useEffect(() => () => stopSound(), [stopSound]);

  const toggleSound = () => {
    if (soundOn) {
      setSoundOn(false);
      stopSound();
    } else {
      setSoundOn(true);
      startSound();
    }
  };

  const stop = () => {
    setActive(false);
    setPhase(0);
    setRemaining(PHASES[0].dur);
    if (soundOn) setSoundOn(false);
    stopSound();
  };

  const toggle = () => {
    if (active) {
      const completed = cycles;
      stop();
      if (completed > 0 && onSessionComplete) onSessionComplete(completed);
      setCycles(0);
    } else {
      setCycles(0);
      setPhase(0);
      setActive(true);
    }
  };

  const dur = PHASES[phase].dur;
  const offset = CIRC * (1 - remaining / dur);

  return (
    <div className="breathing">
      <div className="breath-stage">
        <svg className="breath-ring" viewBox="0 0 300 300" aria-hidden="true">
          <circle className="ring-track" cx="150" cy="150" r={RADIUS} />
          <circle
            className="ring-progress"
            cx="150"
            cy="150"
            r={RADIUS}
            style={{ strokeDasharray: CIRC, strokeDashoffset: offset }}
          />
        </svg>
        <div className={`breath-circle ${active ? PHASES[phase].cls : ''}`}>
          {active ? (
            <span className="breath-label">
              {PHASES[phase].label}
              <small>{(remaining / 1000).toFixed(1)}s</small>
            </span>
          ) : (
            <Wind size={32} />
          )}
        </div>
      </div>

      <div className="breath-info">
        <h2>4-7-8 Breathing</h2>
        <p>{active ? `Cycle ${cycles + 1}` : 'A calming technique to ease anxiety'}</p>
      </div>

      <div className="breath-controls">
        <button className="btn btn-primary" onClick={toggle}>
          {active ? <><Square size={16} /> Stop</> : <><Play size={16} /> Start</>}
        </button>
        <button
          className={`btn btn-outline${soundOn ? ' active' : ''}`}
          onClick={toggleSound}
          aria-pressed={soundOn}
          title={soundOn ? 'Mute ambient sound' : 'Play ambient sound'}
        >
          {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />} Sound
        </button>
      </div>
    </div>
  );
}
