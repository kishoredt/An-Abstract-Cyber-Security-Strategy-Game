import { TEAM_COLORS } from '../constants/gameData';

export function EntityCard({ entity, onClick, highlight, dim, acted }) {
  const tc = TEAM_COLORS[entity.team];
  const borderColor =
    highlight === 'selected' ? '#ffff00' :
    highlight === 'target'   ? '#00ff00' : tc;
  const bgColor =
    highlight === 'selected' ? '#2a2a00' :
    highlight === 'target'   ? '#002200' :
    entity.team === 'UK'     ? '#080f1a' : '#180808';
  const isGov = entity.id === 'uk_gov' || entity.id === 'ru_gov';

  return (
    <div
      onClick={() => !dim && onClick(entity.id)}
      style={{
        border: `2px solid ${borderColor}`,
        borderRadius: '10px',
        padding: isGov ? '12px 10px' : '10px 8px',
        backgroundColor: bgColor,
        boxShadow: `0 0 ${highlight ? '18px' : '6px'} ${borderColor}`,
        opacity: dim ? 0.2 : acted ? 0.5 : 1,
        cursor: dim ? 'default' : 'pointer',
        transition: 'all 0.15s',
        position: 'relative',
        textAlign: 'center',
      }}
    >
      {acted && (
        <div style={{ position: 'absolute', top: '3px', right: '5px', color: '#666', fontSize: '10px' }}>✓</div>
      )}
      <div style={{ color: tc, fontWeight: 'bold', fontSize: isGov ? '13px' : '11px', marginBottom: '5px', lineHeight: 1.2 }}>
        {entity.name}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', fontSize: '12px' }}>
        <span style={{ color: '#ffaa44' }}>💰 {entity.resource}</span>
        <span style={{ color: '#ff5555' }}>❤️ {entity.vitality}</span>
      </div>
      {entity.canBlackMarket && (
        <div style={{ color: '#aa77ff', fontSize: '9px', marginTop: '3px' }}>★ Black Market</div>
      )}
    </div>
  );
}
