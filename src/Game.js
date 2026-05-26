import { INVALID_MOVE } from 'boardgame.io/core';

// Connections based on board PDF - one way transfers
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

// Attack vectors: UK attacks Russia Gov, Russia attacks UK Gov
const ATTACK_TARGETS = {
  UK: 'ru_gov',
  Russia: 'uk_gov',
};

// Connected to each entity (for residual damage)
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

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const REVITALISE_COSTS = { 1: 1, 2: 3, 3: 6, 4: 10 };

const INITIAL_ENTITIES = {
  uk_gov:    { id: 'uk_gov',    name: 'Government',      team: 'UK',     resource: 0, vitality: 5, canBlackMarket: false },
  uk_plc:    { id: 'uk_plc',   name: 'UK Plc',           team: 'UK',     resource: 0, vitality: 5, canBlackMarket: false },
  electorate:{ id: 'electorate',name: 'Electorate',      team: 'UK',     resource: 0, vitality: 5, canBlackMarket: false },
  gchq:      { id: 'gchq',     name: 'GCHQ',             team: 'UK',     resource: 0, vitality: 5, canBlackMarket: true  },
  edf:       { id: 'edf',      name: 'EDF Energy',       team: 'UK',     resource: 0, vitality: 5, canBlackMarket: false },
  ru_gov:    { id: 'ru_gov',   name: 'Government',       team: 'Russia', resource: 0, vitality: 5, canBlackMarket: false },
  trolls:    { id: 'trolls',   name: 'Online Trolls',    team: 'Russia', resource: 0, vitality: 5, canBlackMarket: false },
  bear:      { id: 'bear',     name: 'Energetic Bear',   team: 'Russia', resource: 0, vitality: 5, canBlackMarket: false },
  scs:       { id: 'scs',      name: 'SCS',              team: 'Russia', resource: 0, vitality: 5, canBlackMarket: true  },
  rosatom:   { id: 'rosatom',  name: 'Rosenergoatom',    team: 'Russia', resource: 0, vitality: 5, canBlackMarket: false },
};

