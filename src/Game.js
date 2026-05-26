import { INVALID_MOVE } from 'boardgame.io/core';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const CONNECTIONS = {
  uk_gov:    ['uk_plc', 'electorate', 'gchq', 'edf'],
  uk_plc:    ['uk_gov'],
  electorate:['uk_gov'],
  gchq:      ['uk_gov'],
  edf:       ['uk_gov'],
  ru_gov:    ['trolls', 'bear', 'scs', 'rosatom'],
  trolls:    ['ru_gov'],
  bear:      ['ru_gov'],
  scs:       ['ru_gov'],
  rosatom:   ['ru_gov'],
};

const ATTACK_TARGETS = {
  UK: 'ru_gov',
  Russia: 'uk_gov',
};

const CONNECTED_TO = {
  uk_gov:    ['uk_plc', 'electorate', 'gchq', 'edf'],
  uk_plc:    ['uk_gov'],
  electorate:['uk_gov'],
  gchq:      ['uk_gov'],
  edf:       ['uk_gov'],
  ru_gov:    ['trolls', 'bear', 'scs', 'rosatom'],
  trolls:    ['ru_gov'],
  bear:      ['ru_gov'],
  scs:       ['ru_gov'],
  rosatom:   ['ru_gov'],
};

const REVITALISE_COSTS = { 1: 1, 2: 3, 3: 6, 4: 10 };

const INITIAL_ENTITIES = {
  uk_gov:    { id: 'uk_gov',    name: 'Government',      team: 'UK',     resource: 5, vitality: 5, canBlackMarket: false },
  uk_plc:    { id: 'uk_plc',   name: 'UK Plc',           team: 'UK',     resource: 5, vitality: 5, canBlackMarket: false },
  electorate:{ id: 'electorate',name: 'Electorate',      team: 'UK',     resource: 5, vitality: 5, canBlackMarket: false },
  gchq:      { id: 'gchq',     name: 'GCHQ',             team: 'UK',     resource: 5, vitality: 5, canBlackMarket: true  },
  edf:       { id: 'edf',      name: 'EDF Energy',       team: 'UK',     resource: 5, vitality: 5, canBlackMarket: false },
  ru_gov:    { id: 'ru_gov',   name: 'Government',       team: 'Russia', resource: 5, vitality: 5, canBlackMarket: false },
  trolls:    { id: 'trolls',   name: 'Online Trolls',    team: 'Russia', resource: 5, vitality: 5, canBlackMarket: false },
  bear:      { id: 'bear',     name: 'Energetic Bear',   team: 'Russia', resource: 5, vitality: 5, canBlackMarket: false },
  scs:       { id: 'scs',      name: 'SCS',              team: 'Russia', resource: 5, vitality: 5, canBlackMarket: true  },
  rosatom:   { id: 'rosatom',  name: 'Rosenergoatom',    team: 'Russia', resource: 5, vitality: 5, canBlackMarket: false },
};

const BLACK_MARKET_ITEMS = [
  { id: 'bm1', name: 'Zero-Day Exploit',    description: 'Next attack ignores backfire', effect: 'no_backfire',    currentBid: 0, bidder: null, awarded: null },
  { id: 'bm2', name: 'Disinformation Pack', description: 'Target loses 2 Vitality now', effect: 'instant_damage', currentBid: 0, bidder: null, awarded: null },
  { id: 'bm3', name: 'Resource Cache',      description: 'Gain 5 Resource immediately', effect: 'gain_resource',  currentBid: 0, bidder: null, awarded: null },
  { id: 'bm4', name: 'Cyber Shield',        description: 'Reduce next attack damage by 3', effect: 'shield',      currentBid: 0, bidder: null, awarded: null },
  { id: 'bm5', name: 'Botnet',              description: 'Double next attack damage',   effect: 'double_damage',  currentBid: 0, bidder: null, awarded: null },
];

