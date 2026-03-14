// ─── Heist — Mock Data ────────────────────────────────────────────────────────
// All mock data for development. Replace with real API calls when backend ready.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  HeistRole,
  HeistPlayer,
  NemesisRecord,
  GlobalShopItem,
  InMatchShopItem,
  InventoryItem,
  MatchSummary,
} from '@game/game';

// ─────────────────────────────────────────────────────────────────────────────
// LOCAL PLAYER
// ─────────────────────────────────────────────────────────────────────────────
export const LOCAL_PLAYER_ID = 'local_001';

export const MOCK_LOCAL_PLAYER: HeistPlayer = {
  id: LOCAL_PLAYER_ID,
  name: 'VaultKing',
  avatar: '😎',
  roleId: 'role_ghost',
  roleName: 'The Ghost',
  roleIcon: '👻',
  isReady: false,
  isLocal: true,
  matchMoney: 0,
  vaultGold: 12500,
};

// ─────────────────────────────────────────────────────────────────────────────
// ROLES (Role Library)
// ─────────────────────────────────────────────────────────────────────────────
export const MOCK_ROLES: HeistRole[] = [
  {
    id: 'role_ghost',
    name: 'The Ghost',
    icon: '👻',
    description: 'A silent thief who moves unseen. Can hide actions from reveal.',
    rarity: 'rare',
    isOwned: true,
    isEquipped: true,
    unlockCost: 0,
    passiveSkill: {
      id: 'ghost_passive',
      name: 'Shadow Step',
      description: '+10% chance your Steal goes undetected in reveal.',
      type: 'passive',
      cooldown: 0,
      level: 2,
      maxLevel: 5,
      upgradeCost: 500,
    },
    activeSkill: {
      id: 'ghost_active',
      name: 'Vanish',
      description: 'Conceal your action choice for 1 round from other players.',
      type: 'active',
      cooldown: 30,
      level: 1,
      maxLevel: 5,
      upgradeCost: 800,
    },
  },
  {
    id: 'role_informant',
    name: 'The Informant',
    icon: '🕵️',
    description: 'Knows what others will do before they do it.',
    rarity: 'epic',
    isOwned: true,
    isEquipped: false,
    unlockCost: 0,
    passiveSkill: {
      id: 'informant_passive',
      name: 'Intel Feed',
      description: 'See one random player\'s intended action 3s before lock-in.',
      type: 'passive',
      cooldown: 0,
      level: 1,
      maxLevel: 5,
      upgradeCost: 700,
    },
    activeSkill: {
      id: 'informant_active',
      name: 'Expose',
      description: 'Force one player\'s action to be revealed to everyone this round.',
      type: 'active',
      cooldown: 45,
      level: 1,
      maxLevel: 5,
      upgradeCost: 1200,
    },
  },
  {
    id: 'role_fixer',
    name: 'The Fixer',
    icon: '🔧',
    description: 'Repairs deals and takes a cut. Bonuses from Share actions.',
    rarity: 'common',
    isOwned: true,
    isEquipped: false,
    unlockCost: 0,
    passiveSkill: {
      id: 'fixer_passive',
      name: 'Commission',
      description: '+15% bonus money when choosing Share.',
      type: 'passive',
      cooldown: 0,
      level: 3,
      maxLevel: 5,
      upgradeCost: 300,
    },
    activeSkill: {
      id: 'fixer_active',
      name: 'Brokerage Deal',
      description: 'Force all players to Share this round. Can\'t be blocked.',
      type: 'active',
      cooldown: 60,
      level: 2,
      maxLevel: 5,
      upgradeCost: 600,
    },
  },
  {
    id: 'role_saboteur',
    name: 'The Saboteur',
    icon: '💣',
    description: 'Chaos is your weapon. Disrupts shields and traps others.',
    rarity: 'legendary',
    isOwned: false,
    isEquipped: false,
    unlockCost: 5000,
    passiveSkill: {
      id: 'saboteur_passive',
      name: 'Volatile',
      description: 'Shield actions only block 50% of stolen amount when you Steal.',
      type: 'passive',
      cooldown: 0,
      level: 1,
      maxLevel: 5,
      upgradeCost: 1500,
    },
    activeSkill: {
      id: 'saboteur_active',
      name: 'Smoke Grenade',
      description: 'Disable one player\'s active skill for 2 rounds.',
      type: 'active',
      cooldown: 50,
      level: 1,
      maxLevel: 5,
      upgradeCost: 2000,
    },
  },
  {
    id: 'role_banker',
    name: 'The Banker',
    icon: '🏦',
    description: 'Money is power. Converts match coins to vault gold faster.',
    rarity: 'rare',
    isOwned: false,
    isEquipped: false,
    unlockCost: 2000,
    passiveSkill: {
      id: 'banker_passive',
      name: 'Interest Rate',
      description: '-10% vault deposit fee after each match.',
      type: 'passive',
      cooldown: 0,
      level: 1,
      maxLevel: 5,
      upgradeCost: 600,
    },
    activeSkill: {
      id: 'banker_active',
      name: 'Money Laundering',
      description: 'Instantly convert 20% of match money to vault gold.',
      type: 'active',
      cooldown: 40,
      level: 1,
      maxLevel: 5,
      upgradeCost: 900,
    },
  },
  {
    id: 'role_enforcer',
    name: 'The Enforcer',
    icon: '🦾',
    description: 'Brute force. Steal double but Shield costs more.',
    rarity: 'epic',
    isOwned: false,
    isEquipped: false,
    unlockCost: 3500,
    passiveSkill: {
      id: 'enforcer_passive',
      name: 'Heavy Hand',
      description: 'Steal deals deal +25% more damage.',
      type: 'passive',
      cooldown: 0,
      level: 1,
      maxLevel: 5,
      upgradeCost: 1000,
    },
    activeSkill: {
      id: 'enforcer_active',
      name: 'Shakedown',
      description: 'Steal from ALL players simultaneously this round.',
      type: 'active',
      cooldown: 90,
      level: 1,
      maxLevel: 5,
      upgradeCost: 2500,
    },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// NEMESIS LIST
// ─────────────────────────────────────────────────────────────────────────────
export const MOCK_NEMESIS: NemesisRecord[] = [
  {
    playerId: 'p_nem_001',
    playerName: 'ShadowKira',
    avatar: '😈',
    stolenCount: 7,
    lastSeenAt: Date.now() - 3600_000,
    isOnline: true,
  },
  {
    playerId: 'p_nem_002',
    playerName: 'NeonPsycho',
    avatar: '🔥',
    stolenCount: 3,
    lastSeenAt: Date.now() - 86400_000,
    isOnline: false,
  },
  {
    playerId: 'p_nem_003',
    playerName: 'GlitchQueen',
    avatar: '⚡',
    stolenCount: 5,
    lastSeenAt: Date.now() - 7200_000,
    isOnline: true,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// LOBBY PLAYERS (4-slot lobby)
// ─────────────────────────────────────────────────────────────────────────────
export const MOCK_LOBBY_PLAYERS: HeistPlayer[] = [
  {
    id: LOCAL_PLAYER_ID,
    name: 'VaultKing',
    avatar: '😎',
    roleId: 'role_ghost',
    roleName: 'The Ghost',
    roleIcon: '👻',
    isReady: false,
    isLocal: true,
    matchMoney: 0,
    vaultGold: 12500,
  },
  {
    id: 'p_bot_001',
    name: 'ShadowKira',
    avatar: '😈',
    roleId: 'role_saboteur',
    roleName: 'The Saboteur',
    roleIcon: '💣',
    isReady: true,
    isLocal: false,
    matchMoney: 0,
    vaultGold: 8800,
  },
  {
    id: 'p_bot_002',
    name: 'NeonPsycho',
    avatar: '🔥',
    roleId: 'role_enforcer',
    roleName: 'The Enforcer',
    roleIcon: '🦾',
    isReady: true,
    isLocal: false,
    matchMoney: 0,
    vaultGold: 4200,
  },
  {
    id: 'p_bot_003',
    name: 'GlitchQueen',
    avatar: '⚡',
    roleId: 'role_informant',
    roleName: 'The Informant',
    roleIcon: '🕵️',
    isReady: false,
    isLocal: false,
    matchMoney: 0,
    vaultGold: 16700,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// IN-MATCH SHOP ITEMS (Black Market — during match)
// ─────────────────────────────────────────────────────────────────────────────
export const MOCK_IN_MATCH_ITEMS: InMatchShopItem[] = [
  {
    id: 'item_smoke',
    name: 'Smoke Bomb',
    icon: '💨',
    description: 'Block one player from seeing your action this round.',
    type: 'smoke_bomb',
    cost: 150,
    isOwned: false,
  },
  {
    id: 'item_bug',
    name: 'Bug Device',
    icon: '🐛',
    description: 'Spy on target player\'s next action choice.',
    type: 'bug_device',
    cost: 200,
    isOwned: false,
  },
  {
    id: 'item_trap',
    name: 'Gold Trap',
    icon: '🪤',
    description: 'Next player who Steals from you loses 50% of what they took.',
    type: 'trap',
    cost: 250,
    isOwned: true,
  },
  {
    id: 'item_decoy',
    name: 'Decoy Wallet',
    icon: '🎭',
    description: 'If stolen, attacker gets 0 coins. Your wallet is fake.',
    type: 'decoy',
    cost: 300,
    isOwned: false,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL SHOP ITEMS (Black Market — out of match)
// ─────────────────────────────────────────────────────────────────────────────
export const MOCK_GLOBAL_SHOP_ITEMS: GlobalShopItem[] = [
  // COSMETICS
  {
    id: 'cos_suit_shadow',
    name: 'Shadow Operative Suit',
    icon: '🥷',
    description: 'Full black tactical suit. Strike fear into your opponents.',
    category: 'cosmetics',
    type: 'suit_skin',
    priceGold: 2500,
    isOwned: false,
    isLimited: true,
    isBestValue: false,
  },
  {
    id: 'cos_suit_gold',
    name: 'Gold Kingpin Suit',
    icon: '🤵',
    description: 'Dripping in gold. The vault is yours.',
    category: 'cosmetics',
    type: 'suit_skin',
    priceGold: 3500,
    isOwned: false,
    isLimited: false,
    isBestValue: true,
  },
  {
    id: 'cos_frame_legend',
    name: 'Legendary Frame',
    icon: '🏆',
    description: 'Only legends earn this profile frame. Animated gold border.',
    category: 'cosmetics',
    type: 'profile_frame',
    priceGold: 1800,
    isOwned: false,
    isLimited: false,
    isBestValue: false,
  },
  {
    id: 'cos_frame_diamond',
    name: 'Diamond Frame',
    icon: '💎',
    description: 'Sparkling diamond edge. Reserved for the elite.',
    category: 'cosmetics',
    type: 'profile_frame',
    priceGold: 4000,
    isOwned: false,
    isLimited: true,
    isBestValue: false,
  },
  {
    id: 'cos_effect_gold_rain',
    name: 'Gold Rain Effect',
    icon: '💰',
    description: 'Gold coins explode on screen when you win. Flex on everyone.',
    category: 'cosmetics',
    type: 'win_effect',
    priceGold: 1500,
    isOwned: true,
    isLimited: false,
    isBestValue: false,
  },
  // ROLES
  {
    id: 'role_unlock_saboteur',
    name: 'Unlock: The Saboteur',
    icon: '💣',
    description: 'Unlock the Saboteur role. Chaos incarnate.',
    category: 'roles',
    type: 'role_unlock',
    priceGold: 5000,
    isOwned: false,
    isLimited: false,
    isBestValue: false,
  },
  {
    id: 'role_unlock_banker',
    name: 'Unlock: The Banker',
    icon: '🏦',
    description: 'Unlock the Banker role. Money multiplier specialist.',
    category: 'roles',
    type: 'role_unlock',
    priceGold: 2000,
    isOwned: false,
    isLimited: false,
    isBestValue: true,
  },
  {
    id: 'role_unlock_enforcer',
    name: 'Unlock: The Enforcer',
    icon: '🦾',
    description: 'Unlock the Enforcer role. Maximum aggression.',
    category: 'roles',
    type: 'role_unlock',
    priceGold: 3500,
    isOwned: false,
    isLimited: false,
    isBestValue: false,
  },
  // BOOSTERS
  {
    id: 'boost_vault_x2',
    name: 'Vault Booster x2',
    icon: '⚡',
    description: 'Double all vault deposits for 24 hours.',
    category: 'boosters',
    type: 'vault_booster',
    priceGold: 800,
    isOwned: false,
    isLimited: false,
    isBestValue: true,
  },
  {
    id: 'boost_vault_x3',
    name: 'Vault Booster x3',
    icon: '🚀',
    description: 'Triple all vault deposits for 12 hours. Rare.',
    category: 'boosters',
    type: 'vault_booster',
    priceGold: 1200,
    isOwned: false,
    isLimited: true,
    isBestValue: false,
  },
  {
    id: 'boost_zero_fee',
    name: 'Zero-Fee Pass',
    icon: '🎟️',
    description: 'No fee when depositing match money to vault. 3 uses.',
    category: 'boosters',
    type: 'vault_booster',
    priceGold: 500,
    isOwned: false,
    isLimited: false,
    isBestValue: false,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// INVENTORY
// ─────────────────────────────────────────────────────────────────────────────
export const MOCK_INVENTORY: InventoryItem[] = [
  {
    id: 'cos_effect_gold_rain',
    name: 'Gold Rain Effect',
    icon: '💰',
    type: 'win_effect',
    isEquipped: true,
    acquiredAt: Date.now() - 7 * 86400_000,
  },
  {
    id: 'item_trap',
    name: 'Gold Trap',
    icon: '🪤',
    type: 'trap',
    isEquipped: false,
    acquiredAt: Date.now() - 86400_000,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// MATCH SUMMARY MOCK (after reveal)
// ─────────────────────────────────────────────────────────────────────────────
export const MOCK_MATCH_SUMMARY: MatchSummary = {
  round: 1,
  lootType: 'cash',
  totalLoot: 2000,
  results: [
    {
      playerId: LOCAL_PLAYER_ID,
      playerName: 'VaultKing',
      avatar: '😎',
      action: 'share',
      moneyGained: 500,
      moneyLost: 0,
      wasBetrayed: false,
      usedSkill: false,
    },
    {
      playerId: 'p_bot_001',
      playerName: 'ShadowKira',
      avatar: '😈',
      action: 'steal',
      moneyGained: 800,
      moneyLost: 0,
      wasBetrayed: false,
      usedSkill: true,
    },
    {
      playerId: 'p_bot_002',
      playerName: 'NeonPsycho',
      avatar: '🔥',
      action: 'shield',
      moneyGained: 300,
      moneyLost: 0,
      wasBetrayed: true,
      usedSkill: false,
    },
    {
      playerId: 'p_bot_003',
      playerName: 'GlitchQueen',
      avatar: '⚡',
      action: 'share',
      moneyGained: 400,
      moneyLost: 200,
      wasBetrayed: true,
      usedSkill: false,
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LOOT IMAGES (by loot type)
// ─────────────────────────────────────────────────────────────────────────────
export const LOOT_EMOJIS: Record<string, string> = {
  cash: '💵',
  gold_bars: '🥇',
  diamonds: '💎',
};

export const LOOT_LABELS: Record<string, string> = {
  cash: 'Stack of Cash',
  gold_bars: 'Gold Bars',
  diamonds: 'Diamonds',
};
