import React, { useState } from 'react';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const TEAM_COLORS = { UK: '#4a9eff', Russia: '#ff4a4a' };
const REVITALISE_COSTS = { 1: 1, 2: 3, 3: 6, 4: 10 };

function DiceResult({ dieRoll, damage }) {
  if (dieRoll === null || dieRoll === undefined) return null;
  const isBackfire = damage < 0;
  const isMiss = damage === 0;
  return (
    <div style={{
      backgroundColor: isBackfire ? '#2a0000' : isMiss ? '#1a1a00' : '#002a00',
      border: `2px solid ${isBackfire ? '#ff4a4a' : isMiss ? '#ffff00' : '#4aff4a'}`,
      borderRadius: '8px', padding: '8px', textAlign: 'center',
    }}>
      <div style={{ fontSize: '20px' }}>🎲 {dieRoll}</div>
      <div style={{ color: isBackfire ? '#ff4a4a' : isMiss ? '#ffff00' : '#4aff4a', fontWeight: 'bold', fontSize: '12px' }}>
        {isBackfire ? `🔥 BACKFIRE -${Math.abs(damage)}` : isMiss ? '💨 MISS' : `💥 ${damage} DMG`}
      </div>
    </div>
  );
}

function EntityCard({ entity, onClick, highlight, dim, acted }) {
  const borderColor = highlight === 'selected' ? '#ffff00' : highlight === 'target' ? '#00ff00' : TEAM_COLORS[entity.team];
  return (
    <div onClick={() => onClick(entity.id)} style={{
      border: `3px solid ${borderColor}`,
      borderRadius: '10px',
      padding: '10px',
      margin: '5px',
      cursor: dim ? 'not-allowed' : 'pointer',
      backgroundColor: highlight === 'selected' ? '#2a2a00' : highlight === 'target' ? '#002a00' : acted ? '#1a1a1a' : '#1a1a2e',
      color: 'white',
      width: '130px',
      boxShadow: `0 0 ${highlight ? '20px' : '8px'} ${borderColor}`,
      opacity: dim ? 0.3 : acted ? 0.5 : 1,
      transition: 'all 0.2s',
      position: 'relative',
    }}>
      {acted && (
        <div style={{ position: 'absolute', top: '3px', right: '5px', color: '#888', fontSize: '10px' }}>✓ done</div>
      )}
      <div style={{ fontWeight: 'bold', fontSize: '11px', marginBottom: '4px', color: TEAM_COLORS[entity.team] }}>
        {entity.name}
      </div>
      <div style={{ fontSize: '11px', color: '#4aff4a' }}>💰 RES: {entity.resource}</div>
      <div style={{ fontSize: '11px', color: '#4affff' }}>❤️ VIT: {entity.vitality}</div>
      {entity.canBlackMarket && <div style={{ fontSize: '10px', color: '#ffaa00', marginTop: '3px' }}>★ Black Market</div>}
    </div>
  );
}

function btnStyle(color, disabled) {
  return {
    padding: '7px',
    backgroundColor: '#1a1a1a',
    color: disabled ? '#444' : color,
    border: `1px solid ${disabled ? '#444' : color}`,
    borderRadius: '5px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '11px',
    textAlign: 'left',
    transition: 'background-color 0.1s',
    width: '100%',
  };
}

