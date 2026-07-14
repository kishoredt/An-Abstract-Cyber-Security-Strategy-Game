import { useState } from 'react';

// Quick reference rules
const QUICK_RULES = [
  {
    icon: '⚡',
    title: 'Actions',
    items: [
      '📦 Distribute — Transfer 1–5 RES to connected entity (unlimited per turn)',
      '💚 Revitalise — Spend RES to gain VIT (1=1, 2=3, 3=6, 4=10)',
      '⚔️ Attack — Locked in January. Spend 1–6 RES, roll dice',
      '🃏 Black Market — GCHQ/SCS only. Draw & bid on cards',
      '⏸️ Abstain — Skip this entity\'s action',
    ],
  },
  {
    icon: '🎲',
    title: 'Combat Formula',
    items: [
      'Damage = (Resource Spent − Die Roll) − 1',
      'Positive damage → hits enemy Government',
      'Negative damage → backfires on YOU',
      'Residual damage → ½ hits all connected entities',
      'Entity reaches 0 VIT → 10 VP + instant game over',
    ],
  },
  {
    icon: '🔗',
    title: 'Connections',
    items: [
      'UK: Govt → UK Plc, Electorate, GCHQ, EDF',
      'UK Plc & Electorate → Govt (one way back)',
      'Russia: Govt → Bear, Trolls, SCS, Rosatom',
      'All Russia entities → Govt (one way back)',
      'Attack vector: UK Govt ↔ Russia Govt only',
    ],
  },
  {
    icon: '🏆',
    title: 'Winning',
    items: [
      'Game lasts 12 turns (Jan–Dec)',
      'Each Govt receives +3 RES at turn start',
      'Destroy an entity → 10 VP + game ends now',
      'After 12 turns → highest VP wins',
      'Draw possible if VP are equal',
    ],
  },
];

export function RulesModal({ onClose }) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(0,0,0,0.75)',
          zIndex: 998,
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 999,
        width: '560px',
        maxWidth: '95vw',
        maxHeight: '85vh',
        backgroundColor: '#0d0d20',
        border: '2px solid #2a2a50',
        borderRadius: '14px',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'monospace',
        boxShadow: '0 0 40px rgba(74,158,255,0.2)',
        overflow: 'hidden',
      }}>

        {/* Modal Header */}
        <div style={{
          backgroundColor: '#0a0a1a',
          borderBottom: '1px solid #1a1a30',
          padding: '14px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '18px' }}>📖</span>
            <span style={{ color: '#ffff00', fontWeight: 'bold', fontSize: '14px', letterSpacing: '1px' }}>
              QUICK RULES REFERENCE
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#1a0808', color: '#ff6666',
              border: '1px solid #ff3333', borderRadius: '6px',
              padding: '4px 12px', cursor: 'pointer',
              fontSize: '12px', fontFamily: 'monospace',
            }}
          >
            ✕ Close
          </button>
        </div>

        {/* Tab Bar */}
        <div style={{
          display: 'flex', gap: '4px', padding: '10px 14px',
          backgroundColor: '#0a0a1a',
          borderBottom: '1px solid #1a1a30',
          flexShrink: 0,
          flexWrap: 'wrap',
        }}>
          {QUICK_RULES.map((section, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              style={{
                padding: '6px 12px',
                backgroundColor: activeTab === i ? '#1a1a3a' : 'transparent',
                color: activeTab === i ? '#ffff00' : '#666',
                border: activeTab === i ? '1px solid #3a3a60' : '1px solid transparent',
                borderRadius: '5px', cursor: 'pointer',
                fontSize: '11px', fontFamily: 'monospace',
                transition: 'all 0.1s',
                display: 'flex', alignItems: 'center', gap: '5px',
              }}
            >
              <span>{section.icon}</span>
              <span>{section.title}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{
          padding: '16px 20px',
          overflowY: 'auto',
          flex: 1,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            marginBottom: '14px',
          }}>
            <span style={{ fontSize: '20px' }}>{QUICK_RULES[activeTab].icon}</span>
            <span style={{ color: '#ffff00', fontSize: '14px', fontWeight: 'bold' }}>
              {QUICK_RULES[activeTab].title}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {QUICK_RULES[activeTab].items.map((item, i) => (
              <div key={i} style={{
                backgroundColor: '#111',
                border: '1px solid #1a1a28',
                borderRadius: '6px',
                padding: '10px 14px',
                fontSize: '12px',
                color: '#ccc',
                lineHeight: 1.6,
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
              }}>
                <span style={{ color: '#4a9eff', flexShrink: 0 }}>›</span>
                <span>{item}</span>
              </div>
            ))}
          </div>

          {/* Damage formula highlight */}
          {activeTab === 1 && (
            <div style={{
              marginTop: '14px',
              backgroundColor: '#150505',
              border: '2px solid #882222',
              borderRadius: '8px',
              padding: '12px 16px',
              textAlign: 'center',
            }}>
              <div style={{ color: '#ff6666', fontSize: '11px', marginBottom: '6px' }}>
                DAMAGE FORMULA
              </div>
              <div style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold', letterSpacing: '1px' }}>
                (RES Spent − Die Roll) − 1
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px', fontSize: '11px' }}>
                <span style={{ color: '#4aff4a' }}>✅ Positive = Damage dealt</span>
                <span style={{ color: '#ff4a4a' }}>🔥 Negative = Backfire!</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          backgroundColor: '#0a0a1a',
          borderTop: '1px solid #1a1a30',
          padding: '10px 20px',
          fontSize: '10px',
          color: '#444',
          textAlign: 'center',
          flexShrink: 0,
        }}>
          Click outside or press ✕ to close and return to your game
        </div>
      </div>
    </>
  );
}
