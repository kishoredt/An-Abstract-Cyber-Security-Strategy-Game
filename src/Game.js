import { INVALID_MOVE } from 'boardgame.io/core';
import { enumerate } from './ai/aiConfig';

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
  { id: 'bm1', name: 'Zero-Day Exploit',    icon: '💣', description: 'Your next attack cannot backfire',           effect: 'no_backfire',    minBid: 3, currentBid: 0, bidder: null, awarded: null },
  { id: 'bm2', name: 'Disinformation Pack', icon: '📰', description: 'Enemy Government loses 2 Vitality now',     effect: 'instant_damage', minBid: 2, currentBid: 0, bidder: null, awarded: null },
  { id: 'bm3', name: 'Resource Cache',      icon: '💰', description: 'Your Government gains 5 Resource now',      effect: 'gain_resource',  minBid: 2, currentBid: 0, bidder: null, awarded: null },
  { id: 'bm4', name: 'Cyber Shield',        icon: '🛡️', description: 'Reduce next attack against you by 3',       effect: 'shield',         minBid: 3, currentBid: 0, bidder: null, awarded: null },
  { id: 'bm5', name: 'Botnet',              icon: '🤖', description: 'Your next attack deals double damage',       effect: 'double_damage',  minBid: 4, currentBid: 0, bidder: null, awarded: null },
  { id: 'bm6', name: 'Sleeper Agent',       icon: '🕵️', description: 'Steal 3 Resource from enemy Government',    effect: 'steal_resource', minBid: 3, currentBid: 0, bidder: null, awarded: null },
  { id: 'bm7', name: 'EMP Strike',          icon: '⚡', description: 'Enemy Government loses all Resource',        effect: 'emp',            minBid: 4, currentBid: 0, bidder: null, awarded: null },
  { id: 'bm8', name: 'Propaganda Wave',     icon: '📢', description: 'Your people entity gains 2 Vitality',       effect: 'propaganda',     minBid: 2, currentBid: 0, bidder: null, awarded: null },
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
    pendingAttack: null,
  }),

  turn: {
    onBegin: ({ G, ctx }) => {
      const team = ctx.currentPlayer === '0' ? 'UK' : 'Russia';
      const govId = team === 'UK' ? 'uk_gov' : 'ru_gov';
      G.entities[govId].resource += 3;
      G.actedThisTurn = [];
      G.lastDieRoll = null;
      G.lastDamage = null;
      G.pendingAttack = null;
      G.log.push(`📅 ${MONTHS[G.currentTurn - 1]}: ${team} Government +3 Resource`);

      // Award won black market items
      G.blackMarket.forEach(item => {
        if (item.awarded === team) {
          G.inventory[team].push({ ...item });
          G.log.push(`🃏 ${team} collected: ${item.icon} ${item.name}`);
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
      G.log.push(`📦 ${from.name} → ${to.name}: ${amount} RES`);
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
      G.log.push(`💚 ${entity.name}: -${cost} RES → +${vitalityAmount} VIT (Total VIT: ${entity.vitality})`);
    },

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

    rollDiceAndAttack: ({ G }) => {
      if (!G.pendingAttack) return INVALID_MOVE;
      const { attackerId, resourceSpent, team } = G.pendingAttack;
      const attacker = G.entities[attackerId];
      const targetId = ATTACK_TARGETS[team];
      const target = G.entities[targetId];
      const enemyTeam = team === 'UK' ? 'Russia' : 'UK';

      const dieRoll = Math.ceil(Math.random() * 6);
      // Damage = (Resource spent - Die roll) - 1
      const rawDamage = (resourceSpent - dieRoll) - 1;

      G.lastDieRoll = dieRoll;
      G.lastDamage = rawDamage;

      attacker.resource -= resourceSpent;

      const hasDouble = G.activeEffects[team].includes('double_damage');
      const hasNoBackfire = G.activeEffects[team].includes('no_backfire');
      const hasShield = G.activeEffects[enemyTeam].includes('shield');

      let finalDamage = hasDouble ? rawDamage * 2 : rawDamage;
      if (hasShield && finalDamage > 0) finalDamage = Math.max(0, finalDamage - 3);

      if (finalDamage > 0) {
        target.vitality -= finalDamage;
        CONNECTED_TO[targetId]?.forEach(connId => {
          const residual = Math.floor(finalDamage / 2);
          if (residual > 0) {
            G.entities[connId].vitality -= residual;
            G.log.push(`💥 Residual → ${G.entities[connId].name}: -${residual} VIT`);
          }
        });
        G.log.push(`🎲 Roll:${dieRoll} | Spent:${resourceSpent} | DMG:${finalDamage} → ${target.name} (VIT:${target.vitality})`);

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
        G.log.push(`🔥 BACKFIRE! Roll:${dieRoll} | ${attacker.name} ${finalDamage} VIT`);
      } else {
        G.log.push(`💨 MISS! Roll:${dieRoll} | Spent:${resourceSpent} | No damage`);
      }

      // Clear used effects
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
      if (!item) return INVALID_MOVE;
      if (bidAmount < item.minBid) return INVALID_MOVE;
      if (bidAmount <= item.currentBid) return INVALID_MOVE;
      if (entity.resource < bidAmount) return INVALID_MOVE;

      // Refund previous bidder
      if (item.bidder && item.bidder !== team) {
        const prevGovId = item.bidder === 'UK' ? 'uk_gov' : 'ru_gov';
        G.entities[prevGovId].resource += item.currentBid;
      }

      entity.resource -= bidAmount;
      item.currentBid = bidAmount;
      item.bidder = team;
      item.awarded = null;
      G.actedThisTurn.push(entityId);
      G.log.push(`🃏 ${team} bid ${bidAmount} RES on ${item.icon} ${item.name}`);
    },

    useItem: ({ G, ctx }, itemId) => {
      const team = ctx.currentPlayer === '0' ? 'UK' : 'Russia';
      const itemIndex = G.inventory[team].findIndex(i => i.id === itemId);
      if (itemIndex === -1) return INVALID_MOVE;
      const item = G.inventory[team][itemIndex];
      const govId = team === 'UK' ? 'uk_gov' : 'ru_gov';
      const enemyGovId = team === 'UK' ? 'ru_gov' : 'uk_gov';

      if (item.effect === 'gain_resource') {
        G.entities[govId].resource += 5;
        G.log.push(`✨ ${item.icon} ${item.name}: ${team} Govt +5 RES`);
      } else if (item.effect === 'instant_damage') {
        G.entities[enemyGovId].vitality -= 2;
        G.log.push(`✨ ${item.icon} ${item.name}: Enemy Govt -2 VIT`);
      } else if (item.effect === 'steal_resource') {
        const stolen = Math.min(3, G.entities[enemyGovId].resource);
        G.entities[enemyGovId].resource -= stolen;
        G.entities[govId].resource += stolen;
        G.log.push(`✨ ${item.icon} ${item.name}: Stole ${stolen} RES from enemy`);
      } else if (item.effect === 'emp') {
        G.entities[enemyGovId].resource = 0;
        G.log.push(`✨ ${item.icon} ${item.name}: Enemy Govt RES → 0`);
      } else if (item.effect === 'propaganda') {
        const targetEntity = team === 'UK' ? G.entities['electorate'] : G.entities['trolls'];
        targetEntity.vitality += 2;
        G.log.push(`✨ ${item.icon} ${item.name}: +2 VIT to people entity`);
      } else {
        G.activeEffects[team].push(item.effect);
        G.log.push(`✨ ${item.icon} ${item.name}: Effect activated`);
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

  // AI configuration
  ai: {
    enumerate,
  },
};
