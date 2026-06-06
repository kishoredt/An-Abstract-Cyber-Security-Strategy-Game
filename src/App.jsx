import { useState } from 'react';
import { Client } from 'boardgame.io/react';
import { Local } from 'boardgame.io/multiplayer';
import { CyberSecurityGame } from './Game';
import { Board } from './components/Board';

const CyberClient = Client({
  game: CyberSecurityGame,
  board: Board,
  multiplayer: Local(),
  debug: false,
});

// ── Start Screen ───────────────────────────────────────────
function StartScreen({ onStart }) {
  const [hover, setHover] = useState(false);
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace',
      background: 'radial-gradient(ellipse at center, #1a0a2e 0%, #050510 100%)',
      color: 'white', padding: '20px', position: 'relative', overflow: 'hidden',
    }}>
      {/* Grid background */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(74,158,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(74,158,255,0.04) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />
      {/* Side glows */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '35%', background: 'linear-gradient(to right, rgba(74,158,255,0.07), transparent)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '35%', background: 'linear-gradient(to left, rgba(255,74,74,0.07), transparent)', pointerEvents: 'none' }} />

      {/* Flags */}
      <div style={{ display: 'flex', gap: '40px', marginBottom: '18px', fontSize: '52px' }}>
        <span style={{ filter: 'drop-shadow(0 0 15px #4a9eff)' }}>🇬🇧</span>
        <span style={{ color: '#ffff00', fontSize: '28px', alignSelf: 'center', fontWeight: 'bold' }}>VS</span>
        <span style={{ filter: 'drop-shadow(0 0 15px #ff4a4a)' }}>🇷🇺</span>
      </div>

      <div style={{ color: '#4affff', fontSize: '11px', letterSpacing: '6px', marginBottom: '8px' }}>⚡ CLASSIFIED ⚡</div>
      <h1 style={{ fontSize: '38px', fontWeight: 'bold', textAlign: 'center', margin: '0 0 6px', color: '#fff', textShadow: '0 0 30px rgba(74,158,255,0.8)', lineHeight: 1.2 }}>
        CYBER SECURITY
      </h1>
      <h1 style={{ fontSize: '38px', fontWeight: 'bold', textAlign: 'center', margin: '0 0 20px', color: '#ffff00', textShadow: '0 0 30px rgba(255,255,0,0.7)' }}>
        STRATEGY GAME
      </h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px', width: '400px' }}>
        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, #4a9eff)' }} />
        <span style={{ color: '#4a9eff', fontSize: '18px' }}>🔐</span>
        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, #ff4a4a)' }} />
      </div>

      <p style={{ color: '#777', fontSize: '12px', textAlign: 'center', maxWidth: '400px', lineHeight: 1.8, marginBottom: '28px' }}>
        A two-player strategy game based on the UK Cyber Security Strategy.<br/>
        Manage resources, protect your entities and outsmart your opponent<br/>
        across 12 turns — January through December 2020.
      </p>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
        {[['👥','2 Players','Hot-seat'],['🗓️','12 Turns','Jan–Dec'],['⏱️','3 Min','Per turn'],['🎲','Dice','Combat'],['🃏','Market','Cards']].map(([icon,label,sub])=>(
          <div key={label} style={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: '8px', padding: '10px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: '20px' }}>{icon}</div>
            <div style={{ color: '#fff', fontSize: '10px', fontWeight: 'bold' }}>{label}</div>
            <div style={{ color: '#555', fontSize: '9px' }}>{sub}</div>
          </div>
        ))}
      </div>

      <button onClick={onStart}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          padding: '16px 54px', fontSize: '18px', fontFamily: 'monospace', fontWeight: 'bold',
          backgroundColor: hover ? '#ffff00' : 'transparent', color: hover ? '#000' : '#ffff00',
          border: '3px solid #ffff00', borderRadius: '8px', cursor: 'pointer',
          letterSpacing: '3px', textTransform: 'uppercase', transition: 'all 0.2s',
          boxShadow: hover ? '0 0 35px rgba(255,255,0,0.7)' : '0 0 12px rgba(255,255,0,0.2)',
        }}>
        ▶ START GAME
      </button>

      <div style={{ position: 'absolute', bottom: '16px', color: '#2a2a2a', fontSize: '10px' }}>
        Based on © Andreas Haggman — Cyber Security Strategy Game
      </div>
    </div>
  );
}

