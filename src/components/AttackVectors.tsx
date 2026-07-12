interface AttackVectorsProps {
  activeAttacker?: 'UK' | 'Russia' | null;
}

interface ArrowRow {
  label: string;
  leftTeam: string;
  rightTeam: string;
  arrowColor: string;
  arrowSymbol: string;
  isActive: boolean;
}

export function AttackVectors({ activeAttacker = null }: AttackVectorsProps) {
  const arrowRows: ArrowRow[] = [
    {
      label: 'UK attacks Russia',
      leftTeam: '🇬🇧 UK Govt',
      rightTeam: 'Russia Govt 🇷🇺',
      arrowColor: '#aa44ff',
      arrowSymbol: '━━━━▶',
      isActive: activeAttacker === 'UK',
    },
    {
      label: 'Russia attacks UK',
      leftTeam: '🇬🇧 UK Govt',
      rightTeam: 'Russia Govt 🇷🇺',
      arrowColor: '#ff6600',
      arrowSymbol: '◀━━━━',
      isActive: activeAttacker === 'Russia',
    },
  ];

  return (
    <div style={{
      backgroundColor: '#0a0a1a',
      borderRadius: '12px',
      border: '1px solid #1a1a30',
      padding: '14px',
      textAlign: 'center',
    }}>
      <div style={{
        color: '#555',
        fontSize: '11px',
        letterSpacing: '3px',
        marginBottom: '10px',
      }}>
        ATTACK VECTORS
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
        {arrowRows.map((row: ArrowRow) => (
          <div key={row.label} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            opacity: row.isActive ? 1 : 0.6,
            transition: 'opacity 0.2s',
          }}>
            <span style={{ color: '#4a9eff', fontSize: '13px', fontWeight: 'bold' }}>
              {row.leftTeam}
            </span>
            <span style={{
              color: row.arrowColor,
              fontSize: '22px',
              textShadow: row.isActive ? `0 0 10px ${row.arrowColor}` : 'none',
            }}>
              {row.arrowSymbol}
            </span>
            <span style={{ color: '#ff4a4a', fontSize: '13px', fontWeight: 'bold' }}>
              {row.rightTeam}
            </span>
          </div>
        ))}
      </div>

      <div style={{ color: '#333', fontSize: '9px', marginTop: '8px' }}>
        Purple = UK attacks · Orange = Russia attacks
      </div>
    </div>
  );
}
