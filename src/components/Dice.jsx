import { useState } from 'react';
import { playSound } from '../utils/sounds';

const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

export function Dice({ onRoll, disabled, result }) {
  const [rolling, setRolling] = useState(false);
  const [display, setDisplay] = useState('❓');

  const handleClick = () => {
    if (disabled || rolling) return;
    setRolling(true);
    playSound('dice');
    let count = 0;
    const interval = setInterval(() => {
      setDisplay(DICE_FACES[Math.floor(Math.random() * 6)]);
      if (++count >= 14) {
        clearInterval(interval);
        setRolling(false);
        onRoll();
      }
    }, 75);
  };

  return (
    <div style={{ textAlign: 'center', margin: '6px 0' }}>
      <div
        onClick={handleClick}
        title={disabled ? 'Prepare an attack first' : 'Click to roll!'}
        style={{
          fontSize: '64px',
          cursor: disabled ? 'not-allowed' : rolling ? 'wait' : 'pointer',
          userSelect: 'none',
          display: 'inline-block',
          filter: disabled
            ? 'grayscale(1) opacity(0.3)'
            : 'drop-shadow(0 0 12px #ff6600)',
          transition: 'transform 0.1s',
          transform: rolling ? `rotate(${Math.random() * 20 - 10}deg)` : 'none',
        }}
      >
        {result !== null && !rolling ? DICE_FACES[result - 1] : display}
      </div>
      <div style={{ color: '#888', fontSize: '11px', marginTop: '2px' }}>
        {disabled ? '—' : rolling ? 'Rolling...' : result !== null ? `Rolled: ${result}` : '🎲 Click to roll!'}
      </div>
    </div>
  );
}
