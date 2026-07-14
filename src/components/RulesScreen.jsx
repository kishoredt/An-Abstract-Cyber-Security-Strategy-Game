import { useState } from 'react';

const RULES_SECTIONS = [
  {
    id: 'overview',
    icon: '🔐',
    title: 'Game Overview',
    content: [
      'An Abstract Cyber Security Strategy Game is a turn based strategy game in which two players represent the United Kingdom and Russia, respectively, and play a game of cyber conflict.',
      'Each team has 5 entities to control and they have to safeguard their own, while disabling the opponent\'s entities over 12 turns, corresponding to the months of January to December.',
      'The one team that gets the highest total "Victory Points" at the end of the December wins. If the entity is destroyed then 10 VP is given at once and game is instantly over.',
    ],
  },
  {
    id: 'entities',
    icon: '🏛️',
    title: 'Entities',
    content: [
      '🇬🇧 UK Team: Government (central hub), UK Plc, Electorate, GCHQ ★, EDF Energy',
      '🇷🇺 Russia Team: Government (central hub), Energetic Bear, Online Trolls, SCS ★, Rosenergoatom',
      'Each entity has two stats: 💰 Resource (used to take actions) and ❤️ Vitality (health — if it reaches 0 the game ends).',
      '★ Only GCHQ and SCS can access the Black Market..',
      'At the beginning of every turn, each Government will gain +3 Resource surprise.',
    ],
  },
  {
    id: 'connections',
    icon: '🔗',
    title: 'Connections & Distribution',
    content: [
      'Entities are linked from one to another on an outlined route on the board.',
      'Government can send resources out to each of the 4 connected entities.',
      'Resources for UK Plc and Electorate can only be returned to Government.',
      'GCHQ and EDF Energy can return resources to Government only.',
      'This is the same with Russia\'s structure, "Government distributes out, all others send back".',
      'Distribution is NOT an action (can be done several times per turn)',
    ],
  },
  {
    id: 'turns',
    icon: '📅',
    title: 'Turn Structure',
    content: [
      'The game is played over 12 turns – dates (January through December). One year each team takes one turn per month.',
      'Every turn will be no longer than 3 minutes. When the timers are up, turn automatically ends.',
      'Each turn you can carry out actions on any of your 5 entities.',
      'Each entity (except for distribute) can only take one non-distribute action per turn.',
      'Once all actions are completed, click END TURN to play a separate action for the other players',
    ],
  },
  {
    id: 'actions',
    icon: '⚡',
    title: 'Actions',
    subsections: [
      {
        name: '📦 Distribute',
        desc: 'Transfer 1–5 Resource from one connected entity to another. Can be done multiple times per turn and does not use up the entity\'s action.',
      },
      {
        name: '💚 Revitalise',
        desc: 'Spend Resource to restore Vitality. Costs: +1 VIT = 1 RES, +2 VIT = 3 RES, +3 VIT = 6 RES, +4 VIT = 10 RES. Uses the entity\'s action for the turn.',
      },
      {
        name: '⚔️ Attack',
        desc: 'Locked in January. From February onwards, spend 1–6 Resource and roll the dice. Damage = (Resource Spent − Die Roll) − 1. Positive damage hits the enemy Government. Negative damage backfires on you! Residual damage (÷2) also hits all entities connected to the target.',
      },
      {
        name: '🃏 Black Market',
        desc: 'GCHQ or SCS only. Draw face-down cards from the deck and bid Resource on them. If the opponent does not outbid you by their next turn, you win the item.',
      },
      {
        name: '⏸️ Abstain',
        desc: 'Skip this entity\'s action for the turn.',
      },
    ],
  },
  {
    id: 'combat',
    icon: '🎲',
    title: 'Combat & Dice',
    content: [
      'Only the enemy Government can be attacked directly (along attack vector)',
      'Once you\'ve set up your attack, click the dice to roll',
      'Damage formula: (Resource Spent − Die Roll) − 1',
      'Example: Spend 4, Roll 2 → Damage = (4−2)−1 = 1 damage to enemy Government.',
      'Example: Spend 2, Roll 5 → Damage = (2−5)−1 = −4 (backfire! You lose 4 Vitality).',
      'Increased chance of residual damage: all entities in contact with the target get ½ decrease in damage (rounded down).',
      'Attacking team gets 10 VP and the game is over if any entity reaches 0 Vitality',
    ],
  },
  {
    id: 'blackmarket',
    icon: '🃏',
    title: 'Black Market',
    content: [
      'Only GCHQ (UK) and SCS (Russia) have access to the Black Market.',
      'Cards are face-down — click to draw and reveal them.',
      'Set bid amount and go for it! On the next turn, the opponent is able to outbid you.',
      'If they don\'t outbid, you take it at the beginning of your next turn.',
      'Available items include: Zero-Day Exploit, Disinformation Pack, Resource Cache, Cyber Shield, Botnet, Sleeper Agent, EMP Strike, and Propaganda Wave.',
      'Use collected items from your Inventory at any later turn',
    ],
  },
  {
    id: 'winning',
    icon: '🏆',
    title: 'Winning the Game',
    content: [
      'After Turn 12 (December) or when either Entity reaches 0 Vitality, the game ends.',
      'If an entity is destroyed: the attacking team gets 10 Victory Points right away and the game is finished.',
      'After 12 turns: both teams\' Victory Points are counted and the highest score wins.',
      'If it is equal at the end of December, then players earn a draw',
    ],
  },
];

