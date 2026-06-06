import { useState, useEffect, useRef } from 'react';
import { TURN_TIME } from '../constants/gameData';

export function Timer({ isActive, onExpire, resetKey }) {
  const [timeLeft, setTimeLeft] = useState(TURN_TIME);
  const ref = useRef();

  // Reset timer when turn changes
  useEffect(() => { setTimeLeft(TURN_TIME); }, [resetKey]);

  // Countdown logic
  useEffect(() => {
    if (!isActive) { clearInterval(ref.current); return; }
    ref.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(ref.current); onExpire(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(ref.current);
  }, [isActive, resetKey]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const pct = (timeLeft / TURN_TIME) * 100;
  const color = timeLeft > 60 ? '#4aff4a' : timeLeft > 30 ? '#ffff00' : '#ff4a4a';

  return (
    <div style={{ textAlign: 'center' }}>
      <span style={{ color, fontSize: '20px', fontWeight: 'bold' }}>
        ⏱ {mins}:{secs.toString().padStart(2, '0')}
      </span>
      <div style={{ width: '120px', height: '5px', backgroundColor: '#333', borderRadius: '3px', margin: '3px auto' }}>
        <div style={{
          width: `${pct}%`, height: '100%', backgroundColor: color,
          borderRadius: '3px', transition: 'width 1s linear'
        }} />
      </div>
    </div>
  );
}
