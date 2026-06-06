import { playSound } from '../utils/sounds';

function BMCard({ item, isRevealed, isSelected, onReveal, onSelect }) {
  if (!isRevealed) {
    return (
      <div
        onClick={onReveal}
        style={{
          width: '85px', height: '120px', borderRadius: '8px',
          background: 'linear-gradient(135deg, #150a30, #251545)',
          border: '2px solid #6633cc',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 0 14px rgba(102,51,204,0.6)',
        }}
      >
        <div style={{ fontSize: '28px' }}>🃏</div>
        <div style={{ color: '#9966ff', fontSize: '9px', marginTop: '5px', textAlign: 'center', lineHeight: 1.4 }}>
          BLACK<br />MARKET
        </div>
        <div style={{ color: '#ffff00', fontSize: '9px', marginTop: '4px' }}>DRAW</div>
      </div>
    );
  }

  return (
    <div
      onClick={onSelect}
      style={{
        width: '85px', height: '120px', borderRadius: '8px',
        background: isSelected
          ? 'linear-gradient(135deg, #2a2a00, #3a3a00)'
          : 'linear-gradient(135deg, #0a1a0a, #152015)',
        border: `2px solid ${isSelected ? '#ffff00' : '#33cc66'}`,
        display: 'flex', flexDirection: 'column', padding: '7px',
        cursor: 'pointer',
        boxShadow: isSelected
          ? '0 0 16px rgba(255,255,0,0.5)'
          : '0 0 7px rgba(51,204,102,0.3)',
      }}
    >
      <div style={{ fontSize: '18px', textAlign: 'center' }}>{item.icon}</div>
      <div style={{ color: '#33cc66', fontSize: '8px', fontWeight: 'bold', textAlign: 'center', marginTop: '3px', lineHeight: 1.2 }}>
        {item.name}
      </div>
      <div style={{ color: '#999', fontSize: '7px', flex: 1, lineHeight: 1.3, marginTop: '3px' }}>
        {item.description}
      </div>
      <div style={{ color: '#ffaa00', fontSize: '8px', textAlign: 'center', marginTop: '3px' }}>
        min: {item.minBid}💰
      </div>
      {item.currentBid > 0 && (
        <div style={{ color: '#ff6666', fontSize: '7px', textAlign: 'center' }}>bid: {item.currentBid}</div>
      )}
    </div>
  );
}

export function BlackMarket({ blackMarket, revealedCards, selectedItem, bidAmount,
  onReveal, onSelect, onBidChange }) {
  return (
    <div>
      <div style={{ color: '#aa77ff', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>
        🃏 Click a face-down card to draw it
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', marginBottom: '8px' }}>
        {blackMarket.map(item => (
          <BMCard
            key={item.id}
            item={item}
            isRevealed={revealedCards.includes(item.id)}
            isSelected={selectedItem === item.id}
            onReveal={() => { onReveal(item.id); playSound('card'); }}
            onSelect={() => onSelect(item.id)}
          />
        ))}
      </div>
      {selectedItem && (
        <div style={{ backgroundColor: '#111', borderRadius: '6px', padding: '8px' }}>
          <div style={{ color: '#aaa', fontSize: '11px', marginBottom: '4px' }}>
            Bid amount: {bidAmount} 💰
          </div>
          <input
            type="range"
            min={blackMarket.find(i => i.id === selectedItem)?.minBid || 1}
            max="10"
            value={bidAmount}
            onChange={e => onBidChange(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#aa77ff' }}
          />
        </div>
      )}
    </div>
  );
}
