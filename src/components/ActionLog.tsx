interface ActionLogProps {
  log: string[];
  maxEntries?: number;
}

export function ActionLog({ log, maxEntries = 12 }: ActionLogProps) {
  const visibleEntries: string[] = log.slice(-maxEntries).reverse();

  return (
    <div style={{
      backgroundColor: '#080810',
      borderRadius: '12px',
      border: '1px solid #1a1a28',
      padding: '12px',
      maxHeight: '200px',
      overflowY: 'auto',
    }}>
      <div style={{
        color: '#ffff00',
        fontSize: '12px',
        fontWeight: 'bold',
        marginBottom: '8px',
      }}>
        📋 Action Log
      </div>

      {visibleEntries.length === 0 && (
        <div style={{ color: '#333', fontSize: '11px' }}>
          No actions yet...
        </div>
      )}

      {visibleEntries.map((entry: string, i: number) => (
        <div key={i} style={{
          color: i === 0 ? '#ddd' : '#555',
          fontSize: '11px',
          marginBottom: '3px',
          paddingBottom: '3px',
          borderBottom: i === 0 ? '1px solid #222' : 'none',
        }}>
          › {entry}
        </div>
      ))}
    </div>
  );
}
