import { useState, useEffect, useRef } from 'react';
import { MONTHS } from '../constants/gameData';
import { playSound } from '../utils/sounds';
import { Timer } from './Timer';
import { EntityCard } from './EntityCard';
import { ActionPanel } from './ActionPanel';
import { AttackVectors } from './AttackVectors';
import { ActionLog } from './ActionLog';
import { GameOver } from './GameOver';
import { RulesModal } from './RulesModal';

export function Board({ G, ctx, moves, isActive, events, playerID }) {
  const [step, setStep] = useState('selectEntity');
  const [selEnt, setSelEnt] = useState(null);
  const [selAction, setSelAction] = useState(null);
  const [targetEnt, setTargetEnt] = useState(null);
  const [amount, setAmount] = useState(1);
  const [revealedBM, setRevealedBM] = useState([]);
  const [selBMItem, setSelBMItem] = useState(null);
  const [bidAmt, setBidAmt] = useState(1);
  const [timerKey, setTimerKey] = useState(0);
  const [showRules, setShowRules] = useState(false);
  const goSound = useRef(false);

  const curTeam = ctx.currentPlayer === '0' ? 'UK' : 'Russia';
  const month = MONTHS[(G.currentTurn - 1) % 12];
  const myInv = G.inventory?.[curTeam] || [];
  const atkTarget = curTeam === 'UK' ? 'ru_gov' : 'uk_gov';
  const isBotTurn = playerID !== undefined && playerID !== ctx.currentPlayer;

  useEffect(() => {
    if (G.gameOver && !goSound.current) {
      goSound.current = true;
      setTimeout(() => playSound('gameover'), 400);
    }
  }, [G.gameOver]);

  useEffect(() => {
    setTimerKey(k => k + 1);
    setRevealedBM([]);
    setSelBMItem(null);
    reset();
  }, [ctx.currentPlayer, G.currentTurn]);

  const reset = () => {
    setStep('selectEntity'); setSelEnt(null); setSelAction(null);
    setTargetEnt(null); setAmount(1); setSelBMItem(null); setBidAmt(1);
  };

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
    if (selAction === 'distribute') {
      if (!targetEnt) { alert('Select target!'); return; }
      moves.distribute(selEnt, targetEnt, amount); reset();
    } else if (selAction === 'revitalise') {
      moves.revitalise(selEnt, amount); reset();
    } else if (selAction === 'attack') {
      moves.prepareAttack(selEnt, amount); setStep('rollDice');
    } else if (selAction === 'abstain') {
      moves.abstain(selEnt); reset();
    } else if (selAction === 'blackmarket' && selBMItem) {
      moves.blackMarketBid(selEnt, selBMItem, bidAmt); reset();
    }
  };

  const handleDiceRoll = () => { moves.rollDiceAndAttack(); setTimeout(reset, 2000); };
  const handleEndTurn = () => { playSound('endturn'); reset(); setTimerKey(k => k + 1); events.endTurn(); };
  const handleTimerExpire = () => { if (isActive) { reset(); events.endTurn(); } };

  const hl = (id) => {
    if (id === selEnt) return 'selected';
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

  if (G.gameOver) {
    return <GameOver winner={G.winner} vpUK={G.vpUK} vpRussia={G.vpRussia} log={G.log} />;
  }

  const selEntData = selEnt ? G.entities[selEnt] : null;
  const tgtEntData = targetEnt ? G.entities[targetEnt] : null;

  return (
    <div style={{ backgroundColor: '#070712', minHeight: '100vh', fontFamily: 'monospace', color: 'white', display: 'flex', flexDirection: 'column', position: 'relative' }}>

      {/* Rules Modal */}
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}

      {/* AI Thinking Overlay */}
      {isBotTurn && (
        <div style={{
          position: 'fixed', top: '70px', left: '50%', transform: 'translateX(-50%)',
          backgroundColor: '#1a0a00', border: '2px solid #ff8800', borderRadius: '10px',
          padding: '10px 24px', zIndex: 999, display: 'flex', alignItems: 'center', gap: '10px',
          boxShadow: '0 0 20px rgba(255,136,0,0.5)',
        }}>
          <span style={{ fontSize: '20px', animation: 'spin 1.2s linear infinite', display: 'inline-block' }}>🤖</span>
          <span style={{ color: '#ff8800', fontSize: '13px', fontWeight: 'bold' }}>RUSSIA AI IS THINKING...</span>
        </div>
      )}

      {/* TOP BAR */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: '#0e0e20', borderBottom: '1px solid #1a1a30', padding: '8px 20px',
      }}>
        <div style={{ color: '#4a9eff', fontSize: '18px', fontWeight: 'bold' }}>🇬🇧 {G.vpUK} VP</div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#ffff00', fontSize: '13px', marginBottom: '2px' }}>📅 {month} · Turn {G.currentTurn}/12</div>
          <Timer isActive={isActive} onExpire={handleTimerExpire} resetKey={timerKey} />
          <div style={{ fontSize: '11px', color: curTeam === 'UK' ? '#4a9eff' : '#ff4a4a', fontWeight: 'bold', marginTop: '2px' }}>
            {isActive ? `▶ YOUR TURN (${curTeam})` : isBotTurn ? `🤖 AI Playing (${curTeam})` : `⏳ ${curTeam}'s Turn`}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* ? Rules Button */}
          <button
            onClick={() => setShowRules(true)}
            title="How to Play"
            style={{
              width: '32px', height: '32px',
              backgroundColor: '#1a1a3a',
              color: '#4a9eff',
              border: '2px solid #4a9eff',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '14px', fontWeight: 'bold',
              fontFamily: 'monospace',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
              flexShrink: 0,
            }}
          >
            ?
          </button>
          <div style={{ color: '#ff4a4a', fontSize: '18px', fontWeight: 'bold' }}>{G.vpRussia} VP 🇷🇺</div>
        </div>
      </div>

      {/* INSTRUCTION BANNER */}
      {isActive && step !== 'rollDice' && (
        <div style={{ backgroundColor: '#131300', borderBottom: '1px solid #333300', padding: '5px', textAlign: 'center', color: '#ffff00', fontSize: '11px' }}>
          {step === 'selectEntity' && `👆 Select a ${curTeam} entity to act · or END TURN`}
          {step === 'selectAction' && `⚡ Choose action for: ${selEntData?.name}`}
          {step === 'selectTarget' && selAction === 'distribute' && '📦 Click a connected entity to send resources to'}
          {step === 'selectTarget' && selAction === 'attack' && '⚔️ Target auto-set to enemy Government'}
          {step === 'confirm' && selAction === 'blackmarket' && '🃏 Draw a card from the deck, then set your bid'}
          {step === 'confirm' && selAction !== 'blackmarket' && '✅ Set amount and click EXECUTE'}
        </div>
      )}

      {/* 3-COLUMN LAYOUT */}
      <div style={{ display: 'flex', flex: 1, padding: '14px', gap: '14px', alignItems: 'flex-start', opacity: isBotTurn ? 0.6 : 1, transition: 'opacity 0.3s' }}>

        {/* UK TEAM */}
        <div style={{ width: '240px', flexShrink: 0, backgroundColor: '#080e1a', borderRadius: '12px', border: '2px solid #1a3a5a', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ color: '#4a9eff', fontWeight: 'bold', textAlign: 'center', fontSize: '15px', borderBottom: '1px solid #1a3a5a', paddingBottom: '8px' }}>
            🇬🇧 UK TEAM
          </div>
          <EntityCard entity={G.entities['uk_gov']} onClick={handleEntityClick} highlight={hl('uk_gov')} dim={dimmed('uk_gov')} acted={acted('uk_gov')} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px' }}>
            {['uk_plc', 'electorate', 'gchq', 'edf'].map(id => (
              <EntityCard key={id} entity={G.entities[id]} onClick={handleEntityClick} highlight={hl(id)} dim={dimmed(id)} acted={acted(id)} />
            ))}
          </div>
          <div style={{ backgroundColor: '#0a1525', borderRadius: '6px', padding: '6px', fontSize: '9px', color: '#2a5580', textAlign: 'center', lineHeight: 1.6 }}>
            Govt distributes to all<br />UK Plc &amp; Electorate → Govt
          </div>
        </div>

        {/* CENTRE COLUMN */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', minWidth: 0 }}>
          <ActionPanel
            step={step} selAction={selAction} selEntData={selEntData} tgtEntData={tgtEntData}
            amount={amount} setAmount={setAmount}
            onAction={handleAction} onExecute={handleExecute} onCancel={reset} onEndTurn={handleEndTurn}
            isActive={isActive} currentTurn={G.currentTurn}
            onDiceRoll={handleDiceRoll} lastDieRoll={G.lastDieRoll} lastDamage={G.lastDamage}
            blackMarket={G.blackMarket} revealedBM={revealedBM} selBMItem={selBMItem} bidAmt={bidAmt}
            onRevealBM={id => setRevealedBM(p => [...p, id])}
            onSelectBM={id => setSelBMItem(id)}
            onBidChange={v => setBidAmt(v)}
            inventory={myInv} onUseItem={id => moves.useItem(id)}
            activeEffects={G.activeEffects?.[curTeam] || []}
          />
          <AttackVectors />
          <ActionLog log={G.log} />
        </div>

        {/* RUSSIA TEAM */}
        <div style={{ width: '240px', flexShrink: 0, backgroundColor: '#180808', borderRadius: '12px', border: '2px solid #5a1a1a', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ color: '#ff4a4a', fontWeight: 'bold', textAlign: 'center', fontSize: '15px', borderBottom: '1px solid #5a1a1a', paddingBottom: '8px' }}>
            🇷🇺 RUSSIA TEAM {isBotTurn && <span style={{ fontSize: '11px' }}>🤖</span>}
          </div>
          <EntityCard entity={G.entities['ru_gov']} onClick={handleEntityClick} highlight={hl('ru_gov')} dim={dimmed('ru_gov')} acted={acted('ru_gov')} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px' }}>
            {['bear', 'trolls', 'scs', 'rosatom'].map(id => (
              <EntityCard key={id} entity={G.entities[id]} onClick={handleEntityClick} highlight={hl(id)} dim={dimmed(id)} acted={acted(id)} />
            ))}
          </div>
          <div style={{ backgroundColor: '#150505', borderRadius: '6px', padding: '6px', fontSize: '9px', color: '#552222', textAlign: 'center', lineHeight: 1.6 }}>
            Govt distributes to all<br />entities return to Govt
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}
