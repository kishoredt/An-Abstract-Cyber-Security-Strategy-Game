import { useState, useRef } from 'react';
import { Client } from 'boardgame.io/react';
import { Local } from 'boardgame.io/multiplayer';
import { CyberSecurityGame } from './Game';
import { Board } from './components/Board';
import { RulesScreen } from './components/RulesScreen';
import { makeDifficultyBot, AI_DIFFICULTIES } from './ai/aiConfig';

// Start Screen
function StartScreen({ onSelectMode, onShowRules }) {
  const [hoverBtn, setHoverBtn] = useState(null);

  const ModeButton = ({ id, icon, title, subtitle, color, onClick }) => (
    <button
      onClick={onClick}
      onMouseEnter={() => setHoverBtn(id)}
      onMouseLeave={() => setHoverBtn(null)}
      style={{
        padding: '20px 40px', fontSize: '16px', fontFamily: 'monospace', fontWeight: 'bold',
        backgroundColor: hoverBtn === id ? color : 'transparent',
        color: hoverBtn === id ? '#000' : color,
        border: `3px solid ${color}`, borderRadius: '10px', cursor: 'pointer',
        transition: 'all 0.2s',
        boxShadow: hoverBtn === id ? `0 0 35px ${color}` : `0 0 10px ${color}33`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
        minWidth: '220px',
      }}
    >
      <span style={{ fontSize: '32px' }}>{icon}</span>
      <span style={{ letterSpacing: '2px' }}>{title}</span>
      <span style={{ fontSize: '10px', opacity: 0.7, fontWeight: 'normal' }}>{subtitle}</span>
    </button>
  );

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

      <p style={{ color: '#777', fontSize: '12px', textAlign: 'center', maxWidth: '420px', lineHeight: 1.8, marginBottom: '32px' }}>
        A two-player strategy game based on the UK Cyber Security Strategy.<br/>
        Manage resources, protect your entities and outsmart your opponent<br/>
        across 12 turns — January through December 2020.
      </p>

      {/* Mode buttons */}
      <div style={{ color: '#aaa', fontSize: '13px', marginBottom: '16px', letterSpacing: '2px' }}>SELECT GAME MODE</div>
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '24px' }}>
        <ModeButton id="2p" icon="👥" title="2 PLAYERS" subtitle="Hot-seat — pass the device" color="#4aff4a" onClick={() => onSelectMode('2player')} />
        <ModeButton id="ai" icon="🤖" title="VS AI" subtitle="Play against the computer" color="#ff8800" onClick={() => onSelectMode('ai')} />
      </div>

      {/* How to Play button */}
      <button
        onClick={onShowRules}
        onMouseEnter={() => setHoverBtn('rules')}
        onMouseLeave={() => setHoverBtn(null)}
        style={{
          padding: '10px 30px', fontSize: '13px', fontFamily: 'monospace',
          backgroundColor: hoverBtn === 'rules' ? '#1a1a3a' : 'transparent',
          color: '#4a9eff', border: '2px solid #4a9eff',
          borderRadius: '8px', cursor: 'pointer', letterSpacing: '2px',
          transition: 'all 0.2s', marginBottom: '28px',
          boxShadow: hoverBtn === 'rules' ? '0 0 20px rgba(74,158,255,0.3)' : 'none',
        }}
      >
        📖 HOW TO PLAY
      </button>

      {/* Info badges */}
      <div style={{ display: 'flex', gap: '12px' }}>
        {[['🗓️','12 Turns','Jan–Dec'],['⏱️','3 Min','Per turn'],['🎲','Dice','Combat'],['🃏','Market','Cards']].map(([icon,label,sub])=>(
          <div key={label} style={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: '8px', padding: '8px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: '16px' }}>{icon}</div>
            <div style={{ color: '#fff', fontSize: '9px', fontWeight: 'bold' }}>{label}</div>
            <div style={{ color: '#555', fontSize: '8px' }}>{sub}</div>
          </div>
        ))}
      </div>

      <div style={{ position: 'absolute', bottom: '16px', color: '#2a2a2a', fontSize: '10px' }}>
        Based on © Andreas Haggman — Cyber Security Strategy Game · Heriot-Watt University Dissertation
      </div>
    </div>
  );
}

// ── AI Difficulty Screen ───────────────────────────────────
function AIDifficultyScreen({ onSelect, onBack }) {
  const [hover, setHover] = useState(null);
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', backgroundColor: '#050510', color: 'white', padding: '20px' }}>
      <div style={{ fontSize: '50px', marginBottom: '10px' }}>🤖</div>
      <h2 style={{ color: '#ff8800', fontSize: '26px', marginBottom: '6px' }}>SELECT AI DIFFICULTY</h2>
      <p style={{ color: '#777', fontSize: '12px', marginBottom: '28px' }}>You will play as 🇬🇧 UK against the AI playing 🇷🇺 Russia</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '320px' }}>
        {Object.entries(AI_DIFFICULTIES).map(([key, lvl]) => (
          <button key={key} onClick={() => onSelect(key)}
            onMouseEnter={() => setHover(key)} onMouseLeave={() => setHover(null)}
            style={{
              padding: '16px 20px', fontFamily: 'monospace', textAlign: 'left',
              backgroundColor: hover === key ? '#1a1a1a' : '#0e0e0e',
              border: `2px solid ${hover === key ? '#ff8800' : '#333'}`,
              borderRadius: '8px', cursor: 'pointer', color: 'white', transition: 'all 0.15s',
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '20px' }}>{lvl.icon}</span>
              <span style={{ fontSize: '15px', fontWeight: 'bold' }}>{lvl.label}</span>
            </div>
            <div style={{ color: '#888', fontSize: '11px', marginTop: '4px' }}>{lvl.desc}</div>
          </button>
        ))}
      </div>
      <button onClick={onBack} style={{ marginTop: '30px', padding: '8px 20px', backgroundColor: 'transparent', color: '#666', border: '1px solid #444', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontFamily: 'monospace' }}>
        ← Back
      </button>
    </div>
  );
}

