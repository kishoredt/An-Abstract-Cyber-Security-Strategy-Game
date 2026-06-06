export function GameOver({ winner, vpUK, vpRussia, log }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace',
      background: 'radial-gradient(ellipse at center, #1a0a2e 0%, #050510 100%)',
      color: 'white', padding: '20px',
    }}>
      <div style={{ fontSize: '80px' }}>🏆</div>
      <h1 style={{ color: '#ffff00', fontSize: '44px', margin: '10px 0', textShadow: '0 0 30px #ffff00' }}>
        GAME OVER!
      </h1>
      <h2 style={{
        color: winner === 'UK' ? '#4a9eff' : winner === 'Russia' ? '#ff4a4a' : '#aaaaaa',
        fontSize: '28px', margin: '0 0 24px',
      }}>
        {winner === 'UK' ? '🇬🇧 UK WINS!' : winner === 'Russia' ? '🇷🇺 RUSSIA WINS!' : '🤝 DRAW!'}
      </h2>

      <div style={{ display: 'flex', gap: '50px', marginBottom: '28px' }}>
        {[
          ['🇬🇧', 'UK', vpUK, '#4a9eff'],
          ['🇷🇺', 'Russia', vpRussia, '#ff4a4a'],
        ].map(([flag, name, vp, color]) => (
          <div key={name} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '36px' }}>{flag}</div>
            <div style={{ color, fontSize: '52px', fontWeight: 'bold', textShadow: `0 0 20px ${color}` }}>
              {vp}
            </div>
            <div style={{ color: '#777', fontSize: '13px' }}>Victory Points</div>
          </div>
        ))}
      </div>

      <div style={{
        maxWidth: '460px', backgroundColor: '#111', borderRadius: '10px',
        padding: '15px', border: '1px solid #333', width: '100%',
      }}>
        <div style={{ color: '#ffff00', fontWeight: 'bold', marginBottom: '8px' }}>📋 Final Log</div>
        {log.slice(-8).reverse().map((entry, i) => (
          <div key={i} style={{ color: i === 0 ? '#ccc' : '#555', fontSize: '11px', margin: '2px 0' }}>
            › {entry}
          </div>
        ))}
      </div>
    </div>
  );
}
