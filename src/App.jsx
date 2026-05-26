import { useState } from 'react';
import { Client } from 'boardgame.io/react';
import { Local } from 'boardgame.io/multiplayer';
import { CyberSecurityGame } from './Game';
import { Board } from './Board';

const CyberClient = Client({
  game: CyberSecurityGame,
  board: Board,
  multiplayer: Local(),
  debug: false,
});

function StartScreen({ onStart }) {
  const [hovering, setHovering] = useState(false);

  return (
    <div style={{
      backgroundColor: '#0a0a1a',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'monospace',
      color: 'white',
      backgroundImage: 'radial-gradient(ellipse at center, #1a0a2e 0%, #0a0a1a 70%)',
      overflow: 'hidden',
      position: 'relative',
    }}>

      {/* Animated background lines */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'linear-gradient(rgba(74,158,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(74,158,255,0.03) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
        pointerEvents: 'none',
      }} />

      {/* UK side glow */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: '40%',
        background: 'linear-gradient(to right, rgba(74,158,255,0.08), transparent)',
        pointerEvents: 'none',
      }} />

      {/* Russia side glow */}
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 0, width: '40%',
        background: 'linear-gradient(to left, rgba(255,74,74,0.08), transparent)',
        pointerEvents: 'none',
      }} />

      {/* Flags */}
      <div style={{ display: 'flex', gap: '40px', marginBottom: '20px', fontSize: '50px' }}>
        <span style={{ filter: 'drop-shadow(0 0 15px #4a9eff)' }}>🇬🇧</span>
        <span style={{ color: '#ffff00', fontSize: '30px', alignSelf: 'center' }}>VS</span>
        <span style={{ filter: 'drop-shadow(0 0 15px #ff4a4a)' }}>🇷🇺</span>
      </div>

      {/* Title */}
      <div style={{
        fontSize: '13px',
        color: '#4affff',
        letterSpacing: '6px',
        textTransform: 'uppercase',
        marginBottom: '8px',
      }}>
        ⚡ CLASSIFIED ⚡
      </div>

      <h1 style={{
        fontSize: '36px',
        fontWeight: 'bold',
        textAlign: 'center',
        margin: '0 0 8px 0',
        color: '#fff',
        textShadow: '0 0 30px rgba(74,158,255,0.8)',
        lineHeight: 1.2,
      }}>
        CYBER SECURITY
      </h1>
      <h1 style={{
        fontSize: '36px',
        fontWeight: 'bold',
        textAlign: 'center',
        margin: '0 0 20px 0',
        color: '#ffff00',
        textShadow: '0 0 30px rgba(255,255,0,0.8)',
      }}>
        STRATEGY GAME
      </h1>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px', width: '400px' }}>
        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, #4a9eff)' }} />
        <div style={{ color: '#4a9eff', fontSize: '16px' }}>🔐</div>
        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, #ff4a4a)' }} />
      </div>

      {/* Description */}
      <div style={{
        maxWidth: '420px',
        textAlign: 'center',
        color: '#888',
        fontSize: '12px',
        lineHeight: 1.7,
        marginBottom: '30px',
        padding: '0 20px',
      }}>
        A two-player strategy game based on the UK Cyber Security Strategy.
        Manage resources, protect your entities, and outsmart your opponent
        across 12 turns — January through December 2020.
      </div>

      {/* Game info boxes */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '35px' }}>
        {[
          { icon: '👥', label: '2 Players', sub: 'Hot-seat' },
          { icon: '🗓️', label: '12 Turns', sub: 'Jan–Dec' },
          { icon: '⏱️', label: '3 Min', sub: 'Per turn' },
          { icon: '🎲', label: 'Dice', sub: 'Combat' },
        ].map(item => (
          <div key={item.label} style={{
            backgroundColor: '#111',
            border: '1px solid #333',
            borderRadius: '8px',
            padding: '10px 14px',
            textAlign: 'center',
            minWidth: '70px',
          }}>
            <div style={{ fontSize: '20px' }}>{item.icon}</div>
            <div style={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}>{item.label}</div>
            <div style={{ color: '#666', fontSize: '10px' }}>{item.sub}</div>
          </div>
        ))}
      </div>

      {/* Start Button */}
      <button
        onClick={onStart}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        style={{
          padding: '16px 50px',
          fontSize: '18px',
          fontFamily: 'monospace',
          fontWeight: 'bold',
          backgroundColor: hovering ? '#ffff00' : 'transparent',
          color: hovering ? '#000' : '#ffff00',
          border: '3px solid #ffff00',
          borderRadius: '8px',
          cursor: 'pointer',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          transition: 'all 0.2s',
          boxShadow: hovering ? '0 0 30px rgba(255,255,0,0.6)' : '0 0 10px rgba(255,255,0,0.2)',
        }}
      >
        ▶ START GAME
      </button>

      {/* Footer */}
      <div style={{ position: 'absolute', bottom: '20px', color: '#333', fontSize: '10px' }}>
        Based on © Andreas Haggman — Cyber Security Strategy Game
      </div>
    </div>
  );
}

function GameScreen() {
  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        backgroundColor: '#070710',
        padding: '6px 15px',
        borderBottom: '1px solid #222',
      }}>
        <span style={{ color: '#4a9eff', fontFamily: 'monospace', fontSize: '12px', fontWeight: 'bold' }}>
          🇬🇧 Player 1 — UK
        </span>
        <span style={{ color: '#ffff00', fontFamily: 'monospace', fontSize: '12px' }}>
          🔐 Cyber Security Strategy Game
        </span>
        <span style={{ color: '#ff4a4a', fontFamily: 'monospace', fontSize: '12px', fontWeight: 'bold' }}>
          Russia — Player 2 🇷🇺
        </span>
      </div>
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1, borderRight: '2px solid #1a1a2e' }}>
          <CyberClient playerID="0" />
        </div>
        <div style={{ flex: 1 }}>
          <CyberClient playerID="1" />
        </div>
      </div>
    </div>
  );
}

function App() {
  const [gameStarted, setGameStarted] = useState(false);

  if (!gameStarted) {
    return <StartScreen onStart={() => setGameStarted(true)} />;
  }

  return <GameScreen />;
}

export default App;