// Pass Device Screen
function PassDeviceScreen({ team, onReady }) {
  const [hover, setHover] = useState(false);
  const isUK = team === 'UK';
  const color = isUK ? '#4a9eff' : '#ff4a4a';
  const flag = isUK ? '🇬🇧' : '🇷🇺';
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', backgroundColor: '#050510', color: 'white', padding: '20px' }}>
      <div style={{ fontSize: '80px', marginBottom: '20px', filter: `drop-shadow(0 0 20px ${color})` }}>{flag}</div>
      <h2 style={{ color, fontSize: '28px', margin: '0 0 10px', textShadow: `0 0 20px ${color}` }}>{team} TEAM'S TURN</h2>
      <p style={{ color: '#888', fontSize: '14px', textAlign: 'center', marginBottom: '12px', lineHeight: 1.8 }}>
        Pass the device to the <span style={{ color, fontWeight: 'bold' }}>{team}</span> player.<br/>
        Make sure the other player looks away!
      </p>
      <div style={{ width: '200px', height: '2px', background: `linear-gradient(to right, transparent, ${color}, transparent)`, marginBottom: '30px' }} />
      <button onClick={onReady}
        onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
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

function TopHeader({ aiMode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#070712', borderBottom: '1px solid #1a1a2a', padding: '5px 16px' }}>
      <span style={{ color: '#4a9eff', fontFamily: 'monospace', fontSize: '11px', fontWeight: 'bold' }}>
        🇬🇧 {aiMode ? 'You' : 'Player 1'} — UK
      </span>
      <span style={{ color: '#ffff00', fontFamily: 'monospace', fontSize: '11px' }}>🔐 Cyber Security Strategy Game</span>
      <span style={{ color: '#ff4a4a', fontFamily: 'monospace', fontSize: '11px', fontWeight: 'bold' }}>
        {aiMode ? '🤖 AI Bot' : 'Russia — Player 2'} 🇷🇺
      </span>
    </div>
  );
}

// 2-Player Game
function TwoPlayerGame() {
  const [activePlayer, setActivePlayer] = useState('0');
  const [showPass, setShowPass] = useState(true);
  const [nextPlayer, setNextPlayer] = useState('0');

  const WrappedBoard = (props) => {
    const wrappedEvents = {
      ...props.events,
      endTurn: (...args) => {
        const next = props.ctx.currentPlayer === '0' ? '1' : '0';
        props.events.endTurn(...args);
        setNextPlayer(next);
        setShowPass(true);
      },
    };
    return <Board {...props} events={wrappedEvents} />;
  };

  const GameClient = useRef(
    Client({ game: CyberSecurityGame, board: WrappedBoard, multiplayer: Local(), debug: false })
  ).current;

  if (showPass) {
    const team = nextPlayer === '0' ? 'UK' : 'Russia';
    return <PassDeviceScreen team={team} onReady={() => { setActivePlayer(nextPlayer); setShowPass(false); }} />;
  }

  return (
    <div>
      <TopHeader />
      <GameClient playerID={activePlayer} />
    </div>
  );
}

// AI Game
function AIGame({ difficultyKey }) {
  const GameClientRef = useRef(null);
  if (!GameClientRef.current) {
    const iterations = AI_DIFFICULTIES[difficultyKey].iterations;
    const RussiaBotClass = makeDifficultyBot(iterations);
    GameClientRef.current = Client({
      game: CyberSecurityGame,
      board: Board,
      debug: false,
      multiplayer: Local({ bots: { '1': RussiaBotClass } }),
    });
  }
  const GameClient = GameClientRef.current;
  return (
    <div>
      <TopHeader aiMode />
      <GameClient playerID="0" />
    </div>
  );
}

// Main App
export default function App() {
  const [phase, setPhase] = useState('start');
  const [aiDifficulty, setAiDifficulty] = useState('medium');
  const [prevPhase, setPrevPhase] = useState('start');

  const goTo = (next) => {
    setPrevPhase(phase);
    setPhase(next);
  };

  if (phase === 'start') {
    return (
      <StartScreen
        onSelectMode={(mode) => goTo(mode === '2player' ? '2player' : 'aiDifficulty')}
        onShowRules={() => goTo('rules')}
      />
    );
  }

  if (phase === 'rules') {
    return (
      <RulesScreen
        onBack={() => setPhase('start')}
        onPlay={() => setPhase('start')}
      />
    );
  }

  if (phase === 'aiDifficulty') {
    return (
      <AIDifficultyScreen
        onSelect={(key) => { setAiDifficulty(key); goTo('ai'); }}
        onBack={() => setPhase('start')}
      />
    );
  }

  if (phase === '2player') return <TwoPlayerGame />;
  if (phase === 'ai') return <AIGame difficultyKey={aiDifficulty} />;

  return null;
}