// ── Pass Device Screen ─────────────────────────────────────
function PassDeviceScreen({ team, onReady }) {
  const [hover, setHover] = useState(false);
  const isUK = team === 'UK';
  const color = isUK ? '#4a9eff' : '#ff4a4a';
  const flag = isUK ? '🇬🇧' : '🇷🇺';

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace',
      backgroundColor: '#050510', color: 'white', padding: '20px',
    }}>
      <div style={{ fontSize: '80px', marginBottom: '20px', filter: `drop-shadow(0 0 20px ${color})` }}>{flag}</div>
      <h2 style={{ color, fontSize: '28px', margin: '0 0 10px', textShadow: `0 0 20px ${color}` }}>
        {team} TEAM'S TURN
      </h2>
      <p style={{ color: '#888', fontSize: '14px', textAlign: 'center', marginBottom: '12px', lineHeight: 1.8 }}>
        Pass the device to the <span style={{ color, fontWeight: 'bold' }}>{team}</span> player.<br/>
        Make sure the other player looks away!
      </p>
      <div style={{ width: '200px', height: '2px', background: `linear-gradient(to right, transparent, ${color}, transparent)`, marginBottom: '30px' }} />
      <button onClick={onReady}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          padding: '14px 44px', fontSize: '16px', fontFamily: 'monospace', fontWeight: 'bold',
          backgroundColor: hover ? color : 'transparent', color: hover ? '#000' : color,
          border: `3px solid ${color}`, borderRadius: '8px', cursor: 'pointer',
          letterSpacing: '2px', transition: 'all 0.2s',
          boxShadow: hover ? `0 0 30px ${color}` : `0 0 8px ${color}44`,
        }}>
        ▶ WE'RE READY
      </button>
    </div>
  );
}

// ── App ────────────────────────────────────────────────────
export default function App() {
  const [phase, setPhase] = useState('start');       // start | pass | game
  const [activePlayer, setActivePlayer] = useState('0'); // '0' = UK, '1' = Russia
  const [showPass, setShowPass] = useState(false);
  const [nextPlayer, setNextPlayer] = useState(null);

  // Called when a player ends their turn — show pass screen
  const handleTurnChange = (newPlayer) => {
    setNextPlayer(newPlayer);
    setShowPass(true);
  };

  if (phase === 'start') {
    return <StartScreen onStart={() => { setPhase('pass'); setNextPlayer('0'); setShowPass(true); }} />;
  }

  if (showPass) {
    const team = nextPlayer === '0' ? 'UK' : 'Russia';
    return (
      <PassDeviceScreen
        team={team}
        onReady={() => {
          setActivePlayer(nextPlayer);
          setShowPass(false);
          setPhase('game');
        }}
      />
    );
  }

  // Wrap the Board to intercept turn changes
  const WrappedBoard = (props) => {
    const originalEvents = props.events;
    const wrappedEvents = {
      ...originalEvents,
      endTurn: (...args) => {
        const next = props.ctx.currentPlayer === '0' ? '1' : '0';
        originalEvents.endTurn(...args);
        handleTurnChange(next);
      },
    };
    return <Board {...props} events={wrappedEvents} />;
  };

  const ActiveClient = Client({
    game: CyberSecurityGame,
    board: WrappedBoard,
    multiplayer: Local(),
    debug: false,
  });

  return (
    <div>
      {/* Thin header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: '#070712', borderBottom: '1px solid #1a1a2a',
        padding: '5px 16px',
      }}>
        <span style={{ color: '#4a9eff', fontFamily: 'monospace', fontSize: '11px', fontWeight: 'bold' }}>
          🇬🇧 Player 1 — UK
        </span>
        <span style={{ color: '#ffff00', fontFamily: 'monospace', fontSize: '11px' }}>
          🔐 Cyber Security Strategy Game
        </span>
        <span style={{ color: '#ff4a4a', fontFamily: 'monospace', fontSize: '11px', fontWeight: 'bold' }}>
          Russia — Player 2 🇷🇺
        </span>
      </div>
      <ActiveClient playerID={activePlayer} />
    </div>
  );
}
