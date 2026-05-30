import React, { useState, useEffect, useRef } from 'react';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const TURN_TIME = 180;
const REVITALISE_COSTS = { 1: 1, 2: 3, 3: 6, 4: 10 };

// ── Sounds ─────────────────────────────────────────────────
function playSound(type) {
  try {
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
    } else if (type === 'card') {
      o.type = 'sine';
      o.frequency.setValueAtTime(660, ctx.currentTime);
      o.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
      g.gain.setValueAtTime(0.2, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      o.start(); o.stop(ctx.currentTime + 0.2);
    } else if (type === 'action') {
      o.type = 'sine';
      o.frequency.setValueAtTime(523, ctx.currentTime);
      g.gain.setValueAtTime(0.15, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      o.start(); o.stop(ctx.currentTime + 0.12);
    } else if (type === 'endturn') {
      o.type = 'sine';
      o.frequency.setValueAtTime(330, ctx.currentTime);
      o.frequency.setValueAtTime(495, ctx.currentTime + 0.12);
      g.gain.setValueAtTime(0.2, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      o.start(); o.stop(ctx.currentTime + 0.25);
    }
  } catch(e) {}
}

// ── Timer ──────────────────────────────────────────────────
function Timer({ isActive, onExpire, resetKey }) {
  const [timeLeft, setTimeLeft] = useState(TURN_TIME);
  const ref = useRef();
  useEffect(() => { setTimeLeft(TURN_TIME); }, [resetKey]);
  useEffect(() => {
    if (!isActive) { clearInterval(ref.current); return; }
    ref.current = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { clearInterval(ref.current); onExpire(); return 0; } return t - 1; });
    }, 1000);
    return () => clearInterval(ref.current);
  }, [isActive, resetKey]);
  const m = Math.floor(timeLeft / 60), s = timeLeft % 60;
  const pct = (timeLeft / TURN_TIME) * 100;
  const col = timeLeft > 60 ? '#4aff4a' : timeLeft > 30 ? '#ffff00' : '#ff4a4a';
  return (
    <div style={{ textAlign: 'center' }}>
      <span style={{ color: col, fontSize: '18px', fontWeight: 'bold' }}>
        ⏱ {m}:{s.toString().padStart(2,'0')}
      </span>
      <div style={{ width: '100px', height: '4px', backgroundColor: '#333', borderRadius: '3px', margin: '2px auto' }}>
        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: col, borderRadius: '3px', transition: 'width 1s linear' }} />
      </div>
    </div>
  );
}

// ── Dice ───────────────────────────────────────────────────
function Dice({ onRoll, disabled, result }) {
  const [rolling, setRolling] = useState(false);
  const [display, setDisplay] = useState('❓');
  const faces = ['⚀','⚁','⚂','⚃','⚄','⚅'];
  const handleClick = () => {
    if (disabled || rolling) return;
    setRolling(true);
    playSound('dice');
    let count = 0;
    const iv = setInterval(() => {
      setDisplay(faces[Math.floor(Math.random() * 6)]);
      count++;
      if (count >= 14) { clearInterval(iv); setRolling(false); onRoll(); }
    }, 75);
  };
  return (
    <div style={{ textAlign: 'center', margin: '4px 0' }}>
      <div onClick={handleClick} style={{
        fontSize: '48px', cursor: disabled ? 'not-allowed' : 'pointer',
        userSelect: 'none', display: 'inline-block',
        filter: disabled ? 'grayscale(1) opacity(0.3)' : 'drop-shadow(0 0 8px #ff6600)',
      }}>
        {result !== null && !rolling ? faces[result - 1] : display}
      </div>
      <div style={{ color: '#888', fontSize: '10px' }}>
        {disabled ? '—' : rolling ? 'Rolling...' : result !== null ? `Rolled: ${result}` : 'Click to roll!'}
      </div>
    </div>
  );
}

