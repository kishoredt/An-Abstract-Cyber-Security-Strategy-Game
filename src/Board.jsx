import React, { useState, useEffect, useRef } from 'react';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const TURN_TIME = 180;
const REVITALISE_COSTS = { 1: 1, 2: 3, 3: 6, 4: 10 };

function playSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator(), g = ctx.createGain();
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
      <span style={{ color: col, fontSize: '20px', fontWeight: 'bold' }}>⏱ {m}:{s.toString().padStart(2,'0')}</span>
      <div style={{ width: '120px', height: '5px', backgroundColor: '#333', borderRadius: '3px', margin: '3px auto' }}>
        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: col, borderRadius: '3px', transition: 'width 1s linear' }} />
      </div>
    </div>
  );
}

function Dice({ onRoll, disabled, result }) {
  const [rolling, setRolling] = useState(false);
  const [display, setDisplay] = useState('❓');
  const faces = ['⚀','⚁','⚂','⚃','⚄','⚅'];
  const handleClick = () => {
    if (disabled || rolling) return;
    setRolling(true); playSound('dice');
    let count = 0;
    const iv = setInterval(() => {
      setDisplay(faces[Math.floor(Math.random() * 6)]);
      if (++count >= 14) { clearInterval(iv); setRolling(false); onRoll(); }
    }, 75);
  };
  return (
    <div style={{ textAlign: 'center', margin: '6px 0' }}>
      <div onClick={handleClick} style={{
        fontSize: '64px', cursor: disabled ? 'not-allowed' : 'pointer', userSelect: 'none',
        display: 'inline-block',
        filter: disabled ? 'grayscale(1) opacity(0.3)' : 'drop-shadow(0 0 12px #ff6600)',
        transition: 'transform 0.1s',
      }}>
        {result !== null && !rolling ? faces[result - 1] : display}
      </div>
      <div style={{ color: '#888', fontSize: '11px', marginTop: '2px' }}>
        {disabled ? '—' : rolling ? 'Rolling...' : result !== null ? `Rolled: ${result}` : '🎲 Click to roll!'}
      </div>
    </div>
  );
}

function EntityCard({ entity, onClick, highlight, dim, acted, size = 'normal' }) {
  const tc = entity.team === 'UK' ? '#4a9eff' : '#ff4a4a';
  const border = highlight === 'selected' ? '#ffff00' : highlight === 'target' ? '#00ff00' : tc;
  const bg = highlight === 'selected' ? '#2a2a00' : highlight === 'target' ? '#002200'
    : entity.team === 'UK' ? '#080f1a' : '#180808';
  const isGov = entity.id === 'uk_gov' || entity.id === 'ru_gov';
  return (
    <div onClick={() => !dim && onClick(entity.id)} style={{
      border: `2px solid ${border}`, borderRadius: '10px',
      padding: isGov ? '12px 10px' : '10px 8px',
      backgroundColor: bg,
      boxShadow: `0 0 ${highlight ? '18px' : '6px'} ${border}`,
      opacity: dim ? 0.2 : acted ? 0.5 : 1,
      cursor: dim ? 'default' : 'pointer',
      transition: 'all 0.15s', position: 'relative', textAlign: 'center',
    }}>
      {acted && <div style={{ position:'absolute', top:'3px', right:'5px', color:'#666', fontSize:'10px' }}>✓</div>}
      <div style={{ color: tc, fontWeight: 'bold', fontSize: isGov ? '13px' : '11px', marginBottom: '5px', lineHeight: 1.2 }}>
        {entity.name}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', fontSize: '12px' }}>
        <span style={{ color: '#ffaa44' }}>💰 {entity.resource}</span>
        <span style={{ color: '#ff5555' }}>❤️ {entity.vitality}</span>
      </div>
      {entity.canBlackMarket && <div style={{ color: '#aa77ff', fontSize: '9px', marginTop: '3px' }}>★ Black Market</div>}
    </div>
  );
}

