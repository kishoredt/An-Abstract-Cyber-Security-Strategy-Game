import { MCTSBot } from 'boardgame.io/ai';

/**
 * AI Bot configuration for single-player mode (Russia team).
 * Uses Monte Carlo Tree Search (MCTS) to pick reasonable moves.
 *
 * enumerate() returns the simple AiEnumerate shape:
 *   { move: 'moveName', args: [...] }  or  { event: 'eventName', args: [...] }
 *
 * IMPORTANT: boardgame.io's LocalMaster instantiates bots itself via
 * `new bot({ game, enumerate, seed })` — it does NOT pass through any
 * extra options like `iterations`. To control difficulty we must create
 * a subclass that hard-codes the desired settings in its own constructor.
 */

const CONNECTIONS = {
  uk_gov: ['uk_plc', 'electorate', 'gchq', 'edf'],
  ru_gov: ['trolls', 'bear', 'scs', 'rosatom'],
  uk_plc: ['uk_gov'], electorate: ['uk_gov'], gchq: ['uk_gov'], edf: ['uk_gov'],
  trolls: ['ru_gov'], bear: ['ru_gov'], scs: ['ru_gov'], rosatom: ['ru_gov'],
};

/**
 * Returns the list of legal moves the AI (Russia team) can choose from
 * at the current game state. This is shared by all difficulty levels.
 */
export function enumerate(G, ctx, playerID) {
  const moves = [];
  const team = playerID === '0' ? 'UK' : 'Russia';

  // If there's a pending attack, the ONLY valid move is to roll the dice.
  // This guarantees the AI always follows through on its own attacks.
  if (G.pendingAttack) {
    moves.push({ move: 'rollDiceAndAttack', args: [] });
    return moves;
  }

  const myEntities = Object.values(G.entities).filter(e => e.team === team);

  myEntities.forEach(entity => {
    const targets = CONNECTIONS[entity.id] || [];
    const hasActed = G.actedThisTurn.includes(entity.id);

    // Distribute — doesn't block the entity from acting again
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

    // Attack (not allowed in January, entity must not have acted yet)
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

    // Abstain — always a valid fallback
    if (!hasActed) {
      moves.push({ move: 'abstain', args: [entity.id] });
    }
  });

  // Always allow ending the turn as a fallback action
  moves.push({ event: 'endTurn', args: [] });

  return moves;
}

/**
 * Factory that returns a BOT CLASS (not an instance) pre-configured with
 * the given difficulty settings. boardgame.io's LocalMaster will call
 * `new BotClass({ game, enumerate, seed })` internally, and our subclass's
 * constructor injects the extra iterations/playoutDepth options before
 * calling super().
 */
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
