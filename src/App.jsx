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

function App() {
  return (
    <div>
      <h2 style={{
        textAlign: 'center',
        color: '#ffff00',
        backgroundColor: '#0a0a1a',
        margin: 0,
        padding: '10px',
        fontFamily: 'monospace'
      }}>
        🔐 Cyber Security Strategy Game
      </h2>
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ textAlign: 'center', color: '#4a9eff', fontFamily: 'monospace' }}>
            Player 1 (UK)
          </h3>
          <CyberClient playerID="0" />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ textAlign: 'center', color: '#ff4a4a', fontFamily: 'monospace' }}>
            Player 2 (Russia)
          </h3>
          <CyberClient playerID="1" />
        </div>
      </div>
    </div>
  );
}

export default App;