function BMCard({ item, isRevealed, isSelected, onReveal, onSelect }) {
  if (!isRevealed) {
    return (
      <div onClick={onReveal} style={{
        width: '85px', height: '120px', borderRadius: '8px',
        background: 'linear-gradient(135deg, #150a30, #251545)',
        border: '2px solid #6633cc',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', cursor: 'pointer',
        boxShadow: '0 0 14px rgba(102,51,204,0.6)', transition: 'transform 0.15s',
      }}>
        <div style={{ fontSize: '28px' }}>🃏</div>
        <div style={{ color: '#9966ff', fontSize: '9px', marginTop: '5px', textAlign: 'center', lineHeight: 1.4 }}>BLACK<br/>MARKET</div>
        <div style={{ color: '#ffff00', fontSize: '9px', marginTop: '4px' }}>DRAW</div>
      </div>
    );
  }
  return (
    <div onClick={onSelect} style={{
      width: '85px', height: '120px', borderRadius: '8px',
      background: isSelected ? 'linear-gradient(135deg, #2a2a00, #3a3a00)' : 'linear-gradient(135deg, #0a1a0a, #152015)',
      border: `2px solid ${isSelected ? '#ffff00' : '#33cc66'}`,
      display: 'flex', flexDirection: 'column', padding: '7px',
      cursor: 'pointer',
      boxShadow: isSelected ? '0 0 16px rgba(255,255,0,0.5)' : '0 0 7px rgba(51,204,102,0.3)',
    }}>
      <div style={{ fontSize: '18px', textAlign: 'center' }}>{item.icon}</div>
      <div style={{ color: '#33cc66', fontSize: '8px', fontWeight: 'bold', textAlign: 'center', marginTop: '3px', lineHeight: 1.2 }}>{item.name}</div>
      <div style={{ color: '#999', fontSize: '7px', flex: 1, lineHeight: 1.3, marginTop: '3px' }}>{item.description}</div>
      <div style={{ color: '#ffaa00', fontSize: '8px', textAlign: 'center', marginTop: '3px' }}>min: {item.minBid}💰</div>
      {item.currentBid > 0 && <div style={{ color: '#ff6666', fontSize: '7px', textAlign: 'center' }}>bid: {item.currentBid}</div>}
    </div>
  );
}