export function Board({ G, ctx, moves, isActive, events }) {
  const [step, setStep] = useState('selectEntity');
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);
  const [targetEntity, setTargetEntity] = useState(null);
  const [amount, setAmount] = useState(1);
  const [showBlackMarket, setShowBlackMarket] = useState(false);
  const [selectedBMItem, setSelectedBMItem] = useState(null);
  const [bidAmount, setBidAmount] = useState(1);

  const currentTeam = ctx.currentPlayer === '0' ? 'UK' : 'Russia';
  const month = MONTHS[(G.currentTurn - 1) % 12] || 'January';
  const ukEntities = Object.values(G.entities).filter(e => e.team === 'UK');
  const ruEntities = Object.values(G.entities).filter(e => e.team === 'Russia');
  const myInventory = G.inventory?.[currentTeam] || [];
  const attackTargetId = currentTeam === 'UK' ? 'ru_gov' : 'uk_gov';

  const reset = () => {
    setStep('selectEntity');
    setSelectedEntity(null);
    setSelectedAction(null);
    setTargetEntity(null);
    setAmount(1);
    setShowBlackMarket(false);
    setSelectedBMItem(null);
    setBidAmount(1);
  };

  const handleEntityClick = (id) => {
    if (!isActive) return;
    const entity = G.entities[id];
    if (!entity) return;

    if (step === 'selectEntity') {
      if (entity.team !== currentTeam) return;
      if (G.actedThisTurn.includes(id)) return;
      setSelectedEntity(id);
      setStep('selectAction');
      return;
    }

    if (step === 'selectTarget') {
      if (selectedAction === 'distribute') {
        if (entity.team !== currentTeam) return;
        setTargetEntity(id);
        setStep('confirm');
      } else if (selectedAction === 'attack') {
        if (entity.team === currentTeam) return;
        setTargetEntity(id);
        setStep('confirm');
      }
    }
  };

  const handleActionSelect = (action) => {
    setSelectedAction(action);
    if (action === 'distribute') {
      setStep('selectTarget');
    } else if (action === 'attack') {
      if (G.currentTurn === 1) {
        alert('⚠️ No attacks allowed in January!');
        return;
      }
      setTargetEntity(attackTargetId);
      setStep('confirm');
    } else if (action === 'blackmarket') {
      setShowBlackMarket(true);
      setStep('confirm');
    } else {
      setStep('confirm');
    }
  };

  const handleExecute = () => {
    if (!selectedEntity || !selectedAction) return;

    if (selectedAction === 'distribute') {
      if (!targetEntity) { alert('Select a target!'); return; }
      moves.distribute(selectedEntity, targetEntity, amount);
    } else if (selectedAction === 'revitalise') {
      moves.revitalise(selectedEntity, amount);
    } else if (selectedAction === 'attack') {
      moves.attack(selectedEntity, amount);
    } else if (selectedAction === 'abstain') {
      moves.abstain(selectedEntity);
    } else if (selectedAction === 'blackmarket' && selectedBMItem) {
      moves.blackMarketBid(selectedEntity, selectedBMItem, bidAmount);
    }
    reset();
  };

  const handleEndTurn = () => {
    reset();
    events.endTurn();
  };

  const getHighlight = (id) => {
    if (id === selectedEntity) return 'selected';
    if (id === targetEntity) return 'target';
    return null;
  };

  const isActed = (id) => G.actedThisTurn.includes(id);

  const isDim = (id) => {
    const entity = G.entities[id];
    if (!isActive) return true;
    if (step === 'selectEntity') {
      if (entity.team !== currentTeam) return true;
      if (isActed(id)) return true;
    }
    if (step === 'selectTarget') {
      if (selectedAction === 'attack' && entity.team === currentTeam) return true;
      if (selectedAction === 'distribute' && entity.team !== currentTeam) return true;
    }
    return false;
  };

  const selectedEntityData = selectedEntity ? G.entities[selectedEntity] : null;

  // Game Over Screen
  if (G.gameOver) {
    return (
      <div style={{
        backgroundColor: '#0a0a1a', minHeight: '100vh', display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'monospace', color: 'white', padding: '20px'
      }}>
        <div style={{ fontSize: '60px', marginBottom: '20px' }}>🏆</div>
        <h1 style={{ color: '#ffff00', fontSize: '36px', margin: '0 0 10px 0' }}>GAME OVER!</h1>
        <h2 style={{ color: G.winner === 'UK' ? '#4a9eff' : '#ff4a4a', margin: '0 0 20px 0' }}>
          {G.winner === 'UK' ? '🇬🇧 UK Wins!' : G.winner === 'Russia' ? '🇷🇺 Russia Wins!' : '🤝 Draw!'}
        </h2>
        <div style={{ fontSize: '20px', marginBottom: '20px' }}>
          <span style={{ color: '#4a9eff' }}>UK: {G.vpUK} VP</span>
          {' vs '}
          <span style={{ color: '#ff4a4a' }}>Russia: {G.vpRussia} VP</span>
        </div>
        <div style={{ maxWidth: '400px', width: '100%' }}>
          <div style={{ color: '#ffff00', marginBottom: '8px', fontWeight: 'bold' }}>📋 Final Log:</div>
          {G.log.slice(-8).reverse().map((entry, i) => (
            <div key={i} style={{ color: '#aaa', fontSize: '12px', margin: '3px 0' }}>› {entry}</div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#0a0a1a', minHeight: '100vh', padding: '15px', fontFamily: 'monospace', color: 'white' }}>

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: '#111', padding: '10px 20px', borderRadius: '10px',
        marginBottom: '12px', border: '1px solid #333'
      }}>
        <div style={{ color: '#4a9eff', fontSize: '16px', fontWeight: 'bold' }}>🇬🇧 {G.vpUK} VP</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#ffff00', fontSize: '14px' }}>📅 {month} (Turn {G.currentTurn}/12)</div>
          <div style={{ color: currentTeam === 'UK' ? '#4a9eff' : '#ff4a4a', fontSize: '12px', fontWeight: 'bold' }}>
            {isActive ? `▶ YOUR TURN (${currentTeam})` : `⏳ ${currentTeam} Team's Turn`}
          </div>
        </div>
        <div style={{ color: '#ff4a4a', fontSize: '16px', fontWeight: 'bold' }}>{G.vpRussia} VP 🇷🇺</div>
      </div>

      {/* Instructions Banner */}
      {isActive && (
        <div style={{
          textAlign: 'center', backgroundColor: '#1a1a00', border: '1px solid #ffff00',
          borderRadius: '8px', padding: '6px', marginBottom: '10px', color: '#ffff00', fontSize: '11px'
        }}>
          {step === 'selectEntity' && `👆 Click one of your ${currentTeam} entities to act (or click END TURN)`}
          {step === 'selectAction' && `⚡ Choose action for: ${selectedEntityData?.name}`}
          {step === 'selectTarget' && selectedAction === 'distribute' && '📦 Click a connected entity to send resources to'}
          {step === 'selectTarget' && selectedAction === 'attack' && '⚔️ Click enemy entity to attack'}
          {step === 'confirm' && '✅ Set amount and click EXECUTE to confirm action'}
        </div>
      )}

      {/* Main Board */}
      <div style={{ display: 'flex', gap: '10px' }}>

        {/* UK Team */}
        <div style={{ flex: 1, backgroundColor: '#0d1b2a', borderRadius: '10px', padding: '12px', border: '2px solid #4a9eff' }}>
          <h3 style={{ color: '#4a9eff', textAlign: 'center', margin: '0 0 10px 0', fontSize: '13px' }}>🇬🇧 UK TEAM</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
            {ukEntities.map(entity => (
              <EntityCard key={entity.id} entity={entity} onClick={handleEntityClick}
                highlight={getHighlight(entity.id)} dim={isDim(entity.id)} acted={isActed(entity.id)} />
            ))}
          </div>
        </div>

        {/* Action Panel */}
        <div style={{
          width: '175px', backgroundColor: '#111', borderRadius: '10px',
          padding: '12px', border: '1px solid #444',
          display: 'flex', flexDirection: 'column', gap: '6px'
        }}>
          <div style={{ color: '#ffff00', textAlign: 'center', fontWeight: 'bold', fontSize: '12px' }}>⚡ ACTIONS</div>

          {/* Selected entity info */}
          {selectedEntityData && (
            <div style={{ backgroundColor: '#1a1a00', border: '1px solid #ffff00', borderRadius: '5px', padding: '5px', fontSize: '10px', color: '#ffff00', textAlign: 'center' }}>
              <div>{selectedEntityData.name}</div>
              <span style={{ color: '#4aff4a' }}>RES:{selectedEntityData.resource}</span>
              {' '}
              <span style={{ color: '#4affff' }}>VIT:{selectedEntityData.vitality}</span>
            </div>
          )}

          {/* Action buttons */}
          {step === 'selectAction' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <button onClick={() => handleActionSelect('distribute')} style={btnStyle('#4a9eff')}>📦 Distribute</button>
              <button onClick={() => handleActionSelect('revitalise')} style={btnStyle('#4aff4a')}>💚 Revitalise</button>
              <button onClick={() => handleActionSelect('attack')} disabled={G.currentTurn === 1} style={btnStyle(G.currentTurn === 1 ? '#666' : '#ff4a4a', G.currentTurn === 1)}>
                ⚔️ Attack{G.currentTurn === 1 ? ' 🔒' : ''}
              </button>
              {selectedEntityData?.canBlackMarket && (
                <button onClick={() => handleActionSelect('blackmarket')} style={btnStyle('#ffaa00')}>🛒 Black Market</button>
              )}
              <button onClick={() => handleActionSelect('abstain')} style={btnStyle('#888')}>⏸️ Abstain</button>
            </div>
          )}

          {/* Amount slider */}
          {(step === 'selectTarget' || step === 'confirm') && selectedAction && selectedAction !== 'abstain' && selectedAction !== 'blackmarket' && (
            <div>
              <div style={{ color: '#aaa', fontSize: '10px', marginBottom: '3px' }}>
                {selectedAction === 'revitalise'
                  ? `+${amount} VIT (Cost: ${REVITALISE_COSTS[amount]} RES)`
                  : `Amount: ${amount} RES`}
              </div>
              <input type="range" min="1"
                max={selectedAction === 'revitalise' ? '4' : '6'}
                value={amount}
                onChange={e => setAmount(Number(e.target.value))}
                style={{ width: '100%' }} />
            </div>
          )}

          {/* Target info */}
          {targetEntity && (
            <div style={{ backgroundColor: '#002a00', border: '1px solid #4aff4a', borderRadius: '5px', padding: '5px', fontSize: '10px', color: '#4aff4a', textAlign: 'center' }}>
              🎯 {G.entities[targetEntity]?.name}
            </div>
          )}

          {/* Black Market */}
          {showBlackMarket && (
            <div style={{ fontSize: '10px', maxHeight: '200px', overflowY: 'auto' }}>
              <div style={{ color: '#ffaa00', marginBottom: '4px', fontWeight: 'bold' }}>🛒 Select item to bid:</div>
              {G.blackMarket.map(item => (
                <div key={item.id} onClick={() => setSelectedBMItem(item.id)} style={{
                  padding: '4px', marginBottom: '3px', borderRadius: '4px', cursor: 'pointer',
                  border: `1px solid ${selectedBMItem === item.id ? '#ffaa00' : '#444'}`,
                  backgroundColor: selectedBMItem === item.id ? '#2a1a00' : '#1a1a1a', color: '#aaa'
                }}>
                  <div style={{ color: '#ffaa00' }}>{item.name}</div>
                  <div style={{ fontSize: '9px' }}>{item.description}</div>
                  <div style={{ fontSize: '9px' }}>Bid: {item.currentBid} ({item.bidder || 'none'})</div>
                </div>
              ))}
              {selectedBMItem && (
                <div>
                  <div style={{ color: '#aaa', fontSize: '10px' }}>Bid: {bidAmount}</div>
                  <input type="range"
                    min={(G.blackMarket.find(i => i.id === selectedBMItem)?.currentBid || 0) + 1}
                    max="10" value={bidAmount}
                    onChange={e => setBidAmount(Number(e.target.value))}
                    style={{ width: '100%' }} />
                </div>
              )}
            </div>
          )}

          {/* Inventory */}
          {myInventory.length > 0 && (
            <div style={{ fontSize: '10px' }}>
              <div style={{ color: '#ffaa00', marginBottom: '3px' }}>🎒 Inventory:</div>
              {myInventory.map(item => (
                <div key={item.id} onClick={() => moves.useItem(item.id)} style={{
                  padding: '3px', marginBottom: '2px', backgroundColor: '#1a1a00',
                  border: '1px solid #ffaa00', borderRadius: '3px', cursor: 'pointer', color: '#ffaa00'
                }}>
                  {item.name}
                </div>
              ))}
            </div>
          )}

          {/* Active effects */}
          {isActive && G.activeEffects?.[currentTeam]?.length > 0 && (
            <div style={{ fontSize: '10px', color: '#ffaa00', backgroundColor: '#1a1a00', padding: '4px', borderRadius: '4px' }}>
              ✨ {G.activeEffects[currentTeam].join(', ')}
            </div>
          )}

          {/* Execute button */}
          {step === 'confirm' && (
            <button onClick={handleExecute} style={{
              padding: '8px', backgroundColor: '#1a4a1a', color: '#4aff4a',
              border: '2px solid #4aff4a', borderRadius: '5px', cursor: 'pointer',
              fontWeight: 'bold', fontSize: '12px', width: '100%'
            }}>
              ✅ EXECUTE
            </button>
          )}

          {/* Cancel button */}
          {step !== 'selectEntity' && (
            <button onClick={reset} style={{
              padding: '5px', backgroundColor: '#2a1a1a', color: '#ff6666',
              border: '1px solid #ff6666', borderRadius: '5px', cursor: 'pointer',
              fontSize: '10px', width: '100%'
            }}>
              🔄 Cancel
            </button>
          )}

          {/* END TURN button */}
          {isActive && (
            <button onClick={handleEndTurn} style={{
              padding: '8px', backgroundColor: '#1a1a4a', color: '#aaaaff',
              border: '2px solid #aaaaff', borderRadius: '5px', cursor: 'pointer',
              fontWeight: 'bold', fontSize: '11px', width: '100%', marginTop: '5px'
            }}>
              ⏭️ END TURN
            </button>
          )}

          {/* Dice result */}
          <DiceResult dieRoll={G.lastDieRoll} damage={G.lastDamage} />
        </div>

        {/* Russia Team */}
        <div style={{ flex: 1, backgroundColor: '#2a0d0d', borderRadius: '10px', padding: '12px', border: '2px solid #ff4a4a' }}>
          <h3 style={{ color: '#ff4a4a', textAlign: 'center', margin: '0 0 10px 0', fontSize: '13px' }}>🇷🇺 RUSSIA TEAM</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
            {ruEntities.map(entity => (
              <EntityCard key={entity.id} entity={entity} onClick={handleEntityClick}
                highlight={getHighlight(entity.id)} dim={isDim(entity.id)} acted={isActed(entity.id)} />
            ))}
          </div>
        </div>
      </div>

      {/* Attack Vector */}
      <div style={{ textAlign: 'center', margin: '8px 0', fontSize: '11px' }}>
        <span style={{ color: '#9944ff' }}>━━ UK attacks Russia Government ━━▶</span>
        {'     '}
        <span style={{ color: '#ff8800' }}>◀━━ Russia attacks UK Government ━━</span>
      </div>

      {/* Action Log */}
      <div style={{
        backgroundColor: '#111', borderRadius: '10px', padding: '12px',
        border: '1px solid #333', maxHeight: '120px', overflowY: 'auto'
      }}>
        <div style={{ color: '#ffff00', fontWeight: 'bold', fontSize: '12px', marginBottom: '6px' }}>📋 Action Log</div>
        {G.log.length === 0 && <div style={{ color: '#555', fontSize: '11px' }}>No actions yet...</div>}
        {G.log.slice(-8).reverse().map((entry, i) => (
          <div key={i} style={{ color: i === 0 ? '#fff' : '#666', fontSize: '11px', marginBottom: '2px' }}>
            › {entry}
          </div>
        ))}
      </div>
    </div>
  );
}
