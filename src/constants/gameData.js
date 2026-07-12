export const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

export const TURN_TIME = 180; // 3 minutes

export const REVITALISE_COSTS = { 1: 1, 2: 3, 3: 6, 4: 10 };

export const TEAM_COLORS = {
  UK: '#4a9eff',
  Russia: '#ff4a4a',
};

// Which entities each entity can distribute TO
export const CONNECTIONS = {
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

// Connected entities (for residual damage)
export const CONNECTED_TO = {
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

// Attack target for each team
export const ATTACK_TARGETS = {
  UK: 'ru_gov',
  Russia: 'uk_gov',
};

// UK entity IDs
export const UK_ENTITIES = ['uk_gov', 'uk_plc', 'electorate', 'gchq', 'edf'];

// Russia entity IDs
export const RUSSIA_ENTITIES = ['ru_gov', 'bear', 'trolls', 'scs', 'rosatom'];

// Initial entity definitions
export const INITIAL_ENTITIES = {
  uk_gov:    { id:'uk_gov',    name:'Government',     team:'UK',     resource:5, vitality:5, canBlackMarket:false },
  uk_plc:    { id:'uk_plc',   name:'UK Plc',          team:'UK',     resource:5, vitality:5, canBlackMarket:false },
  electorate:{ id:'electorate',name:'Electorate',     team:'UK',     resource:5, vitality:5, canBlackMarket:false },
  gchq:      { id:'gchq',     name:'GCHQ',            team:'UK',     resource:5, vitality:5, canBlackMarket:true  },
  edf:       { id:'edf',      name:'EDF Energy',      team:'UK',     resource:5, vitality:5, canBlackMarket:false },
  ru_gov:    { id:'ru_gov',   name:'Government',      team:'Russia', resource:5, vitality:5, canBlackMarket:false },
  trolls:    { id:'trolls',   name:'Online Trolls',   team:'Russia', resource:5, vitality:5, canBlackMarket:false },
  bear:      { id:'bear',     name:'Energetic Bear',  team:'Russia', resource:5, vitality:5, canBlackMarket:false },
  scs:       { id:'scs',      name:'SCS',             team:'Russia', resource:5, vitality:5, canBlackMarket:true  },
  rosatom:   { id:'rosatom',  name:'Rosenergoatom',   team:'Russia', resource:5, vitality:5, canBlackMarket:false },
};

// Black market item definitions
export const BLACK_MARKET_ITEMS = [
  { id:'bm1', name:'Zero-Day Exploit',    icon:'💣', description:'Your next attack cannot backfire',           effect:'no_backfire',    minBid:3, currentBid:0, bidder:null, awarded:null },
  { id:'bm2', name:'Disinformation Pack', icon:'📰', description:'Enemy Government loses 2 Vitality now',     effect:'instant_damage', minBid:2, currentBid:0, bidder:null, awarded:null },
  { id:'bm3', name:'Resource Cache',      icon:'💰', description:'Your Government gains 5 Resource now',      effect:'gain_resource',  minBid:2, currentBid:0, bidder:null, awarded:null },
  { id:'bm4', name:'Cyber Shield',        icon:'🛡️', description:'Reduce next attack against you by 3',       effect:'shield',         minBid:3, currentBid:0, bidder:null, awarded:null },
  { id:'bm5', name:'Botnet',              icon:'🤖', description:'Your next attack deals double damage',       effect:'double_damage',  minBid:4, currentBid:0, bidder:null, awarded:null },
  { id:'bm6', name:'Sleeper Agent',       icon:'🕵️', description:'Steal 3 Resource from enemy Government',    effect:'steal_resource', minBid:3, currentBid:0, bidder:null, awarded:null },
  { id:'bm7', name:'EMP Strike',          icon:'⚡', description:'Enemy Government loses all Resource',        effect:'emp',            minBid:4, currentBid:0, bidder:null, awarded:null },
  { id:'bm8', name:'Propaganda Wave',     icon:'📢', description:'Your people entity gains 2 Vitality',       effect:'propaganda',     minBid:2, currentBid:0, bidder:null, awarded:null },
];