// ── Entity Card ────────────────────────────────────────────
function EntityCard({ entity, onClick, highlight, dim, acted }) {
  const tc = entity.team === 'UK' ? '#4a9eff' : '#ff4a4a';
  const border = highlight === 'selected' ? '#ffff00' : highlight === 'target' ? '#00ff00' : tc;
  const bg = highlight === 'selected' ? '#2a2a00' : highlight === 'target' ? '#002200' : entity.team === 'UK' ? '#0a1520' : '#1a0808';
  return (
    <div onClick={() => !dim && onClick(entity.id)} style={{
      border: `2px solid ${border}`,
      borderRadius: '8px', padding: '8px 6px',
      backgroundColor: bg,
      boxShadow: `0 0 ${highlight ? '14px' : '5px'} ${border}`,
      opacity: dim ? 0.25 : acted ? 0.55 : 1,
      cursor: dim ? 'default' : 'pointer',
      transition: 'all 0.15s',
      position: 'relative',
      minWidth: '90px',
      textAlign: 'center',
    }}>
      {acted && <div style={{ position:'absolute', top:'2px', right:'4px', color:'#666', fontSize:'9px' }}>✓</div>}
      <div style={{ color: tc, fontWeight: 'bold', fontSize: '10px', marginBottom: '4px', lineHeight: 1.2 }}>
        {entity.name}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '10px' }}>
        <span style={{ color: '#ffaa44' }}>💰{entity.resource}</span>
        <span style={{ color: '#ff5555' }}>❤️{entity.vitality}</span>
      </div>
      {entity.canBlackMarket && <div style={{ color: '#aa77ff', fontSize: '8px', marginTop: '2px' }}>★ BM</div>}
    </div>
  );
}

// ── Black Market Card ──────────────────────────────────────
function BMCard({ item, isRevealed, isSelected, onReveal, onSelect }) {
  if (!isRevealed) {
    return (
      <div onClick={onReveal} style={{
        width: '80px', height: '110px', borderRadius: '8px',
        background: 'linear-gradient(135deg, #150a30, #251545)',
        border: '2px solid #6633cc',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', cursor: 'pointer',
        boxShadow: '0 0 12px rgba(102,51,204,0.5)',
        transition: 'transform 0.2s',
      }}>
        <div style={{ fontSize: '24px' }}>🃏</div>
        <div style={{ color: '#9966ff', fontSize: '8px', marginTop: '4px', textAlign: 'center', lineHeight: 1.3 }}>
          BLACK<br/>MARKET
        </div>
        <div style={{ color: '#ffff00', fontSize: '8px', marginTop: '3px' }}>DRAW</div>
      </div>
    );
  }
  return (
    <div onClick={onSelect} style={{
      width: '80px', height: '110px', borderRadius: '8px',
      background: isSelected
        ? 'linear-gradient(135deg, #2a2a00, #3a3a00)'
        : 'linear-gradient(135deg, #0a1a0a, #152015)',
      border: `2px solid ${isSelected ? '#ffff00' : '#33cc66'}`,
      display: 'flex', flexDirection: 'column', padding: '6px',
      cursor: 'pointer',
      boxShadow: isSelected ? '0 0 14px rgba(255,255,0,0.5)' : '0 0 6px rgba(51,204,102,0.3)',
    }}>
      <div style={{ fontSize: '16px', textAlign: 'center' }}>{item.icon}</div>
      <div style={{ color: '#33cc66', fontSize: '8px', fontWeight: 'bold', textAlign: 'center', marginTop: '2px', lineHeight: 1.2 }}>
        {item.name}
      </div>
      <div style={{ color: '#999', fontSize: '7px', flex: 1, lineHeight: 1.3, marginTop: '2px' }}>
        {item.description}
      </div>
      <div style={{ color: '#ffaa00', fontSize: '8px', textAlign: 'center', marginTop: '2px' }}>
        min: {item.minBid}💰
      </div>
      {item.currentBid > 0 && (
        <div style={{ color: '#ff6666', fontSize: '7px', textAlign: 'center' }}>
          bid: {item.currentBid}
        </div>
      )}
    </div>
  );
}

