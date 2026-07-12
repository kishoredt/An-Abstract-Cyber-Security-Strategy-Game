import { useState, useEffect, useRef } from 'react';

interface TimerProps {
  isActive: boolean;         
  onExpire: () => void;
  resetKey: number;
  turnTime?: number;
}

type TimerColor = '#4aff4a' | '#ffff00' | '#ff4a4a';

const DEFAULT_TURN_TIME = 180;

export function Timer({ isActive, onExpire, resetKey, turnTime = DEFAULT_TURN_TIME }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(turnTime);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset timer
  useEffect(() => {
    setTimeLeft(turnTime);
  }, [resetKey, turnTime]);

  // Countdown logic
  useEffect(() => {
    if (!isActive) {
      if (ref.current) clearInterval(ref.current);
      return;
    }
    ref.current = setInterval(() => {
      setTimeLeft((t: number) => {
        if (t <= 1) {
          if (ref.current) clearInterval(ref.current);
          onExpire();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (ref.current) clearInterval(ref.current);
    };
  }, [isActive, resetKey, onExpire]);

  const mins: number = Math.floor(timeLeft / 60);
  const secs: number = timeLeft % 60;
  const pct: number = (timeLeft / turnTime) * 100;

  const color: TimerColor =
    timeLeft > 60 ? '#4aff4a' :
    timeLeft > 30 ? '#ffff00' :
    '#ff4a4a';

  return (
    <div style={{ textAlign: 'center' }}>
      <span style={{ color, fontSize: '20px', fontWeight: 'bold' }}>
        ⏱ {mins}:{secs.toString().padStart(2, '0')}
      </span>
      <div style={{
        width: '120px', height: '5px', backgroundColor: '#333',
        borderRadius: '3px', margin: '3px auto',
      }}>
        <div style={{
          width: `${pct}%`, height: '100%', backgroundColor: color,
          borderRadius: '3px', transition: 'width 1s linear',
        }} />
      </div>
    </div>
  );
}
