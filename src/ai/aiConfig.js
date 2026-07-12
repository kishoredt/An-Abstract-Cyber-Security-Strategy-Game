import { MCTSBot } from 'boardgame.io/ai';

const CONNECTIONS = {
  uk_gov: ['uk_plc', 'electorate', 'gchq', 'edf'],
  ru_gov: ['trolls', 'bear', 'scs', 'rosatom'],
  uk_plc: ['uk_gov'], electorate: ['uk_gov'], gchq: ['uk_gov'], edf: ['uk_gov'],
  trolls: ['ru_gov'], bear: ['ru_gov'], scs: ['ru_gov'], rosatom: ['ru_gov'],
};


export function enumerate(G, ctx, playerID) {
  const moves = [];
  const team = playerID === '0' ? 'UK' : 'Russia';

  if (G.pendingAttack) {
    moves.push({ move: 'rollDiceAndAttack', args: [] });
    return moves;
  }

  const myEntities = Object.values(G.entities).filter(e => e.team === team);

  myEntities.forEach(entity => {
    const targets = CONNECTIONS[entity.id] || [];
    const hasActed = G.actedThisTurn.includes(entity.id);

    // Distribute
    targets.forEach(targetId => {
      if (entity.resource >= 2) {
        const amt = Math.min(3, entity.resource);
        moves.push({ move: 'distribute', args: [entity.id, targetId, amt] });
      }
    });

    // Revitalise
    if (!hasActed) {
      if (entity.resource >= 1) moves.push({ move: 'revitalise', args: [entity.id, 1] });
      if (entity.resource >= 3) moves.push({ move: 'revitalise', args: [entity.id, 2] });
      if (entity.resource >= 6) moves.push({ move: 'revitalise', args: [entity.id, 3] });
    }

    // Attack
    if (G.currentTurn > 1 && !hasActed && entity.resource >= 2) {
      const spend = Math.min(4, entity.resource);
      moves.push({ move: 'prepareAttack', args: [entity.id, spend] });
    }

    // Black market bid (GCHQ / SCS only)
    if (entity.canBlackMarket && !hasActed) {
      G.blackMarket.forEach(item => {
        const minNeeded = Math.max(item.minBid, item.currentBid + 1);
        if (entity.resource >= minNeeded) {
          moves.push({ move: 'blackMarketBid', args: [entity.id, item.id, minNeeded] });
        }
      });
    }

    // Abstain
    if (!hasActed) {
      moves.push({ move: 'abstain', args: [entity.id] });
    }
  });

  // Always allow ending the turn as a fallback action
  moves.push({ event: 'endTurn', args: [] });

  return moves;
}

export function makeDifficultyBot(iterations, playoutDepth = 6) {
  return class DifficultyBot extends MCTSBot {
    constructor({ game, enumerate: enumerateFn, seed }) {
      super({ game, enumerate: enumerateFn, seed, iterations, playoutDepth });
    }
  };
}

// Pre-built difficulty presets
export const AI_DIFFICULTIES = {
  easy:   { label: 'EASY',   icon: '🟢', iterations: 40,  desc: 'Quick decisions, makes mistakes' },
  medium: { label: 'MEDIUM', icon: '🟡', iterations: 150, desc: 'Balanced strategic play' },
  hard:   { label: 'HARD',   icon: '🔴', iterations: 400, desc: 'Deep analysis, tough opponent' },
};