// ── SVG Connections ────────────────────────────────────────
// We'll draw connections between entity cards using absolute positions
// Positions are percentages of the board container
const ENTITY_LAYOUT = {
  // UK side - left half
  uk_plc:     { col: 0, row: 1, team: 'UK' },
  electorate: { col: 0, row: 3, team: 'UK' },
  uk_gov:     { col: 1, row: 2, team: 'UK' },
  gchq:       { col: 2, row: 1, team: 'UK' },
  edf:        { col: 2, row: 3, team: 'UK' },
  // Russia side - right half
  scs:        { col: 3, row: 1, team: 'Russia' },
  ru_gov:     { col: 4, row: 2, team: 'Russia' },
  bear:       { col: 5, row: 1, team: 'Russia' },
  trolls:     { col: 5, row: 3, team: 'Russia' },
  rosatom:    { col: 3, row: 3, team: 'Russia' },
};

export function Board({ G, ctx, moves, isActive, events }) {
  const [step, setStep] = useState('selectEntity');
  const [selEntity, setSelEntity] = useState(null);
  const [selAction, setSelAction] = useState(null);
  const [targetEnt, setTargetEnt] = useState(null);
  const [amount, setAmount] = useState(1);
  const [revealedBM, setRevealedBM] = useState([]);
  const [selBMItem, setSelBMItem] = useState(null);
  const [bidAmt, setBidAmt] = useState(1);
  const [timerKey, setTimerKey] = useState(0);
  const goSoundPlayed = useRef(false);

  const curTeam = ctx.currentPlayer === '0' ? 'UK' : 'Russia';
  const month = MONTHS[(G.currentTurn - 1) % 12];
  const myInv = G.inventory?.[curTeam] || [];
  const atkTarget = curTeam === 'UK' ? 'ru_gov' : 'uk_gov';

  useEffect(() => {
    if (G.gameOver && !goSoundPlayed.current) {
      goSoundPlayed.current = true;
      setTimeout(() => playSound('gameover'), 400);
    }
  }, [G.gameOver]);

  useEffect(() => {
    setTimerKey(k => k + 1);
    setRevealedBM([]);
    setSelBMItem(null);
  }, [ctx.currentPlayer, G.currentTurn]);

  const reset = () => {
    setStep('selectEntity'); setSelEntity(null); setSelAction(null);
    setTargetEnt(null); setAmount(1); setSelBMItem(null); setBidAmt(1);
  };

  const handleEntityClick = (id) => {
    if (!isActive) return;
    const ent = G.entities[id];
    if (!ent) return;
    if (step === 'selectEntity') {
      if (ent.team !== curTeam) return;
      setSelEntity(id); setStep('selectAction'); playSound('action');
    } else if (step === 'selectTarget') {
      if (selAction === 'distribute' && ent.team !== curTeam) return;
      if (selAction === 'attack' && ent.team === curTeam) return;
      setTargetEnt(id); setStep('confirm');
    }
  };

  const handleAction = (action) => {
    setSelAction(action); playSound('action');
    if (action === 'distribute') setStep('selectTarget');
    else if (action === 'attack') {
      if (G.currentTurn === 1) { alert('No attacks in January!'); return; }
      setTargetEnt(atkTarget); setStep('confirm');
    } else if (action === 'blackmarket') setStep('confirm');
    else setStep('confirm');
  };

  const handleExecute = () => {
    if (!selEntity || !selAction) return;
    if (selAction === 'distribute') {
      if (!targetEnt) { alert('Select target!'); return; }
      moves.distribute(selEntity, targetEnt, amount); reset();
    } else if (selAction === 'revitalise') {
      moves.revitalise(selEntity, amount); reset();
    } else if (selAction === 'attack') {
      moves.prepareAttack(selEntity, amount); setStep('rollDice');
    } else if (selAction === 'abstain') {
      moves.abstain(selEntity); reset();
    } else if (selAction === 'blackmarket' && selBMItem) {
      moves.blackMarketBid(selEntity, selBMItem, bidAmt); reset();
    }
  };

  const handleDiceRoll = () => { moves.rollDiceAndAttack(); setTimeout(reset, 2000); };
  const handleEndTurn = () => { playSound('endturn'); reset(); setTimerKey(k => k+1); events.endTurn(); };
  const handleTimerExpire = () => { if (isActive) { reset(); events.endTurn(); } };

  const highlight = (id) => {
    if (id === selEntity) return 'selected';
    if (id === targetEnt) return 'target';
    return null;
  };
  const acted = (id) => G.actedThisTurn.includes(id);
  const dimmed = (id) => {
    if (!isActive) return false;
    const ent = G.entities[id];
    if (step === 'rollDice') return true;
    if (step === 'selectEntity' && ent.team !== curTeam) return true;
    if (step === 'selectTarget' && selAction === 'attack' && ent.team === curTeam) return true;
    if (step === 'selectTarget' && selAction === 'distribute' && ent.team !== curTeam) return true;
    return false;
  };

  const selEntData = selEntity ? G.entities[selEntity] : null;
  const tgtEntData = targetEnt ? G.entities[targetEnt] : null;

  // ── GAME OVER ─────────────────────────────────────────
  if (G.gameOver) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace',
        background: 'radial-gradient(ellipse at center, #1a0a2e 0%, #050510 100%)',
        color: 'white', padding: '20px',
      }}>
        <div style={{ fontSize: '80px' }}>🏆</div>
        <h1 style={{ color: '#ffff00', fontSize: '42px', margin: '10px 0', textShadow: '0 0 30px #ffff00' }}>
          GAME OVER!
        </h1>
        <h2 style={{ color: G.winner === 'UK' ? '#4a9eff' : '#ff4a4a', fontSize: '28px', margin: '0 0 24px' }}>
          {G.winner === 'UK' ? '🇬🇧 UK WINS!' : G.winner === 'Russia' ? '🇷🇺 RUSSIA WINS!' : '🤝 DRAW!'}
        </h2>
        <div style={{ display: 'flex', gap: '50px', marginBottom: '28px' }}>
          {[['🇬🇧','UK',G.vpUK,'#4a9eff'],['🇷🇺','Russia',G.vpRussia,'#ff4a4a']].map(([flag,name,vp,col])=>(
            <div key={name} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px' }}>{flag}</div>
              <div style={{ color: col, fontSize: '48px', fontWeight: 'bold' }}>{vp}</div>
              <div style={{ color: '#888', fontSize: '13px' }}>Victory Points</div>
            </div>
          ))}
        </div>
        <div style={{ maxWidth: '460px', backgroundColor: '#111', borderRadius: '10px', padding: '15px', border: '1px solid #333', width: '100%' }}>
          <div style={{ color: '#ffff00', fontWeight: 'bold', marginBottom: '8px' }}>📋 Final Log</div>
          {G.log.slice(-8).reverse().map((e,i) => (
            <div key={i} style={{ color: i===0?'#ccc':'#555', fontSize: '11px', margin: '2px 0' }}>› {e}</div>
          ))}
        </div>
      </div>
    );
  }

  // ── MAIN UI ───────────────────────────────────────────
  return (
    <div style={{ backgroundColor: '#070712', minHeight: '100vh', fontFamily: 'monospace', color: 'white', display: 'flex', flexDirection: 'column' }}>

      {/* TOP BAR */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: '#0e0e20', borderBottom: '1px solid #222',
        padding: '8px 20px', gap: '10px',
      }}>
        <div style={{ color: '#4a9eff', fontSize: '18px', fontWeight: 'bold' }}>🇬🇧 {G.vpUK} VP</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#ffff00', fontSize: '13px' }}>📅 {month} · Turn {G.currentTurn}/12</div>
          <Timer isActive={isActive} onExpire={handleTimerExpire} resetKey={timerKey} />
          <div style={{ fontSize: '11px', color: curTeam === 'UK' ? '#4a9eff' : '#ff4a4a', fontWeight: 'bold' }}>
            {isActive ? `▶ YOUR TURN (${curTeam})` : `⏳ ${curTeam}'s Turn`}
          </div>
        </div>
        <div style={{ color: '#ff4a4a', fontSize: '18px', fontWeight: 'bold' }}>{G.vpRussia} VP 🇷🇺</div>
      </div>

      {/* INSTRUCTION BANNER */}
      {isActive && step !== 'rollDice' && (
        <div style={{ backgroundColor: '#1a1a05', borderBottom: '1px solid #444400', padding: '5px', textAlign: 'center', color: '#ffff00', fontSize: '11px' }}>
          {step === 'selectEntity' && `👆 Select a ${curTeam} entity · or END TURN`}
          {step === 'selectAction' && `⚡ Action for: ${selEntData?.name}`}
          {step === 'selectTarget' && selAction === 'distribute' && '📦 Click connected entity to receive resources'}
          {step === 'selectTarget' && selAction === 'attack' && '⚔️ Target is auto-set to enemy Government'}
          {step === 'confirm' && selAction === 'blackmarket' && '🃏 Draw a card, then set your bid amount'}
          {step === 'confirm' && selAction !== 'blackmarket' && '✅ Set amount and EXECUTE'}
        </div>
      )}

      {/* MAIN CONTENT */}
      <div style={{ display: 'flex', flex: 1, padding: '12px', gap: '12px', alignItems: 'flex-start' }}>

        {/* ── LEFT: UK TEAM ── */}
        <div style={{
          width: '220px', backgroundColor: '#080e18', borderRadius: '10px',
          border: '2px solid #1a3a5a', padding: '10px', flexShrink: 0,
        }}>
          <div style={{ color: '#4a9eff', fontWeight: 'bold', textAlign: 'center', fontSize: '13px', marginBottom: '10px', borderBottom: '1px solid #1a3a5a', paddingBottom: '6px' }}>
            🇬🇧 UK TEAM
          </div>

          {/* Government - centre of UK */}
          <div style={{ marginBottom: '8px' }}>
            <EntityCard entity={G.entities['uk_gov']} onClick={handleEntityClick}
              highlight={highlight('uk_gov')} dim={dimmed('uk_gov')} acted={acted('uk_gov')} />
          </div>

          {/* 4 connected entities */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            {['uk_plc','electorate','gchq','edf'].map(id => (
              <EntityCard key={id} entity={G.entities[id]} onClick={handleEntityClick}
                highlight={highlight(id)} dim={dimmed(id)} acted={acted(id)} />
            ))}
          </div>

          {/* UK connections diagram hint */}
          <div style={{ marginTop: '8px', padding: '5px', backgroundColor: '#0a1525', borderRadius: '5px', fontSize: '9px', color: '#336688', textAlign: 'center' }}>
            ← Govt distributes to all<br/>UK Plc & Electorate → Govt
          </div>
        </div>

        {/* ── CENTRE: ATTACK VECTORS + LOG ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', minWidth: 0 }}>

          {/* Attack vector visual */}
          <div style={{
            backgroundColor: '#0a0a1a', borderRadius: '10px', border: '1px solid #222',
            padding: '14px 20px', textAlign: 'center',
          }}>
            <div style={{ color: '#888', fontSize: '11px', marginBottom: '8px' }}>ATTACK VECTORS</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '6px' }}>
              <span style={{ color: '#4a9eff', fontSize: '12px' }}>🇬🇧 UK Govt</span>
              <span style={{ color: '#aa44ff', fontSize: '18px' }}>━━━━▶</span>
              <span style={{ color: '#ff4a4a', fontSize: '12px' }}>Russia Govt 🇷🇺</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <span style={{ color: '#4a9eff', fontSize: '12px' }}>🇬🇧 UK Govt</span>
              <span style={{ color: '#ff6600', fontSize: '18px' }}>◀━━━━</span>
              <span style={{ color: '#ff4a4a', fontSize: '12px' }}>Russia Govt 🇷🇺</span>
            </div>
            <div style={{ color: '#444', fontSize: '9px', marginTop: '6px' }}>
              Purple = UK attacks · Orange = Russia attacks
            </div>
          </div>

          {/* Status boxes */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {/* UK Govt quick stats */}
            <div style={{ flex: 1, backgroundColor: '#080e18', border: '1px solid #1a3a5a', borderRadius: '8px', padding: '8px', fontSize: '10px' }}>
              <div style={{ color: '#4a9eff', fontWeight: 'bold', marginBottom: '4px' }}>🇬🇧 UK Govt</div>
              <div style={{ color: '#ffaa44' }}>💰 {G.entities['uk_gov'].resource}</div>
              <div style={{ color: '#ff5555' }}>❤️ {G.entities['uk_gov'].vitality}</div>
            </div>
            {/* Russia Govt quick stats */}
            <div style={{ flex: 1, backgroundColor: '#180808', border: '1px solid #5a1a1a', borderRadius: '8px', padding: '8px', fontSize: '10px' }}>
              <div style={{ color: '#ff4a4a', fontWeight: 'bold', marginBottom: '4px' }}>🇷🇺 Russia Govt</div>
              <div style={{ color: '#ffaa44' }}>💰 {G.entities['ru_gov'].resource}</div>
              <div style={{ color: '#ff5555' }}>❤️ {G.entities['ru_gov'].vitality}</div>
            </div>
          </div>

          {/* Action Log */}
          <div style={{
            backgroundColor: '#0a0a18', borderRadius: '10px', border: '1px solid #1a1a30',
            padding: '10px', maxHeight: '160px', overflowY: 'auto', flex: 1,
          }}>
            <div style={{ color: '#ffff00', fontSize: '11px', fontWeight: 'bold', marginBottom: '6px' }}>📋 Action Log</div>
            {G.log.length === 0 && <div style={{ color: '#444', fontSize: '10px' }}>No actions yet...</div>}
            {G.log.slice(-10).reverse().map((e, i) => (
              <div key={i} style={{ color: i === 0 ? '#ddd' : '#555', fontSize: '10px', marginBottom: '2px' }}>
                › {e}
              </div>
            ))}
          </div>
        </div>

        {/* ── ACTION PANEL ── */}
        <div style={{
          width: '195px', backgroundColor: '#0a0a1a', borderRadius: '10px',
          border: '1px solid #2a2a40', padding: '10px',
          display: 'flex', flexDirection: 'column', gap: '5px',
          maxHeight: '80vh', overflowY: 'auto', flexShrink: 0,
        }}>
          <div style={{ color: '#ffff00', textAlign: 'center', fontWeight: 'bold', fontSize: '12px', borderBottom: '1px solid #333', paddingBottom: '5px', marginBottom: '3px' }}>
            ⚡ ACTIONS
          </div>

          {selEntData && (
            <div style={{ backgroundColor: '#1a1a05', border: '1px solid #555500', borderRadius: '5px', padding: '5px', fontSize: '10px', textAlign: 'center' }}>
              <div style={{ color: '#ffff00', fontWeight: 'bold' }}>{selEntData.name}</div>
              <span style={{ color: '#ffaa44' }}>💰{selEntData.resource}</span>{' '}
              <span style={{ color: '#ff5555' }}>❤️{selEntData.vitality}</span>
            </div>
          )}

          {step === 'selectAction' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {[
                ['distribute', '📦 Distribute', '#4a9eff', false],
                ['revitalise', '💚 Revitalise', '#4aff4a', false],
                ['attack', G.currentTurn === 1 ? '⚔️ Attack 🔒 Jan' : '⚔️ Attack', '#ff4a4a', G.currentTurn === 1],
                ...(selEntData?.canBlackMarket ? [['blackmarket','🃏 Black Market','#aa77ff',false]] : []),
                ['abstain', '⏸️ Abstain', '#888', false],
              ].map(([act, label, col, dis]) => (
                <button key={act} onClick={() => !dis && handleAction(act)} style={{
                  padding: '7px 8px', backgroundColor: '#111', color: dis ? '#444' : col,
                  border: `1px solid ${dis ? '#333' : col}`, borderRadius: '5px',
                  cursor: dis ? 'not-allowed' : 'pointer', fontSize: '11px', textAlign: 'left',
                }}>{label}</button>
              ))}
            </div>
          )}

          {/* Amount slider */}
          {['selectTarget','confirm'].includes(step) && selAction && !['abstain','blackmarket'].includes(selAction) && (
            <div style={{ backgroundColor: '#111', borderRadius: '5px', padding: '6px' }}>
              <div style={{ color: '#aaa', fontSize: '10px', marginBottom: '2px' }}>
                {selAction === 'revitalise'
                  ? `+${amount} VIT (Cost: ${REVITALISE_COSTS[amount]} 💰)`
                  : `Spend: ${amount} 💰`}
              </div>
              <input type="range" min="1" max={selAction === 'revitalise' ? '4' : '6'}
                value={amount} onChange={e => setAmount(Number(e.target.value))} style={{ width: '100%' }} />
            </div>
          )}

          {/* Target info */}
          {tgtEntData && step !== 'rollDice' && (
            <div style={{ backgroundColor: '#002200', border: '1px solid #33aa33', borderRadius: '5px', padding: '5px', fontSize: '10px', color: '#44ff44', textAlign: 'center' }}>
              🎯 {tgtEntData.name}
            </div>
          )}

          {/* Black Market cards */}
          {step === 'confirm' && selAction === 'blackmarket' && (
            <div>
              <div style={{ color: '#aa77ff', fontSize: '10px', fontWeight: 'bold', marginBottom: '5px', textAlign: 'center' }}>🃏 DECK — Click to draw</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center' }}>
                {G.blackMarket.map(item => (
                  <BMCard key={item.id} item={item}
                    isRevealed={revealedBM.includes(item.id)}
                    isSelected={selBMItem === item.id}
                    onReveal={() => { setRevealedBM(p => [...p, item.id]); playSound('card'); }}
                    onSelect={() => setSelBMItem(item.id)} />
                ))}
              </div>
              {selBMItem && (
                <div style={{ marginTop: '6px' }}>
                  <div style={{ color: '#aaa', fontSize: '10px' }}>Bid: {bidAmt} 💰</div>
                  <input type="range" min={G.blackMarket.find(i=>i.id===selBMItem)?.minBid||1}
                    max="10" value={bidAmt} onChange={e => setBidAmt(Number(e.target.value))} style={{ width: '100%' }} />
                </div>
              )}
            </div>
          )}

          {/* Dice */}
          {(step === 'rollDice' || (step === 'confirm' && selAction === 'attack')) && (
            <div style={{ backgroundColor: '#150505', border: '2px solid #882222', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
              <div style={{ color: '#ff6666', fontSize: '11px', fontWeight: 'bold', marginBottom: '3px' }}>⚔️ COMBAT</div>
              <Dice onRoll={step === 'rollDice' ? handleDiceRoll : ()=>{}}
                disabled={step !== 'rollDice'} result={step === 'rollDice' ? null : G.lastDieRoll} />
              {G.lastDieRoll !== null && G.lastDamage !== null && step !== 'rollDice' && (
                <div style={{ color: G.lastDamage<0?'#ff4a4a':G.lastDamage===0?'#ffff00':'#4aff4a', fontWeight:'bold', fontSize:'12px', marginTop:'3px' }}>
                  {G.lastDamage<0?`🔥 Backfire ${G.lastDamage}`:G.lastDamage===0?'💨 Miss':`💥 ${G.lastDamage} DMG`}
                </div>
              )}
            </div>
          )}

          {/* Inventory */}
          {myInv.length > 0 && (
            <div>
              <div style={{ color: '#aa77ff', fontSize: '10px', fontWeight: 'bold', marginBottom: '3px' }}>🎒 Inventory:</div>
              {myInv.map(item => (
                <div key={item.id} onClick={() => moves.useItem(item.id)} style={{
                  padding: '4px 6px', marginBottom: '2px', backgroundColor: '#15082a',
                  border: '1px solid #8855cc', borderRadius: '4px', cursor: 'pointer',
                  color: '#cc99ff', fontSize: '10px',
                }}>
                  {item.icon} {item.name}
                </div>
              ))}
            </div>
          )}

          {/* Active effects */}
          {G.activeEffects?.[curTeam]?.length > 0 && (
            <div style={{ backgroundColor: '#1a1505', border: '1px solid #554400', borderRadius: '4px', padding: '4px', fontSize: '9px', color: '#ffaa00' }}>
              ✨ {G.activeEffects[curTeam].join(' · ')}
            </div>
          )}

          {/* Execute */}
          {step === 'confirm' && selAction !== 'attack' && (
            <button onClick={handleExecute} style={{
              padding: '9px', backgroundColor: '#0a2a0a', color: '#44ff44',
              border: '2px solid #44ff44', borderRadius: '6px', cursor: 'pointer',
              fontWeight: 'bold', fontSize: '12px', marginTop: '4px',
            }}>✅ EXECUTE</button>
          )}
          {step === 'confirm' && selAction === 'attack' && (
            <button onClick={handleExecute} style={{
              padding: '9px', backgroundColor: '#2a0505', color: '#ff6666',
              border: '2px solid #ff6666', borderRadius: '6px', cursor: 'pointer',
              fontWeight: 'bold', fontSize: '12px', marginTop: '4px',
            }}>⚔️ PREPARE ATTACK</button>
          )}

          {/* Cancel */}
          {step !== 'selectEntity' && step !== 'rollDice' && (
            <button onClick={reset} style={{
              padding: '5px', backgroundColor: '#1a0808', color: '#ff6666',
              border: '1px solid #ff3333', borderRadius: '5px', cursor: 'pointer',
              fontSize: '10px',
            }}>🔄 Cancel</button>
          )}

          {/* End Turn */}
          {isActive && step !== 'rollDice' && (
            <button onClick={handleEndTurn} style={{
              padding: '9px', backgroundColor: '#080820', color: '#8888ff',
              border: '2px solid #8888ff', borderRadius: '6px', cursor: 'pointer',
              fontWeight: 'bold', fontSize: '12px', marginTop: '6px',
            }}>⏭️ END TURN</button>
          )}
        </div>

        {/* ── RIGHT: RUSSIA TEAM ── */}
        <div style={{
          width: '220px', backgroundColor: '#180808', borderRadius: '10px',
          border: '2px solid #5a1a1a', padding: '10px', flexShrink: 0,
        }}>
          <div style={{ color: '#ff4a4a', fontWeight: 'bold', textAlign: 'center', fontSize: '13px', marginBottom: '10px', borderBottom: '1px solid #5a1a1a', paddingBottom: '6px' }}>
            🇷🇺 RUSSIA TEAM
          </div>

          {/* Government */}
          <div style={{ marginBottom: '8px' }}>
            <EntityCard entity={G.entities['ru_gov']} onClick={handleEntityClick}
              highlight={highlight('ru_gov')} dim={dimmed('ru_gov')} acted={acted('ru_gov')} />
          </div>

          {/* 4 connected entities */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            {['bear','trolls','scs','rosatom'].map(id => (
              <EntityCard key={id} entity={G.entities[id]} onClick={handleEntityClick}
                highlight={highlight(id)} dim={dimmed(id)} acted={acted(id)} />
            ))}
          </div>

          {/* Russia connections hint */}
          <div style={{ marginTop: '8px', padding: '5px', backgroundColor: '#150505', borderRadius: '5px', fontSize: '9px', color: '#663333', textAlign: 'center' }}>
            ← Govt distributes to all<br/>entities return to Govt
          </div>
        </div>
      </div>
    </div>
  );
}