export const CyberSecurityGame = {
  name: 'CyberSecurityGame',

  setup: () => ({
    entities: JSON.parse(JSON.stringify(INITIAL_ENTITIES)),
    currentTurn: 1,
    vpUK: 0,
    vpRussia: 0,
    gameOver: false,
    winner: null,
    actedThisTurn: [],
    log: [],
    blackMarket: JSON.parse(JSON.stringify(BLACK_MARKET_ITEMS)),
    inventory: { UK: [], Russia: [] },
    activeEffects: { UK: [], Russia: [] },
    lastDieRoll: null,
    lastDamage: null,
    lastAttacker: null,
    lastTarget: null,
    pendingAttack: null, // stores attack params waiting for dice roll
  }),

  turn: {
    onBegin: ({ G, ctx }) => {
      const team = ctx.currentPlayer === '0' ? 'UK' : 'Russia';
      const govId = team === 'UK' ? 'uk_gov' : 'ru_gov';
      G.entities[govId].resource += 3;
      G.actedThisTurn = [];
      G.lastDieRoll = null;
      G.lastDamage = null;
      G.lastAttacker = null;
      G.lastTarget = null;
      G.pendingAttack = null;
      G.log.push(`📅 ${MONTHS[G.currentTurn - 1]}: ${team} Government receives 3 Resource`);

      // Award pending black market items
      G.blackMarket.forEach(item => {
        if (item.awarded === team) {
          G.inventory[team].push({ ...item });
          G.log.push(`🛒 ${team} received: ${item.name}`);
          item.awarded = null;
          item.bidder = null;
          item.currentBid = 0;
        }
      });
    },

    onEnd: ({ G, ctx }) => {
      const team = ctx.currentPlayer === '0' ? 'UK' : 'Russia';
      G.blackMarket.forEach(item => {
        if (item.bidder === team && item.awarded === null) {
          item.awarded = team;
        }
      });
      if (ctx.currentPlayer === '1') {
        G.currentTurn += 1;
      }
    },
  },

  moves: {
    distribute: ({ G, ctx }, fromId, toId, amount) => {
      const team = ctx.currentPlayer === '0' ? 'UK' : 'Russia';
      const from = G.entities[fromId];
      const to = G.entities[toId];

      if (!from || !to) return INVALID_MOVE;
      if (from.team !== team) return INVALID_MOVE;
      if (!CONNECTIONS[fromId]?.includes(toId)) return INVALID_MOVE;
      if (amount < 1 || amount > 5) return INVALID_MOVE;
      if (from.resource < amount) return INVALID_MOVE;

      from.resource -= amount;
      to.resource += amount;
      // NOTE: do NOT add to actedThisTurn for distribute — allows multiple distributes
      G.log.push(`📦 ${from.name} → ${to.name}: ${amount} Resource`);
    },

    revitalise: ({ G, ctx }, entityId, vitalityAmount) => {
      const team = ctx.currentPlayer === '0' ? 'UK' : 'Russia';
      const entity = G.entities[entityId];
      const cost = REVITALISE_COSTS[vitalityAmount];

      if (!entity) return INVALID_MOVE;
      if (entity.team !== team) return INVALID_MOVE;
      if (G.actedThisTurn.includes(entityId)) return INVALID_MOVE;
      if (!cost) return INVALID_MOVE;
      if (entity.resource < cost) return INVALID_MOVE;

      entity.resource -= cost;
      entity.vitality += vitalityAmount;
      G.actedThisTurn.push(entityId);
      G.log.push(`💚 ${entity.name}: -${cost} RES → +${vitalityAmount} VIT`);
    },

    // Stage 1: prepare attack (before dice roll)
    prepareAttack: ({ G, ctx }, attackerId, resourceSpent) => {
      if (G.currentTurn === 1) return INVALID_MOVE;
      const team = ctx.currentPlayer === '0' ? 'UK' : 'Russia';
      const attacker = G.entities[attackerId];

      if (!attacker) return INVALID_MOVE;
      if (attacker.team !== team) return INVALID_MOVE;
      if (G.actedThisTurn.includes(attackerId)) return INVALID_MOVE;
      if (resourceSpent < 1 || resourceSpent > 6) return INVALID_MOVE;
      if (attacker.resource < resourceSpent) return INVALID_MOVE;

      G.pendingAttack = { attackerId, resourceSpent, team };
      G.log.push(`⚔️ ${attacker.name} prepares attack (${resourceSpent} RES) — Roll the dice!`);
    },

    // Stage 2: roll dice and resolve attack
    rollDiceAndAttack: ({ G, ctx }) => {
      if (!G.pendingAttack) return INVALID_MOVE;

      const { attackerId, resourceSpent, team } = G.pendingAttack;
      const attacker = G.entities[attackerId];
      const targetId = ATTACK_TARGETS[team];
      const target = G.entities[targetId];

      const dieRoll = Math.ceil(Math.random() * 6);
      // Formula: Damage = (Resource spent - Die roll) - 1
      const damage = (resourceSpent - dieRoll) - 1;

      G.lastDieRoll = dieRoll;
      G.lastDamage = damage;
      G.lastAttacker = attackerId;
      G.lastTarget = targetId;

      attacker.resource -= resourceSpent;

      const hasDoubleEffect = G.activeEffects[team].includes('double_damage');
      const hasNoBackfire = G.activeEffects[team].includes('no_backfire');
      const enemyTeam = team === 'UK' ? 'Russia' : 'UK';
      const targetHasShield = G.activeEffects[enemyTeam].includes('shield');

      let finalDamage = hasDoubleEffect ? damage * 2 : damage;
      if (targetHasShield && finalDamage > 0) finalDamage = Math.max(0, finalDamage - 3);

      if (finalDamage > 0) {
        target.vitality -= finalDamage;
        CONNECTED_TO[targetId]?.forEach(connId => {
          const residual = Math.floor(finalDamage / 2);
          if (residual > 0) {
            G.entities[connId].vitality -= residual;
            G.log.push(`💥 Residual: ${G.entities[connId].name} -${residual} VIT`);
          }
        });
        G.log.push(`🎲 Roll: ${dieRoll} | Spent: ${resourceSpent} | Damage: ${finalDamage} → ${target.name}`);

        const destroyed = Object.values(G.entities).find(e => e.vitality <= 0);
        if (destroyed) {
          if (team === 'UK') G.vpUK += 10;
          else G.vpRussia += 10;
          G.gameOver = true;
          G.winner = team;
          G.log.push(`💀 ${destroyed.name} destroyed! ${team} +10 VP! GAME OVER!`);
        }
      } else if (!hasNoBackfire && finalDamage < 0) {
        attacker.vitality += finalDamage;
        G.log.push(`🔥 BACKFIRE! Roll:${dieRoll} | Spent:${resourceSpent} | ${attacker.name} -${Math.abs(finalDamage)} VIT`);
      } else {
        G.log.push(`💨 MISS! Roll:${dieRoll} | Spent:${resourceSpent} | No damage`);
      }

      G.activeEffects[team] = G.activeEffects[team].filter(e => e !== 'double_damage' && e !== 'no_backfire');
      G.activeEffects[enemyTeam] = G.activeEffects[enemyTeam].filter(e => e !== 'shield');
      G.actedThisTurn.push(attackerId);
      G.pendingAttack = null;
    },

    blackMarketBid: ({ G, ctx }, entityId, itemId, bidAmount) => {
      const team = ctx.currentPlayer === '0' ? 'UK' : 'Russia';
      const entity = G.entities[entityId];
      if (!entity || entity.team !== team || !entity.canBlackMarket) return INVALID_MOVE;
      if (G.actedThisTurn.includes(entityId)) return INVALID_MOVE;

      const item = G.blackMarket.find(i => i.id === itemId);
      if (!item || bidAmount <= item.currentBid || entity.resource < bidAmount) return INVALID_MOVE;

      if (item.bidder && item.bidder !== team) {
        const prevGovId = item.bidder === 'UK' ? 'uk_gov' : 'ru_gov';
        G.entities[prevGovId].resource += item.currentBid;
      }

      entity.resource -= bidAmount;
      item.currentBid = bidAmount;
      item.bidder = team;
      item.awarded = null;
      G.actedThisTurn.push(entityId);
      G.log.push(`🛒 ${team} bid ${bidAmount} on ${item.name}`);
    },

    useItem: ({ G, ctx }, itemId) => {
      const team = ctx.currentPlayer === '0' ? 'UK' : 'Russia';
      const itemIndex = G.inventory[team].findIndex(i => i.id === itemId);
      if (itemIndex === -1) return INVALID_MOVE;

      const item = G.inventory[team][itemIndex];
      if (item.effect === 'gain_resource') {
        const govId = team === 'UK' ? 'uk_gov' : 'ru_gov';
        G.entities[govId].resource += 5;
        G.log.push(`✨ ${team} used ${item.name}: +5 Resource`);
      } else if (item.effect === 'instant_damage') {
        const targetId = ATTACK_TARGETS[team];
        G.entities[targetId].vitality -= 2;
        G.log.push(`✨ ${team} used ${item.name}: Enemy -2 VIT`);
      } else {
        G.activeEffects[team].push(item.effect);
        G.log.push(`✨ ${team} activated ${item.name}`);
      }
      G.inventory[team].splice(itemIndex, 1);
    },

    abstain: ({ G, ctx }, entityId) => {
      const team = ctx.currentPlayer === '0' ? 'UK' : 'Russia';
      const entity = G.entities[entityId];
      if (!entity || entity.team !== team) return INVALID_MOVE;
      if (G.actedThisTurn.includes(entityId)) return INVALID_MOVE;
      G.actedThisTurn.push(entityId);
      G.log.push(`⏸️ ${entity.name} abstained`);
    },
  },

  endIf: ({ G }) => {
    if (G.gameOver) return { winner: G.winner };
    if (G.currentTurn > 12) {
      const winner = G.vpUK > G.vpRussia ? 'UK' : G.vpRussia > G.vpUK ? 'Russia' : 'Draw';
      return { winner };
    }
  },
};
