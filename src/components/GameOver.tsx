type Winner = 'UK' | 'Russia' | 'Draw';

interface GameOverProps {
  winner: Winner;
  vpUK: number;
  vpRussia: number;
  log: string[];
}

interface TeamDisplayData {
  flag: string;
  name: string;
  vp: number;
  color: string;
}

export function GameOver({ winner, vpUK, vpRussia, log }: GameOverProps) {
  const winnerColor: string =
    winner === 'UK'     ? '#4a9eff' :
    winner === 'Russia' ? '#ff4a4a' :
    '#aaaaaa'; // Draw

  const winnerText: string =
    winner === 'UK'     ? '🇬🇧 UK WINS!'      :
    winner === 'Russia' ? '🇷🇺 RUSSIA WINS!' :
    '🤝 DRAW!';

  const teams: TeamDisplayData[] = [
    { flag: '🇬🇧', name: 'UK',     vp: vpUK,     color: '#4a9eff' },
    { flag: '🇷🇺', name: 'Russia', vp: vpRussia, color: '#ff4a4a' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'monospace',
      background: 'radial-gradient(ellipse at center, #1a0a2e 0%, #050510 100%)',
      color: 'white',
      padding: '20px',
    }}>
      <div style={{ fontSize: '80px' }}>🏆</div>

      <h1 style={{
        color: '#ffff00',
        fontSize: '44px',
        margin: '10px 0',
        textShadow: '0 0 30px #ffff00',
      }}>
        GAME OVER!
      </h1>

      <h2 style={{
        color: winnerColor,
        fontSize: '28px',
        margin: '0 0 24px',
        textShadow: `0 0 20px ${winnerColor}`,
      }}>
        {winnerText}
      </h2>

      {/* Team VP display */}
      <div style={{ display: 'flex', gap: '50px', marginBottom: '28px' }}>
        {teams.map((team: TeamDisplayData) => (
          <div key={team.name} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '36px' }}>{team.flag}</div>
            <div style={{
              color: team.color,
              fontSize: '52px',
              fontWeight: 'bold',
              textShadow: `0 0 20px ${team.color}`,
            }}>
              {team.vp}
            </div>
            <div style={{ color: '#777', fontSize: '13px' }}>
              Victory Points
            </div>
          </div>
        ))}
      </div>

      {/* Final log */}
      <div style={{
        maxWidth: '460px',
        backgroundColor: '#111',
        borderRadius: '10px',
        padding: '15px',
        border: '1px solid #333',
        width: '100%',
      }}>
        <div style={{ color: '#ffff00', fontWeight: 'bold', marginBottom: '8px' }}>
          📋 Final Log
        </div>
        {log.slice(-8).reverse().map((entry: string, i: number) => (
          <div key={i} style={{
            color: i === 0 ? '#ccc' : '#555',
            fontSize: '11px',
            margin: '2px 0',
          }}>
            › {entry}
          </div>
        ))}
      </div>
    </div>
  );
}