export function Board({ G, ctx, moves, isActive, events }) {
  const [step, setStep] = useState('selectEntity');
  const [selEnt, setSelEnt] = useState(null);
  const [selAction, setSelAction] = useState(null);
  const [targetEnt, setTargetEnt] = useState(null);
  const [amount, setAmount] = useState(1);
  const [revealedBM, setRevealedBM] = useState([]);
  const [selBMItem, setSelBMItem] = useState(null);
  const [bidAmt, setBidAmt] = useState(1);
  const [timerKey, setTimerKey] = useState(0);
  const goSound = useRef(false);

  const curTeam = ctx.currentPlayer === '0' ? 'UK' : 'Russia';
  const month = MONTHS[(G.currentTurn - 1) % 12];
  const myInv = G.inventory?.[curTeam] || [];
  const atkTarget = curTeam === 'UK' ? 'ru_gov' : 'uk_gov';

  useEffect(() => {
    if (G.gameOver && !goSound.current) { goSound.current = true; setTimeout(() => playSound('gameover'), 400); }
  }, [G.gameOver]);

  useEffect(() => { setTimerKey(k => k+1); setRevealedBM([]); setSelBMItem(null); }, [ctx.currentPlayer, G.currentTurn]);

  const reset = () => { setStep('selectEntity'); setSelEnt(null); setSelAction(null); setTargetEnt(null); setAmount(1); setSelBMItem(null); setBidAmt(1); };

  const handleEntityClick = (id) => {
    if (!isActive) return;
    const ent = G.entities[id]; if (!ent) return;
    if (step === 'selectEntity') {
      if (ent.team !== curTeam) return;
      setSelEnt(id); setStep('selectAction'); playSound('action');
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
    if (!selEnt || !selAction) return;
    if (selAction === 'distribute') { if (!targetEnt) { alert('Select target!'); return; } moves.distribute(selEnt, targetEnt, amount); reset(); }
    else if (selAction === 'revitalise') { moves.revitalise(selEnt, amount); reset(); }
    else if (selAction === 'attack') { moves.prepareAttack(selEnt, amount); setStep('rollDice'); }
    else if (selAction === 'abstain') { moves.abstain(selEnt); reset(); }
    else if (selAction === 'blackmarket' && selBMItem) { moves.blackMarketBid(selEnt, selBMItem, bidAmt); reset(); }
  };

  const handleDiceRoll = () => { moves.rollDiceAndAttack(); setTimeout(reset, 2000); };
  const handleEndTurn = () => { playSound('endturn'); reset(); setTimerKey(k=>k+1); events.endTurn(); };
  const handleTimerExpire = () => { if (isActive) { reset(); events.endTurn(); } };

  const hl = (id) => { if (id === selEnt) return 'selected'; if (id === targetEnt) return 'target'; return null; };
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

  const selEntData = selEnt ? G.entities[selEnt] : null;
  const tgtEntData = targetEnt ? G.entities[targetEnt] : null;

  if (G.gameOver) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', fontFamily:'monospace', background:'radial-gradient(ellipse at center, #1a0a2e 0%, #050510 100%)', color:'white', padding:'20px' }}>
        <div style={{ fontSize:'80px' }}>🏆</div>
        <h1 style={{ color:'#ffff00', fontSize:'44px', margin:'10px 0', textShadow:'0 0 30px #ffff00' }}>GAME OVER!</h1>
        <h2 style={{ color: G.winner==='UK'?'#4a9eff':'#ff4a4a', fontSize:'28px', margin:'0 0 24px' }}>
          {G.winner==='UK'?'🇬🇧 UK WINS!':G.winner==='Russia'?'🇷🇺 RUSSIA WINS!':'🤝 DRAW!'}
        </h2>
        <div style={{ display:'flex', gap:'50px', marginBottom:'28px' }}>
          {[['🇬🇧','UK',G.vpUK,'#4a9eff'],['🇷🇺','Russia',G.vpRussia,'#ff4a4a']].map(([f,n,vp,c])=>(
            <div key={n} style={{ textAlign:'center' }}>
              <div style={{ fontSize:'36px' }}>{f}</div>
              <div style={{ color:c, fontSize:'52px', fontWeight:'bold', textShadow:`0 0 20px ${c}` }}>{vp}</div>
              <div style={{ color:'#777', fontSize:'13px' }}>Victory Points</div>
            </div>
          ))}
        </div>
        <div style={{ maxWidth:'460px', backgroundColor:'#111', borderRadius:'10px', padding:'15px', border:'1px solid #333', width:'100%' }}>
          <div style={{ color:'#ffff00', fontWeight:'bold', marginBottom:'8px' }}>📋 Final Log</div>
          {G.log.slice(-8).reverse().map((e,i)=>(
            <div key={i} style={{ color:i===0?'#ccc':'#555', fontSize:'11px', margin:'2px 0' }}>› {e}</div>
          ))}
        </div>
      </div>
    );
  }

  const btnS = (col, dis) => ({
    padding:'9px 12px', backgroundColor:'#111', color:dis?'#444':col,
    border:`1px solid ${dis?'#333':col}`, borderRadius:'6px',
    cursor:dis?'not-allowed':'pointer', fontSize:'12px', textAlign:'left', width:'100%', marginBottom:'4px',
  });

  return (
    <div style={{ backgroundColor:'#070712', minHeight:'100vh', fontFamily:'monospace', color:'white', display:'flex', flexDirection:'column' }}>

      {/* TOP BAR */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', backgroundColor:'#0e0e20', borderBottom:'1px solid #1a1a30', padding:'8px 24px' }}>
        <div style={{ color:'#4a9eff', fontSize:'20px', fontWeight:'bold' }}>🇬🇧 {G.vpUK} VP</div>
        <div style={{ textAlign:'center' }}>
          <div style={{ color:'#ffff00', fontSize:'14px', marginBottom:'3px' }}>📅 {month} · Turn {G.currentTurn}/12</div>
          <Timer isActive={isActive} onExpire={handleTimerExpire} resetKey={timerKey} />
          <div style={{ fontSize:'12px', color:curTeam==='UK'?'#4a9eff':'#ff4a4a', fontWeight:'bold', marginTop:'3px' }}>
            {isActive ? `▶ YOUR TURN (${curTeam})` : `⏳ ${curTeam}'s Turn`}
          </div>
        </div>
        <div style={{ color:'#ff4a4a', fontSize:'20px', fontWeight:'bold' }}>{G.vpRussia} VP 🇷🇺</div>
      </div>

      {/* INSTRUCTION */}
      {isActive && step !== 'rollDice' && (
        <div style={{ backgroundColor:'#131300', borderBottom:'1px solid #333300', padding:'6px', textAlign:'center', color:'#ffff00', fontSize:'11px' }}>
          {step==='selectEntity' && `👆 Select a ${curTeam} entity to act · or END TURN`}
          {step==='selectAction' && `⚡ Choose action for: ${selEntData?.name}`}
          {step==='selectTarget' && selAction==='distribute' && '📦 Click a connected entity to send resources to'}
          {step==='selectTarget' && selAction==='attack' && '⚔️ Target auto-set to enemy Government'}
          {step==='confirm' && selAction==='blackmarket' && '🃏 Draw a card from the deck, then set your bid'}
          {step==='confirm' && selAction!=='blackmarket' && '✅ Set amount and click EXECUTE'}
        </div>
      )}

      {/* MAIN 3-COLUMN LAYOUT */}
      <div style={{ display:'flex', flex:1, padding:'14px', gap:'14px', alignItems:'flex-start' }}>

        {/* ── LEFT: UK TEAM ── */}
        <div style={{ width:'240px', flexShrink:0, backgroundColor:'#080e1a', borderRadius:'12px', border:'2px solid #1a3a5a', padding:'12px', display:'flex', flexDirection:'column', gap:'8px' }}>
          <div style={{ color:'#4a9eff', fontWeight:'bold', textAlign:'center', fontSize:'15px', borderBottom:'1px solid #1a3a5a', paddingBottom:'8px' }}>
            🇬🇧 UK TEAM
          </div>
          {/* Government - full width */}
          <EntityCard entity={G.entities['uk_gov']} onClick={handleEntityClick} highlight={hl('uk_gov')} dim={dimmed('uk_gov')} acted={acted('uk_gov')} />
          {/* 4 others in 2x2 grid */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'7px' }}>
            {['uk_plc','electorate','gchq','edf'].map(id => (
              <EntityCard key={id} entity={G.entities[id]} onClick={handleEntityClick} highlight={hl(id)} dim={dimmed(id)} acted={acted(id)} />
            ))}
          </div>
          <div style={{ backgroundColor:'#0a1525', borderRadius:'6px', padding:'6px', fontSize:'9px', color:'#2a5580', textAlign:'center', lineHeight:1.6 }}>
            Govt distributes to all<br/>UK Plc &amp; Electorate → Govt
          </div>
        </div>

        {/* ── CENTRE COLUMN ── */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', gap:'12px', minWidth:0 }}>

          {/* ACTION PANEL - TOP CENTRE */}
          <div style={{ backgroundColor:'#0a0a1e', borderRadius:'12px', border:'1px solid #2a2a50', padding:'14px' }}>
            <div style={{ color:'#ffff00', textAlign:'center', fontWeight:'bold', fontSize:'14px', borderBottom:'1px solid #2a2a40', paddingBottom:'8px', marginBottom:'10px' }}>
              ⚡ ACTION PANEL
            </div>

            {/* Selected entity info */}
            {selEntData && (
              <div style={{ backgroundColor:'#1a1a05', border:'1px solid #555500', borderRadius:'6px', padding:'7px', fontSize:'11px', textAlign:'center', marginBottom:'8px' }}>
                <div style={{ color:'#ffff00', fontWeight:'bold', fontSize:'13px' }}>{selEntData.name}</div>
                <span style={{ color:'#ffaa44' }}>💰 {selEntData.resource}</span>{'  '}
                <span style={{ color:'#ff5555' }}>❤️ {selEntData.vitality}</span>
              </div>
            )}

            {/* Action buttons - horizontal row */}
            {step === 'selectAction' && (
              <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', justifyContent:'center' }}>
                {[
                  ['distribute','📦 Distribute','#4a9eff',false],
                  ['revitalise','💚 Revitalise','#4aff4a',false],
                  ['attack', G.currentTurn===1?'⚔️ Attack 🔒':'⚔️ Attack','#ff4a4a',G.currentTurn===1],
                  ...(selEntData?.canBlackMarket?[['blackmarket','🃏 Black Market','#aa77ff',false]]:[]),
                  ['abstain','⏸️ Abstain','#888888',false],
                ].map(([act,label,col,dis])=>(
                  <button key={act} onClick={()=>!dis&&handleAction(act)} style={{
                    padding:'8px 14px', backgroundColor:'#111', color:dis?'#444':col,
                    border:`1px solid ${dis?'#333':col}`, borderRadius:'6px',
                    cursor:dis?'not-allowed':'pointer', fontSize:'12px',
                  }}>{label}</button>
                ))}
              </div>
            )}

            {/* Amount slider */}
            {['selectTarget','confirm'].includes(step) && selAction && !['abstain','blackmarket'].includes(selAction) && (
              <div style={{ backgroundColor:'#111', borderRadius:'6px', padding:'8px', marginBottom:'6px' }}>
                <div style={{ color:'#aaa', fontSize:'11px', marginBottom:'4px' }}>
                  {selAction==='revitalise'
                    ? `+${amount} Vitality → Cost: ${REVITALISE_COSTS[amount]} 💰`
                    : `Resource to spend: ${amount} 💰`}
                </div>
                <input type="range" min="1" max={selAction==='revitalise'?'4':'6'}
                  value={amount} onChange={e=>setAmount(Number(e.target.value))}
                  style={{ width:'100%', accentColor:'#ffff00' }} />
                <div style={{ display:'flex', justifyContent:'space-between', color:'#555', fontSize:'9px' }}>
                  <span>1</span><span>{selAction==='revitalise'?'4':'6'}</span>
                </div>
              </div>
            )}

            {/* Target info */}
            {tgtEntData && step !== 'rollDice' && (
              <div style={{ backgroundColor:'#002200', border:'1px solid #33aa33', borderRadius:'6px', padding:'6px', fontSize:'11px', color:'#44ff44', textAlign:'center', marginBottom:'6px' }}>
                🎯 Target: <strong>{tgtEntData.name}</strong>
              </div>
            )}

            {/* Black Market */}
            {step==='confirm' && selAction==='blackmarket' && (
              <div>
                <div style={{ color:'#aa77ff', fontSize:'12px', fontWeight:'bold', marginBottom:'8px', textAlign:'center' }}>🃏 Click a face-down card to draw it</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', justifyContent:'center', marginBottom:'8px' }}>
                  {G.blackMarket.map(item => (
                    <BMCard key={item.id} item={item}
                      isRevealed={revealedBM.includes(item.id)}
                      isSelected={selBMItem===item.id}
                      onReveal={()=>{ setRevealedBM(p=>[...p,item.id]); playSound('card'); }}
                      onSelect={()=>setSelBMItem(item.id)} />
                  ))}
                </div>
                {selBMItem && (
                  <div style={{ backgroundColor:'#111', borderRadius:'6px', padding:'8px' }}>
                    <div style={{ color:'#aaa', fontSize:'11px', marginBottom:'4px' }}>Bid amount: {bidAmt} 💰</div>
                    <input type="range"
                      min={G.blackMarket.find(i=>i.id===selBMItem)?.minBid||1}
                      max="10" value={bidAmt}
                      onChange={e=>setBidAmt(Number(e.target.value))}
                      style={{ width:'100%', accentColor:'#aa77ff' }} />
                  </div>
                )}
              </div>
            )}

            {/* Dice */}
            {(step==='rollDice' || (step==='confirm' && selAction==='attack')) && (
              <div style={{ backgroundColor:'#150505', border:'2px solid #882222', borderRadius:'10px', padding:'12px', textAlign:'center' }}>
                <div style={{ color:'#ff6666', fontSize:'13px', fontWeight:'bold', marginBottom:'4px' }}>⚔️ COMBAT — Roll the Dice!</div>
                <Dice onRoll={step==='rollDice'?handleDiceRoll:()=>{}}
                  disabled={step!=='rollDice'} result={step==='rollDice'?null:G.lastDieRoll} />
                {G.lastDieRoll!==null && G.lastDamage!==null && step!=='rollDice' && (
                  <div style={{ color:G.lastDamage<0?'#ff4a4a':G.lastDamage===0?'#ffff00':'#4aff4a', fontWeight:'bold', fontSize:'14px', marginTop:'5px' }}>
                    {G.lastDamage<0?`🔥 BACKFIRE! ${G.lastDamage} VIT`:G.lastDamage===0?'💨 MISS! No damage':`💥 ${G.lastDamage} DAMAGE!`}
                  </div>
                )}
              </div>
            )}

            {/* Inventory */}
            {myInv.length > 0 && (
              <div style={{ marginTop:'8px' }}>
                <div style={{ color:'#aa77ff', fontSize:'11px', fontWeight:'bold', marginBottom:'4px' }}>🎒 Your Inventory:</div>
                <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
                  {myInv.map(item=>(
                    <div key={item.id} onClick={()=>moves.useItem(item.id)} style={{
                      padding:'5px 8px', backgroundColor:'#15082a', border:'1px solid #8855cc',
                      borderRadius:'5px', cursor:'pointer', color:'#cc99ff', fontSize:'11px',
                    }}>
                      {item.icon} {item.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Active effects */}
            {G.activeEffects?.[curTeam]?.length > 0 && (
              <div style={{ backgroundColor:'#1a1505', border:'1px solid #554400', borderRadius:'5px', padding:'5px', fontSize:'10px', color:'#ffaa00', marginTop:'6px' }}>
                ✨ Active effects: {G.activeEffects[curTeam].join(' · ')}
              </div>
            )}

            {/* Execute / Prepare / Cancel / End Turn buttons */}
            <div style={{ display:'flex', gap:'8px', marginTop:'10px', flexWrap:'wrap', justifyContent:'center' }}>
              {step==='confirm' && selAction!=='attack' && (
                <button onClick={handleExecute} style={{ padding:'10px 24px', backgroundColor:'#0a2a0a', color:'#44ff44', border:'2px solid #44ff44', borderRadius:'7px', cursor:'pointer', fontWeight:'bold', fontSize:'13px' }}>
                  ✅ EXECUTE
                </button>
              )}
              {step==='confirm' && selAction==='attack' && (
                <button onClick={handleExecute} style={{ padding:'10px 24px', backgroundColor:'#2a0505', color:'#ff6666', border:'2px solid #ff6666', borderRadius:'7px', cursor:'pointer', fontWeight:'bold', fontSize:'13px' }}>
                  ⚔️ PREPARE ATTACK
                </button>
              )}
              {step!=='selectEntity' && step!=='rollDice' && (
                <button onClick={reset} style={{ padding:'10px 20px', backgroundColor:'#1a0808', color:'#ff6666', border:'1px solid #ff3333', borderRadius:'7px', cursor:'pointer', fontSize:'12px' }}>
                  🔄 Cancel
                </button>
              )}
              {isActive && step!=='rollDice' && (
                <button onClick={handleEndTurn} style={{ padding:'10px 24px', backgroundColor:'#080820', color:'#8888ff', border:'2px solid #8888ff', borderRadius:'7px', cursor:'pointer', fontWeight:'bold', fontSize:'13px' }}>
                  ⏭️ END TURN
                </button>
              )}
            </div>
          </div>

          {/* ATTACK VECTORS */}
          <div style={{ backgroundColor:'#0a0a1a', borderRadius:'12px', border:'1px solid #1a1a30', padding:'14px', textAlign:'center' }}>
            <div style={{ color:'#888', fontSize:'11px', letterSpacing:'3px', marginBottom:'10px' }}>ATTACK VECTORS</div>
            <div style={{ display:'flex', flexDirection:'column', gap:'8px', alignItems:'center' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                <span style={{ color:'#4a9eff', fontSize:'13px', fontWeight:'bold' }}>🇬🇧 UK Govt</span>
                <span style={{ color:'#aa44ff', fontSize:'22px', letterSpacing:'-4px' }}>━━━━▶</span>
                <span style={{ color:'#ff4a4a', fontSize:'13px', fontWeight:'bold' }}>Russia Govt 🇷🇺</span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                <span style={{ color:'#4a9eff', fontSize:'13px', fontWeight:'bold' }}>🇬🇧 UK Govt</span>
                <span style={{ color:'#ff6600', fontSize:'22px', letterSpacing:'-4px' }}>◀━━━━</span>
                <span style={{ color:'#ff4a4a', fontSize:'13px', fontWeight:'bold' }}>Russia Govt 🇷🇺</span>
              </div>
            </div>
            <div style={{ color:'#333', fontSize:'9px', marginTop:'8px' }}>Purple = UK attacks · Orange = Russia attacks</div>
          </div>

          {/* ACTION LOG */}
          <div style={{ backgroundColor:'#080810', borderRadius:'12px', border:'1px solid #1a1a28', padding:'12px', maxHeight:'200px', overflowY:'auto' }}>
            <div style={{ color:'#ffff00', fontSize:'12px', fontWeight:'bold', marginBottom:'8px' }}>📋 Action Log</div>
            {G.log.length===0 && <div style={{ color:'#333', fontSize:'11px' }}>No actions yet...</div>}
            {G.log.slice(-12).reverse().map((e,i)=>(
              <div key={i} style={{ color:i===0?'#ddd':'#555', fontSize:'11px', marginBottom:'3px', paddingBottom:'3px', borderBottom:i===0?'1px solid #222':'none' }}>
                › {e}
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: RUSSIA TEAM ── */}
        <div style={{ width:'240px', flexShrink:0, backgroundColor:'#180808', borderRadius:'12px', border:'2px solid #5a1a1a', padding:'12px', display:'flex', flexDirection:'column', gap:'8px' }}>
          <div style={{ color:'#ff4a4a', fontWeight:'bold', textAlign:'center', fontSize:'15px', borderBottom:'1px solid #5a1a1a', paddingBottom:'8px' }}>
            🇷🇺 RUSSIA TEAM
          </div>
          <EntityCard entity={G.entities['ru_gov']} onClick={handleEntityClick} highlight={hl('ru_gov')} dim={dimmed('ru_gov')} acted={acted('ru_gov')} />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'7px' }}>
            {['bear','trolls','scs','rosatom'].map(id=>(
              <EntityCard key={id} entity={G.entities[id]} onClick={handleEntityClick} highlight={hl(id)} dim={dimmed(id)} acted={acted(id)} />
            ))}
          </div>
          <div style={{ backgroundColor:'#150505', borderRadius:'6px', padding:'6px', fontSize:'9px', color:'#552222', textAlign:'center', lineHeight:1.6 }}>
            Govt distributes to all<br/>entities return to Govt
          </div>
        </div>
      </div>
    </div>
  );
}