export function RulesScreen({ onBack, onPlay }) {
  const [activeSection, setActiveSection] = useState('overview');
  const [hovering, setHovering] = useState(null);

  const current = RULES_SECTIONS.find(s => s.id === activeSection);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#070712',
      fontFamily: 'monospace',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* Header */}
      <div style={{
        backgroundColor: '#0e0e20',
        borderBottom: '1px solid #2a2a40',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <button onClick={onBack} style={{
          backgroundColor: 'transparent', color: '#666',
          border: '1px solid #333', borderRadius: '6px',
          padding: '6px 14px', cursor: 'pointer',
          fontSize: '12px', fontFamily: 'monospace',
        }}>
          ← Back
        </button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#ffff00', fontSize: '16px', fontWeight: 'bold', letterSpacing: '2px' }}>
            📖 HOW TO PLAY
          </div>
          <div style={{ color: '#555', fontSize: '10px', marginTop: '2px' }}>
            An Abstract Cyber Security Strategy Game
          </div>
        </div>
        <button
          onClick={onPlay}
          onMouseEnter={() => setHovering('play')}
          onMouseLeave={() => setHovering(null)}
          style={{
            backgroundColor: hovering === 'play' ? '#ffff00' : 'transparent',
            color: hovering === 'play' ? '#000' : '#ffff00',
            border: '2px solid #ffff00',
            borderRadius: '6px', padding: '6px 16px',
            cursor: 'pointer', fontSize: '12px',
            fontFamily: 'monospace', fontWeight: 'bold',
            transition: 'all 0.15s',
          }}>
          PLAY ▶
        </button>
      </div>

      {/* Main Layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Left Nav */}
        <div style={{
          width: '200px', flexShrink: 0,
          backgroundColor: '#0a0a1a',
          borderRight: '1px solid #1a1a30',
          padding: '12px 8px',
          overflowY: 'auto',
        }}>
          {RULES_SECTIONS.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              style={{
                width: '100%', textAlign: 'left',
                padding: '10px 12px', marginBottom: '3px',
                backgroundColor: activeSection === section.id ? '#1a1a3a' : 'transparent',
                color: activeSection === section.id ? '#ffff00' : '#888',
                border: activeSection === section.id ? '1px solid #3a3a60' : '1px solid transparent',
                borderRadius: '6px', cursor: 'pointer',
                fontSize: '11px', fontFamily: 'monospace',
                transition: 'all 0.1s',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}
            >
              <span>{section.icon}</span>
              <span>{section.title}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
          {current && (
            <div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                marginBottom: '20px', paddingBottom: '12px',
                borderBottom: '1px solid #1a1a30',
              }}>
                <span style={{ fontSize: '28px' }}>{current.icon}</span>
                <h2 style={{ color: '#ffff00', fontSize: '20px', margin: 0, letterSpacing: '1px' }}>
                  {current.title}
                </h2>
              </div>

              {/* Regular content paragraphs */}
              {current.content && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {current.content.map((line, i) => (
                    <div key={i} style={{
                      backgroundColor: '#0d0d20',
                      border: '1px solid #1a1a30',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      fontSize: '13px',
                      lineHeight: 1.7,
                      color: '#ccc',
                    }}>
                      {line}
                    </div>
                  ))}
                </div>
              )}

              {/* Subsections (Actions page) */}
              {current.subsections && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {current.subsections.map((sub, i) => (
                    <div key={i} style={{
                      backgroundColor: '#0d0d20',
                      border: '1px solid #1a1a30',
                      borderRadius: '8px',
                      padding: '14px 16px',
                    }}>
                      <div style={{ color: '#ffff00', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>
                        {sub.name}
                      </div>
                      <div style={{ color: '#aaa', fontSize: '12px', lineHeight: 1.7 }}>
                        {sub.desc}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick tip box */}
              <div style={{
                marginTop: '24px',
                backgroundColor: '#0a1520',
                border: '1px solid #1a3a5a',
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '11px',
                color: '#4a9eff',
              }}>
                💡 <strong>Tip:</strong> Use the navigation on the left to jump between sections. Click <strong>PLAY ▶</strong> at the top right when you are ready to start.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom CTA */}
      <div style={{
        backgroundColor: '#0e0e20',
        borderTop: '1px solid #2a2a40',
        padding: '14px 24px',
        display: 'flex',
        justifyContent: 'center',
        gap: '16px',
      }}>
        <button
          onClick={onPlay}
          onMouseEnter={() => setHovering('bottom')}
          onMouseLeave={() => setHovering(null)}
          style={{
            padding: '12px 40px', fontSize: '15px',
            fontFamily: 'monospace', fontWeight: 'bold',
            backgroundColor: hovering === 'bottom' ? '#ffff00' : 'transparent',
            color: hovering === 'bottom' ? '#000' : '#ffff00',
            border: '2px solid #ffff00', borderRadius: '8px',
            cursor: 'pointer', letterSpacing: '2px',
            transition: 'all 0.2s',
            boxShadow: hovering === 'bottom' ? '0 0 25px rgba(255,255,0,0.5)' : 'none',
          }}>
          ▶ I UNDERSTAND — LET'S PLAY
        </button>
      </div>
    </div>
  );
}
