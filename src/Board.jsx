import React, { useState, useEffect, useRef } from 'react';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const TEAM_COLORS = { UK: '#4a9eff', Russia: '#ff4a4a' };
const REVITALISE_COSTS = { 1: 1, 2: 3, 3: 6, 4: 10 };
const TURN_TIME = 180; // 3 minutes

// ── Sound helpers ──────────────────────────────────────────
function playSound(type) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.connect(g); g.connect(ctx.destination);

  if (type === 'dice') {
    o.type = 'square';
    o.frequency.setValueAtTime(220, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
    o.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
    g.gain.setValueAtTime(0.3, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    o.start(); o.stop(ctx.currentTime + 0.4);
  } else if (type === 'gameover') {
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(440, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 1.5);
    g.gain.setValueAtTime(0.4, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
    o.start(); o.stop(ctx.currentTime + 1.5);
  } else if (type === 'action') {
    o.type = 'sine';
    o.frequency.setValueAtTime(523, ctx.currentTime);
    g.gain.setValueAtTime(0.2, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    o.start(); o.stop(ctx.currentTime + 0.15);
  } else if (type === 'endturn') {
    o.type = 'sine';
    o.frequency.setValueAtTime(330, ctx.currentTime);
    o.frequency.setValueAtTime(440, ctx.currentTime + 0.1);
    g.gain.setValueAtTime(0.2, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    o.start(); o.stop(ctx.currentTime + 0.25);
  }
}

// ── Dice component ─────────────────────────────────────────
function Dice({ onRoll, disabled, result }) {
  const [rolling, setRolling] = useState(false);
  const [display, setDisplay] = useState('?');
  const faces = ['⚀','⚁','⚂','⚃','⚄','⚅'];

  const handleClick = () => {
    if (disabled || rolling) return;
    setRolling(true);
    playSound('dice');
    let count = 0;
    const interval = setInterval(() => {
      setDisplay(faces[Math.floor(Math.random() * 6)]);
      count++;
      if (count >= 12) {
        clearInterval(interval);
        setRolling(false);
        onRoll();
      }
    }, 80);
  };

  return (
    <div style={{ textAlign: 'center', margin: '8px 0' }}>
      <div
        onClick={handleClick}
        style={{
          fontSize: '52px',
          cursor: disabled ? 'not-allowed' : rolling ? 'wait' : 'pointer',
          userSelect: 'none',
          display: 'inline-block',
          animation: rolling ? 'spin 0.08s linear infinite' : 'none',
          filter: disabled ? 'grayscale(1) opacity(0.4)' : 'drop-shadow(0 0 8px #ff4a4a)',
          transition: 'transform 0.1s',
          transform: rolling ? 'rotate(15deg)' : 'rotate(0deg)',
        }}
        title={disabled ? 'Prepare an attack first' : 'Click to roll!'}
      >
        {result !== null && !rolling ? faces[(result - 1)] : display}
      </div>
      <div style={{ color: '#aaa', fontSize: '10px' }}>
        {disabled ? 'Prepare attack first' : rolling ? 'Rolling...' : result !== null ? `Rolled: ${result}` : 'Click to roll!'}
      </div>
    </div>
  );
}

// ── Timer component ────────────────────────────────────────
function Timer({ isActive, onExpire, resetKey }) {
  const [timeLeft, setTimeLeft] = useState(TURN_TIME);
  const intervalRef = useRef(null);

  useEffect(() => {
    setTimeLeft(TURN_TIME);
  }, [resetKey]);

  useEffect(() => {
    if (!isActive) { clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(intervalRef.current); onExpire(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [isActive, resetKey]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const pct = (timeLeft / TURN_TIME) * 100;
  const color = timeLeft > 60 ? '#4aff4a' : timeLeft > 30 ? '#ffff00' : '#ff4a4a';

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ color, fontSize: '20px', fontWeight: 'bold', fontFamily: 'monospace' }}>
        ⏱ {mins}:{secs.toString().padStart(2,'0')}
      </div>
      <div style={{ width: '120px', height: '6px', backgroundColor: '#333', borderRadius: '3px', margin: '2px auto' }}>
        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: color, borderRadius: '3px', transition: 'width 1s linear' }} />
      </div>
    </div>
  );
}

// ── EntityCard ─────────────────────────────────────────────
function EntityCard({ entity, onClick, highlight, dim, acted }) {
  const borderColor = highlight === 'selected' ? '#ffff00' : highlight === 'target' ? '#00ff00' : TEAM_COLORS[entity.team];
  return (
    <div onClick={() => { if (!dim) onClick(entity.id); }} style={{
      border: `3px solid ${borderColor}`,
      borderRadius: '10px', padding: '10px', margin: '5px',
      cursor: dim ? 'not-allowed' : 'pointer',
      backgroundColor: highlight === 'selected' ? '#2a2a00' : highlight === 'target' ? '#002a00' : '#1a1a2e',
      color: 'white', width: '130px',
      boxShadow: `0 0 ${highlight ? '18px' : '6px'} ${borderColor}`,
      opacity: dim ? 0.3 : acted ? 0.6 : 1,
      transition: 'all 0.15s', position: 'relative',
    }}>
      {acted && <div style={{ position:'absolute', top:'3px', right:'5px', color:'#888', fontSize:'9px' }}>✓ done</div>}
      <div style={{ fontWeight:'bold', fontSize:'11px', marginBottom:'4px', color: TEAM_COLORS[entity.team] }}>{entity.name}</div>
      <div style={{ fontSize:'11px', color:'#4aff4a' }}>💰 {entity.resource}</div>
      <div style={{ fontSize:'11px', color:'#4affff' }}>❤️ {entity.vitality}</div>
      {entity.canBlackMarket && <div style={{ fontSize:'9px', color:'#ffaa00', marginTop:'2px' }}>★ BM</div>}
    </div>
  );
}

function btnStyle(color, disabled) {
  return {
    padding: '7px', backgroundColor: '#1a1a1a',
    color: disabled ? '#555' : color,
    border: `1px solid ${disabled ? '#555' : color}`,
    borderRadius: '5px', cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '11px', width: '100%', textAlign: 'left',
  };
}

// ── Main Board ─────────────────────────────────────────────
export function Board({ G, ctx, moves, isActive, events }) {
  const [step, setStep] = useState('selectEntity');
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);
  const [targetEntity, setTargetEntity] = useState(null);
  const [amount, setAmount] = useState(1);
  const [showBlackMarket, setShowBlackMarket] = useState(false);
  const [selectedBMItem, setSelectedBMItem] = useState(null);
  const [bidAmount, setBidAmount] = useState(1);
  const [timerKey, setTimerKey] = useState(0);
  const gameOverSoundPlayed = useRef(false);

  const currentTeam = ctx.currentPlayer === '0' ? 'UK' : 'Russia';
  const month = MONTHS[(G.currentTurn - 1) % 12] || 'January';
  const ukEntities = Object.values(G.entities).filter(e => e.team === 'UK');
  const ruEntities = Object.values(G.entities).filter(e => e.team === 'Russia');
  const myInventory = G.inventory?.[currentTeam] || [];
  const attackTargetId = currentTeam === 'UK' ? 'ru_gov' : 'uk_gov';
  const hasPendingAttack = !!G.pendingAttack;

  // Play game over sound once
  useEffect(() => {
    if (G.gameOver && !gameOverSoundPlayed.current) {
      gameOverSoundPlayed.current = true;
      setTimeout(() => playSound('gameover'), 300);
    }
  }, [G.gameOver]);

  // Reset timer on turn change
  useEffect(() => {
    setTimerKey(k => k + 1);
  }, [ctx.currentPlayer, G.currentTurn]);

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
      setSelectedEntity(id);
      setStep('selectAction');
      playSound('action');
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
    playSound('action');
    if (action === 'distribute') {
      setStep('selectTarget');
    } else if (action === 'attack') {
      if (G.currentTurn === 1) { alert('⚠️ No attacks in January!'); return; }
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
      // After distribute, allow selecting another entity
      reset();
    } else if (selectedAction === 'revitalise') {
      moves.revitalise(selectedEntity, amount);
      reset();
    } else if (selectedAction === 'attack') {
      // Prepare attack — waits for dice roll
      moves.prepareAttack(selectedEntity, amount);
      setStep('rollDice');
    } else if (selectedAction === 'abstain') {
      moves.abstain(selectedEntity);
      reset();
    } else if (selectedAction === 'blackmarket' && selectedBMItem) {
      moves.blackMarketBid(selectedEntity, selectedBMItem, bidAmount);
      reset();
    }
  };

  const handleDiceRoll = () => {
    moves.rollDiceAndAttack();
    setTimeout(() => reset(), 1500);
  };

  const handleEndTurn = () => {
    playSound('endturn');
    reset();
    setTimerKey(k => k + 1);
    events.endTurn();
  };

  const handleTimerExpire = () => {
    if (isActive) { reset(); events.endTurn(); }
  };

  const getHighlight = (id) => {
    if (id === selectedEntity) return 'selected';
    if (id === targetEntity) return 'target';
    return null;
  };

  const isActed = (id) => {
    // Distribute doesn't mark acted, others do
    return G.actedThisTurn.includes(id);
  };

  const isDim = (id) => {
    const entity = G.entities[id];
    if (!isActive) return true;
    if (step === 'rollDice') return true;
    if (step === 'selectEntity') {
      if (entity.team !== currentTeam) return true;
    }
    if (step === 'selectTarget') {
      if (selectedAction === 'attack' && entity.team === currentTeam) return true;
      if (selectedAction === 'distribute' && entity.team !== currentTeam) return true;
    }
    return false;
  };

  const selectedEntityData = selectedEntity ? G.entities[selectedEntity] : null;

  // ── Game Over Screen ────────────────────────────────────
  if (G.gameOver) {
    return (
      <div style={{
        backgroundColor: '#0a0a1a', minHeight: '100vh', display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'monospace', color: 'white', padding: '20px',
        backgroundImage: 'radial-gradient(ellipse at center, #1a0a2e 0%, #0a0a1a 70%)',
      }}>
        <div style={{ fontSize: '70px', marginBottom: '15px', animation: 'pulse 1s infinite' }}>🏆</div>
        <h1 style={{ color: '#ffff00', fontSize: '40px', margin: '0 0 10px 0', textShadow: '0 0 20px #ffff00' }}>
          GAME OVER!
        </h1>
        <h2 style={{ color: G.winner === 'UK' ? '#4a9eff' : G.winner === 'Russia' ? '#ff4a4a' : '#aaa', margin: '0 0 20px 0', fontSize: '28px' }}>
          {G.winner === 'UK' ? '🇬🇧 UK WINS!' : G.winner === 'Russia' ? '🇷🇺 RUSSIA WINS!' : '🤝 DRAW!'}
        </h2>
        <div style={{ fontSize: '22px', marginBottom: '25px', display: 'flex', gap: '30px' }}>
          <div style={{ color: '#4a9eff', textAlign: 'center' }}>
            <div style={{ fontSize: '14px' }}>UK</div>
            <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{G.vpUK}</div>
            <div style={{ fontSize: '12px' }}>Victory Points</div>
          </div>
          <div style={{ color: '#aaa', fontSize: '30px', alignSelf: 'center' }}>vs</div>
          <div style={{ color: '#ff4a4a', textAlign: 'center' }}>
            <div style={{ fontSize: '14px' }}>Russia</div>
            <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{G.vpRussia}</div>
            <div style={{ fontSize: '12px' }}>Victory Points</div>
          </div>
        </div>
        <div style={{ maxWidth: '450px', width: '100%', backgroundColor: '#111', borderRadius: '10px', padding: '15px', border: '1px solid #333' }}>
          <div style={{ color: '#ffff00', marginBottom: '8px', fontWeight: 'bold' }}>📋 Final Events:</div>
          {G.log.slice(-8).reverse().map((entry, i) => (
            <div key={i} style={{ color: i === 0 ? '#fff' : '#666', fontSize: '12px', margin: '3px 0' }}>› {entry}</div>
          ))}
        </div>
      </div>
    );
  }

  // ── Main Game UI ────────────────────────────────────────
  return (
    <div style={{ backgroundColor: '#0a0a1a', minHeight: '100vh', padding: '12px', fontFamily: 'monospace', color: 'white' }}>

      {/* Top Bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: '#111', padding: '8px 16px', borderRadius: '10px',
        marginBottom: '10px', border: '1px solid #333', flexWrap: 'wrap', gap: '8px'
      }}>
        <div style={{ color: '#4a9eff', fontSize: '16px', fontWeight: 'bold' }}>🇬🇧 {G.vpUK} VP</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#ffff00', fontSize: '13px' }}>📅 {month} — Turn {G.currentTurn}/12</div>
          <Timer isActive={isActive} onExpire={handleTimerExpire} resetKey={timerKey} />
          <div style={{ color: currentTeam === 'UK' ? '#4a9eff' : '#ff4a4a', fontSize: '12px', fontWeight: 'bold', marginTop: '2px' }}>
            {isActive ? `▶ YOUR TURN (${currentTeam})` : `⏳ Waiting for ${currentTeam}...`}
          </div>
        </div>
        <div style={{ color: '#ff4a4a', fontSize: '16px', fontWeight: 'bold' }}>{G.vpRussia} VP 🇷🇺</div>
      </div>

      {/* Instructions */}
      {isActive && step !== 'rollDice' && (
        <div style={{ textAlign: 'center', backgroundColor: '#1a1a00', border: '1px solid #ffff00', borderRadius: '6px', padding: '5px', marginBottom: '8px', color: '#ffff00', fontSize: '11px' }}>
          {step === 'selectEntity' && `👆 Select a ${currentTeam} entity — or END TURN`}
          {step === 'selectAction' && `⚡ Choose action for: ${selectedEntityData?.name}`}
          {step === 'selectTarget' && selectedAction === 'distribute' && '📦 Click connected entity to send resources'}
          {step === 'selectTarget' && selectedAction === 'attack' && '⚔️ Target auto-set — adjust resource & execute'}
          {step === 'confirm' && '✅ Adjust settings and click EXECUTE'}
        </div>
      )}

      {/* Board */}
      <div style={{ display: 'flex', gap: '10px' }}>

        {/* UK Team */}
        <div style={{ flex: 1, backgroundColor: '#0d1b2a', borderRadius: '10px', padding: '10px', border: '2px solid #4a9eff' }}>
          <h3 style={{ color: '#4a9eff', textAlign: 'center', margin: '0 0 8px 0', fontSize: '13px' }}>🇬🇧 UK TEAM</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
            {ukEntities.map(e => (
              <EntityCard key={e.id} entity={e} onClick={handleEntityClick}
                highlight={getHighlight(e.id)} dim={isDim(e.id)} acted={isActed(e.id)} />
            ))}
          </div>
        </div>

        {/* Action Panel */}
        <div style={{ width: '170px', backgroundColor: '#111', borderRadius: '10px', padding: '10px', border: '1px solid #444', display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <div style={{ color: '#ffff00', textAlign: 'center', fontWeight: 'bold', fontSize: '12px' }}>⚡ ACTIONS</div>

          {selectedEntityData && (
            <div style={{ backgroundColor: '#1a1a00', border: '1px solid #ffff00', borderRadius: '4px', padding: '4px', fontSize: '10px', color: '#ffff00', textAlign: 'center' }}>
              {selectedEntityData.name}<br />
              <span style={{ color: '#4aff4a' }}>RES:{selectedEntityData.resource}</span>{' '}
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
          {(step === 'selectTarget' || step === 'confirm') && selectedAction && !['abstain','blackmarket'].includes(selectedAction) && (
            <div>
              <div style={{ color: '#aaa', fontSize: '10px', marginBottom: '2px' }}>
                {selectedAction === 'revitalise'
                  ? `+${amount} VIT (Cost: ${REVITALISE_COSTS[amount]} RES)`
                  : `Amount: ${amount} RES`}
              </div>
              <input type="range" min="1" max={selectedAction === 'revitalise' ? '4' : '6'}
                value={amount} onChange={e => setAmount(Number(e.target.value))}
                style={{ width: '100%' }} />
            </div>
          )}

          {/* Target */}
          {targetEntity && step !== 'rollDice' && (
            <div style={{ backgroundColor: '#002a00', border: '1px solid #4aff4a', borderRadius: '4px', padding: '4px', fontSize: '10px', color: '#4aff4a', textAlign: 'center' }}>
              🎯 {G.entities[targetEntity]?.name}
            </div>
          )}

          {/* Black Market */}
          {showBlackMarket && (
            <div style={{ fontSize: '10px', maxHeight: '180px', overflowY: 'auto' }}>
              <div style={{ color: '#ffaa00', marginBottom: '3px', fontWeight: 'bold' }}>🛒 Bid on item:</div>
              {G.blackMarket.map(item => (
                <div key={item.id} onClick={() => setSelectedBMItem(item.id)} style={{
                  padding: '4px', marginBottom: '2px', borderRadius: '3px', cursor: 'pointer',
                  border: `1px solid ${selectedBMItem === item.id ? '#ffaa00' : '#333'}`,
                  backgroundColor: selectedBMItem === item.id ? '#2a1a00' : '#1a1a1a', color: '#aaa'
                }}>
                  <div style={{ color: '#ffaa00' }}>{item.name}</div>
                  <div style={{ fontSize: '9px' }}>{item.description}</div>
                  <div style={{ fontSize: '9px' }}>Bid:{item.currentBid} ({item.bidder || 'none'})</div>
                </div>
              ))}
              {selectedBMItem && (
                <>
                  <div style={{ color: '#aaa', fontSize: '10px' }}>Your bid: {bidAmount}</div>
                  <input type="range"
                    min={(G.blackMarket.find(i => i.id === selectedBMItem)?.currentBid || 0) + 1}
                    max="10" value={bidAmount}
                    onChange={e => setBidAmount(Number(e.target.value))}
                    style={{ width: '100%' }} />
                </>
              )}
            </div>
          )}

          {/* Inventory */}
          {myInventory.length > 0 && (
            <div style={{ fontSize: '10px' }}>
              <div style={{ color: '#ffaa00', marginBottom: '2px' }}>🎒 Inventory:</div>
              {myInventory.map(item => (
                <div key={item.id} onClick={() => moves.useItem(item.id)} style={{
                  padding: '3px', marginBottom: '2px', backgroundColor: '#1a1a00',
                  border: '1px solid #ffaa00', borderRadius: '3px', cursor: 'pointer', color: '#ffaa00', fontSize: '10px'
                }}>
                  {item.name}
                </div>
              ))}
            </div>
          )}

          {/* Active effects */}
          {isActive && G.activeEffects?.[currentTeam]?.length > 0 && (
            <div style={{ fontSize: '9px', color: '#ffaa00', backgroundColor: '#1a1a00', padding: '3px', borderRadius: '3px' }}>
              ✨ {G.activeEffects[currentTeam].join(', ')}
            </div>
          )}

          {/* DICE — shown when attack is confirmed */}
          {(step === 'rollDice' || (step === 'confirm' && selectedAction === 'attack')) && (
            <div style={{ backgroundColor: '#1a0a0a', border: '2px solid #ff4a4a', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
              <div style={{ color: '#ff4a4a', fontSize: '11px', marginBottom: '4px', fontWeight: 'bold' }}>⚔️ ROLL TO ATTACK</div>
              <Dice
                onRoll={step === 'rollDice' ? handleDiceRoll : () => {}}
                disabled={step !== 'rollDice'}
                result={G.lastDieRoll}
              />
              {G.lastDieRoll !== null && G.lastDamage !== null && (
                <div style={{
                  color: G.lastDamage < 0 ? '#ff4a4a' : G.lastDamage === 0 ? '#ffff00' : '#4aff4a',
                  fontWeight: 'bold', fontSize: '12px', marginTop: '4px'
                }}>
                  {G.lastDamage < 0 ? `🔥 BACKFIRE ${G.lastDamage}` : G.lastDamage === 0 ? '💨 MISS' : `💥 ${G.lastDamage} DMG`}
                </div>
              )}
            </div>
          )}

          {/* Execute */}
          {step === 'confirm' && selectedAction !== 'attack' && (
            <button onClick={handleExecute} style={{
              padding: '8px', backgroundColor: '#1a4a1a', color: '#4aff4a',
              border: '2px solid #4aff4a', borderRadius: '5px', cursor: 'pointer',
              fontWeight: 'bold', fontSize: '12px', width: '100%'
            }}>✅ EXECUTE</button>
          )}

          {/* Execute Attack — shows before dice */}
          {step === 'confirm' && selectedAction === 'attack' && (
            <button onClick={handleExecute} style={{
              padding: '8px', backgroundColor: '#4a0a0a', color: '#ff4a4a',
              border: '2px solid #ff4a4a', borderRadius: '5px', cursor: 'pointer',
              fontWeight: 'bold', fontSize: '12px', width: '100%'
            }}>⚔️ PREPARE ATTACK</button>
          )}

          {/* Cancel */}
          {step !== 'selectEntity' && step !== 'rollDice' && (
            <button onClick={reset} style={{ padding: '5px', backgroundColor: '#2a1a1a', color: '#ff6666', border: '1px solid #ff6666', borderRadius: '5px', cursor: 'pointer', fontSize: '10px', width: '100%' }}>
              🔄 Cancel
            </button>
          )}

          {/* End Turn */}
          {isActive && step !== 'rollDice' && (
            <button onClick={handleEndTurn} style={{
              padding: '8px', backgroundColor: '#1a1a4a', color: '#aaaaff',
              border: '2px solid #aaaaff', borderRadius: '5px', cursor: 'pointer',
              fontWeight: 'bold', fontSize: '11px', width: '100%', marginTop: '4px'
            }}>⏭️ END TURN</button>
          )}
        </div>

        {/* Russia Team */}
        <div style={{ flex: 1, backgroundColor: '#2a0d0d', borderRadius: '10px', padding: '10px', border: '2px solid #ff4a4a' }}>
          <h3 style={{ color: '#ff4a4a', textAlign: 'center', margin: '0 0 8px 0', fontSize: '13px' }}>🇷🇺 RUSSIA TEAM</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
            {ruEntities.map(e => (
              <EntityCard key={e.id} entity={e} onClick={handleEntityClick}
                highlight={getHighlight(e.id)} dim={isDim(e.id)} acted={isActed(e.id)} />
            ))}
          </div>
        </div>
      </div>

      {/* Attack vectors */}
      <div style={{ textAlign: 'center', margin: '6px 0', fontSize: '11px' }}>
        <span style={{ color: '#9944ff' }}>━━ UK attacks Russia Govt ━━▶</span>
        {'   '}
        <span style={{ color: '#ff8800' }}>◀━━ Russia attacks UK Govt ━━</span>
      </div>

      {/* Log */}
      <div style={{ backgroundColor: '#111', borderRadius: '10px', padding: '10px', border: '1px solid #333', maxHeight: '110px', overflowY: 'auto' }}>
        <div style={{ color: '#ffff00', fontWeight: 'bold', fontSize: '11px', marginBottom: '5px' }}>📋 Action Log</div>
        {G.log.length === 0 && <div style={{ color: '#555', fontSize: '11px' }}>No actions yet...</div>}
        {G.log.slice(-8).reverse().map((entry, i) => (
          <div key={i} style={{ color: i === 0 ? '#fff' : '#666', fontSize: '11px', marginBottom: '2px' }}>› {entry}</div>
        ))}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.1)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}
