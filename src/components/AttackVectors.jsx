export function AttackVectors() {
  return (
    <div style={{
      backgroundColor: '#0a0a1a', borderRadius: '12px',
      border: '1px solid #1a1a30', padding: '14px', textAlign: 'center',
    }}>
      <div style={{ color: '#555', fontSize: '11px', letterSpacing: '3px', marginBottom: '10px' }}>
        ATTACK VECTORS
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: '#4a9eff', fontSize: '13px', fontWeight: 'bold' }}>🇬🇧 UK Govt</span>
          <span style={{ color: '#aa44ff', fontSize: '22px' }}>━━━━▶</span>
          <span style={{ color: '#ff4a4a', fontSize: '13px', fontWeight: 'bold' }}>Russia Govt 🇷🇺</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: '#4a9eff', fontSize: '13px', fontWeight: 'bold' }}>🇬🇧 UK Govt</span>
          <span style={{ color: '#ff6600', fontSize: '22px' }}>◀━━━━</span>
          <span style={{ color: '#ff4a4a', fontSize: '13px', fontWeight: 'bold' }}>Russia Govt 🇷🇺</span>
        </div>
      </div>
      <div style={{ color: '#333', fontSize: '9px', marginTop: '8px' }}>
        Purple = UK attacks · Orange = Russia attacks
      </div>
    </div>
  );
}
