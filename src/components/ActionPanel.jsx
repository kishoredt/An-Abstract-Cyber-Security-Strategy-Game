import { REVITALISE_COSTS } from '../constants/gameData';
import { Dice } from './Dice';
import { BlackMarket } from './BlackMarket';

export function ActionPanel({
  step, selAction, selEntData, tgtEntData,
  amount, setAmount,
  onAction, onExecute, onCancel, onEndTurn,
  isActive, currentTurn,
  onDiceRoll, lastDieRoll, lastDamage,
  blackMarket, revealedBM, selBMItem, bidAmt,
  onRevealBM, onSelectBM, onBidChange,
  inventory, onUseItem,
  activeEffects,
}) {
  const btnS = (col, dis) => ({
    padding: '8px 14px', backgroundColor: '#111',
    color: dis ? '#444' : col,
    border: `1px solid ${dis ? '#333' : col}`,
    borderRadius: '6px', cursor: dis ? 'not-allowed' : 'pointer', fontSize: '12px',
  });

  return (
    <div style={{
      backgroundColor: '#0a0a1e', borderRadius: '12px',
      border: '1px solid #2a2a50', padding: '14px',
    }}>
      <div style={{
        color: '#ffff00', textAlign: 'center', fontWeight: 'bold', fontSize: '14px',
        borderBottom: '1px solid #2a2a40', paddingBottom: '8px', marginBottom: '10px',
      }}>
        ⚡ ACTION PANEL
      </div>

      {/* Selected entity info */}
      {selEntData && (
        <div style={{
          backgroundColor: '#1a1a05', border: '1px solid #555500',
          borderRadius: '6px', padding: '7px', fontSize: '11px',
          textAlign: 'center', marginBottom: '8px',
        }}>
          <div style={{ color: '#ffff00', fontWeight: 'bold', fontSize: '13px' }}>{selEntData.name}</div>
          <span style={{ color: '#ffaa44' }}>💰 {selEntData.resource}</span>{'  '}
          <span style={{ color: '#ff5555' }}>❤️ {selEntData.vitality}</span>
        </div>
      )}

      {/* Action buttons */}
      {step === 'selectAction' && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '8px' }}>
          {[
            ['distribute', '📦 Distribute', '#4a9eff', false],
            ['revitalise', '💚 Revitalise', '#4aff4a', false],
            ['attack', currentTurn === 1 ? '⚔️ Attack 🔒' : '⚔️ Attack', '#ff4a4a', currentTurn === 1],
            ...(selEntData?.canBlackMarket ? [['blackmarket', '🃏 Black Market', '#aa77ff', false]] : []),
            ['abstain', '⏸️ Abstain', '#888888', false],
          ].map(([act, label, col, dis]) => (
            <button key={act} onClick={() => !dis && onAction(act)} style={btnS(col, dis)}>
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Amount slider */}
      {['selectTarget', 'confirm'].includes(step) && selAction && !['abstain', 'blackmarket'].includes(selAction) && (
        <div style={{ backgroundColor: '#111', borderRadius: '6px', padding: '8px', marginBottom: '8px' }}>
          <div style={{ color: '#aaa', fontSize: '11px', marginBottom: '4px' }}>
            {selAction === 'revitalise'
              ? `+${amount} Vitality → Cost: ${REVITALISE_COSTS[amount]} 💰`
              : `Resource to spend: ${amount} 💰`}
          </div>
          <input
            type="range" min="1"
            max={selAction === 'revitalise' ? '4' : '6'}
            value={amount}
            onChange={e => setAmount(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#ffff00' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555', fontSize: '9px' }}>
            <span>1</span><span>{selAction === 'revitalise' ? '4' : '6'}</span>
          </div>
        </div>
      )}

      {/* Target info */}
      {tgtEntData && step !== 'rollDice' && (
        <div style={{
          backgroundColor: '#002200', border: '1px solid #33aa33',
          borderRadius: '6px', padding: '6px', fontSize: '11px',
          color: '#44ff44', textAlign: 'center', marginBottom: '8px',
        }}>
          🎯 Target: <strong>{tgtEntData.name}</strong>
        </div>
      )}

      {/* Black Market */}
      {step === 'confirm' && selAction === 'blackmarket' && (
        <BlackMarket
          blackMarket={blackMarket}
          revealedCards={revealedBM}
          selectedItem={selBMItem}
          bidAmount={bidAmt}
          onReveal={onRevealBM}
          onSelect={onSelectBM}
          onBidChange={onBidChange}
        />
      )}

      {/* Dice */}
      {(step === 'rollDice' || (step === 'confirm' && selAction === 'attack')) && (
        <div style={{
          backgroundColor: '#150505', border: '2px solid #882222',
          borderRadius: '10px', padding: '12px', textAlign: 'center', marginBottom: '8px',
        }}>
          <div style={{ color: '#ff6666', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>
            ⚔️ COMBAT — Roll the Dice!
          </div>
          <Dice
            onRoll={step === 'rollDice' ? onDiceRoll : () => {}}
            disabled={step !== 'rollDice'}
            result={step === 'rollDice' ? null : lastDieRoll}
          />
          {lastDieRoll !== null && lastDamage !== null && step !== 'rollDice' && (
            <div style={{
              color: lastDamage < 0 ? '#ff4a4a' : lastDamage === 0 ? '#ffff00' : '#4aff4a',
              fontWeight: 'bold', fontSize: '14px', marginTop: '5px',
            }}>
              {lastDamage < 0
                ? `🔥 BACKFIRE! ${lastDamage} VIT`
                : lastDamage === 0
                  ? '💨 MISS! No damage'
                  : `💥 ${lastDamage} DAMAGE!`}
            </div>
          )}
        </div>
      )}

      {/* Inventory */}
      {inventory.length > 0 && (
        <div style={{ marginBottom: '8px' }}>
          <div style={{ color: '#aa77ff', fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>
            🎒 Your Inventory:
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {inventory.map(item => (
              <div key={item.id} onClick={() => onUseItem(item.id)} style={{
                padding: '5px 8px', backgroundColor: '#15082a',
                border: '1px solid #8855cc', borderRadius: '5px',
                cursor: 'pointer', color: '#cc99ff', fontSize: '11px',
              }}>
                {item.icon} {item.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active effects */}
      {activeEffects?.length > 0 && (
        <div style={{
          backgroundColor: '#1a1505', border: '1px solid #554400',
          borderRadius: '5px', padding: '5px', fontSize: '10px',
          color: '#ffaa00', marginBottom: '8px',
        }}>
          ✨ Active: {activeEffects.join(' · ')}
        </div>
      )}

      {/* Buttons row */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {step === 'confirm' && selAction !== 'attack' && (
          <button onClick={onExecute} style={{
            padding: '10px 24px', backgroundColor: '#0a2a0a', color: '#44ff44',
            border: '2px solid #44ff44', borderRadius: '7px',
            cursor: 'pointer', fontWeight: 'bold', fontSize: '13px',
          }}>✅ EXECUTE</button>
        )}
        {step === 'confirm' && selAction === 'attack' && (
          <button onClick={onExecute} style={{
            padding: '10px 24px', backgroundColor: '#2a0505', color: '#ff6666',
            border: '2px solid #ff6666', borderRadius: '7px',
            cursor: 'pointer', fontWeight: 'bold', fontSize: '13px',
          }}>⚔️ PREPARE ATTACK</button>
        )}
        {step !== 'selectEntity' && step !== 'rollDice' && (
          <button onClick={onCancel} style={{
            padding: '10px 20px', backgroundColor: '#1a0808', color: '#ff6666',
            border: '1px solid #ff3333', borderRadius: '7px',
            cursor: 'pointer', fontSize: '12px',
          }}>🔄 Cancel</button>
        )}
        {isActive && step !== 'rollDice' && (
          <button onClick={onEndTurn} style={{
            padding: '10px 24px', backgroundColor: '#080820', color: '#8888ff',
            border: '2px solid #8888ff', borderRadius: '7px',
            cursor: 'pointer', fontWeight: 'bold', fontSize: '13px',
          }}>⏭️ END TURN</button>
        )}
      </div>
    </div>
  );
}