const BLACK_MARKET_ITEMS = [
  { id: 'bm1', name: 'Zero-Day Exploit',    description: 'Next attack ignores backfire', effect: 'no_backfire',    cost: 3, currentBid: 0, bidder: null, awarded: null },
  { id: 'bm2', name: 'Disinformation Pack', description: 'Target loses 2 Vitality now', effect: 'instant_damage', cost: 2, currentBid: 0, bidder: null, awarded: null },
  { id: 'bm3', name: 'Resource Cache',      description: 'Gain 5 Resource immediately', effect: 'gain_resource',  cost: 2, currentBid: 0, bidder: null, awarded: null },
  { id: 'bm4', name: 'Cyber Shield',        description: 'Reduce next attack damage by 3', effect: 'shield',      cost: 3, currentBid: 0, bidder: null, awarded: null },
  { id: 'bm5', name: 'Botnet',              description: 'Double next attack damage',   effect: 'double_damage',  cost: 4, currentBid: 0, bidder: null, awarded: null },
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
  }),

  turn: {
    onBegin: ({ G, ctx }) => {
      const team = ctx.currentPlayer === '0' ? 'UK' : 'Russia';
      const govId = team === 'UK' ? 'uk_gov' : 'ru_gov';
      G.entities[govId].resource += 3;
      G.actedThisTurn = [];
      G.lastDieRoll = null;
      G.lastDamage = null;
      G.log.push(`📅 ${MONTHS[G.currentTurn - 1]}: ${team} Government receives 3 Resource`);

      // Award pending black market items
      G.blackMarket.forEach(item => {
        if (item.awarded === team && item.bidder === team) {
          G.inventory[team].push({ ...item });
          G.log.push(`🛒 ${team} received Black Market item: ${item.name}`);
          item.awarded = null;
          item.bidder = null;
          item.currentBid = 0;
        }
      });
    },

    onEnd: ({ G, ctx }) => {
      const team = ctx.currentPlayer === '0' ? 'UK' : 'Russia';
      // Check if opponent didn't outbid — award items
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
    // DISTRIBUTE: transfer resource between connected entities
    distribute: ({ G, ctx }, fromId, toId, amount) => {
      const team = ctx.currentPlayer === '0' ? 'UK' : 'Russia';
      const from = G.entities[fromId];
      const to = G.entities[toId];

      if (!from || !to) return INVALID_MOVE;
      if (from.team !== team) return INVALID_MOVE;
      if (!CONNECTIONS[fromId]?.includes(toId)) return INVALID_MOVE;
      if (amount < 1 || amount > 5) return INVALID_MOVE;
      if (from.resource < amount) return INVALID_MOVE;
      if (G.actedThisTurn.includes(fromId)) return INVALID_MOVE;

      from.resource -= amount;
      to.resource += amount;
      G.actedThisTurn.push(fromId);
      G.log.push(`📦 ${from.name} → ${to.name}: ${amount} Resource`);
    },

    // REVITALISE: spend resource to gain vitality
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
      G.log.push(`💚 ${entity.name} spent ${cost} Resource for +${vitalityAmount} Vitality`);
    },

    // ATTACK: attack along the attack vector
    attack: ({ G, ctx }, attackerId, resourceSpent) => {
      if (G.currentTurn === 1) return INVALID_MOVE; // No attacks in January

      const team = ctx.currentPlayer === '0' ? 'UK' : 'Russia';
      const attacker = G.entities[attackerId];
      const targetId = ATTACK_TARGETS[team];
      const target = G.entities[targetId];

      if (!attacker) return INVALID_MOVE;
      if (attacker.team !== team) return INVALID_MOVE;
      if (G.actedThisTurn.includes(attackerId)) return INVALID_MOVE;
      if (resourceSpent < 1 || resourceSpent > 6) return INVALID_MOVE;
      if (attacker.resource < resourceSpent) return INVALID_MOVE;

      const dieRoll = Math.ceil(Math.random() * 6);
      const damage = resourceSpent - dieRoll;

      G.lastDieRoll = dieRoll;
      G.lastDamage = damage;

      attacker.resource -= resourceSpent;

      // Check for active effects
      const hasDoubleEffect = G.activeEffects[team].includes('double_damage');
      const hasNoBackfire = G.activeEffects[team].includes('no_backfire');
      const targetHasShield = G.activeEffects[team === 'UK' ? 'Russia' : 'UK'].includes('shield');

      let finalDamage = hasDoubleEffect ? damage * 2 : damage;
      if (targetHasShield && finalDamage > 0) finalDamage = Math.max(0, finalDamage - 3);

      if (finalDamage > 0) {
        target.vitality -= finalDamage;
        // Residual damage to connected entities (1:2 ratio)
        CONNECTED_TO[targetId]?.forEach(connId => {
          const residual = Math.floor(finalDamage / 2);
          if (residual > 0) {
            G.entities[connId].vitality -= residual;
            G.log.push(`💥 Residual: ${G.entities[connId].name} -${residual} Vitality`);
          }
        });
        G.log.push(`⚔️ ${attacker.name} → ${target.name}: ${finalDamage} damage! (Rolled ${dieRoll}, Spent ${resourceSpent})`);

        // Check game end condition
        const allEntities = Object.values(G.entities);
        const destroyed = allEntities.find(e => e.vitality <= 0);
        if (destroyed) {
          if (team === 'UK') G.vpUK += 10;
          else G.vpRussia += 10;
          G.gameOver = true;
          G.winner = team;
          G.log.push(`💀 ${destroyed.name} destroyed! ${team} gains 10 VP! GAME OVER!`);
        }
      } else if (!hasNoBackfire && finalDamage < 0) {
        // Backfire
        attacker.vitality += finalDamage; // damage is negative
        G.log.push(`🔥 BACKFIRE! ${attacker.name} lost ${Math.abs(finalDamage)} Vitality! (Rolled ${dieRoll}, Spent ${resourceSpent})`);
      } else {
        G.log.push(`💨 Attack missed! No damage. (Rolled ${dieRoll}, Spent ${resourceSpent})`);
      }

      // Clear used effects
      G.activeEffects[team] = G.activeEffects[team].filter(e => e !== 'double_damage' && e !== 'no_backfire');
      const enemyTeam = team === 'UK' ? 'Russia' : 'UK';
      G.activeEffects[enemyTeam] = G.activeEffects[enemyTeam].filter(e => e !== 'shield');

      G.actedThisTurn.push(attackerId);
    },

    // BLACK MARKET: GCHQ or SCS bid on items
    blackMarketBid: ({ G, ctx }, entityId, itemId, bidAmount) => {
      const team = ctx.currentPlayer === '0' ? 'UK' : 'Russia';
      const entity = G.entities[entityId];

      if (!entity) return INVALID_MOVE;
      if (entity.team !== team) return INVALID_MOVE;
      if (!entity.canBlackMarket) return INVALID_MOVE;
      if (G.actedThisTurn.includes(entityId)) return INVALID_MOVE;

      const item = G.blackMarket.find(i => i.id === itemId);
      if (!item) return INVALID_MOVE;
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
      G.log.push(`🛒 ${team} bid ${bidAmount} Resource on ${item.name}`);
    },

    // USE ITEM from inventory
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
        G.log.push(`✨ ${team} used ${item.name}: Enemy Government -2 Vitality`);
      } else {
        G.activeEffects[team].push(item.effect);
        G.log.push(`✨ ${team} used ${item.name}: ${item.description}`);
      }

      G.inventory[team].splice(itemIndex, 1);
    },

    // ABSTAIN: do nothing
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
    if (G.gameOver) {
      return { winner: G.winner };
    }
    if (G.currentTurn > 12) {
      const winner = G.vpUK > G.vpRussia ? 'UK' : G.vpRussia > G.vpUK ? 'Russia' : 'Draw';
      return { winner };
    }
  },
};