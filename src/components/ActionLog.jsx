export function ActionLog({ log }) {
  return (
    <div style={{
      backgroundColor: '#080810', borderRadius: '12px',
      border: '1px solid #1a1a28', padding: '12px',
      maxHeight: '200px', overflowY: 'auto',
    }}>
      <div style={{ color: '#ffff00', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>
        📋 Action Log
      </div>
      {log.length === 0 && (
        <div style={{ color: '#333', fontSize: '11px' }}>No actions yet...</div>
      )}
      {log.slice(-12).reverse().map((entry, i) => (
        <div key={i} style={{
          color: i === 0 ? '#ddd' : '#555',
          fontSize: '11px', marginBottom: '3px',
          paddingBottom: '3px',
          borderBottom: i === 0 ? '1px solid #222' : 'none',
        }}>
          › {entry}
        </div>
      ))}
    </div>
  );
}
