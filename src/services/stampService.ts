// ─── Stamp Duel — Card Catalog & Game Service ────────────────────────────────
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  StampCard,
  OwnedCard,
  PlayerProfile,
  GachaResult,
  DuelState,
  GridCell,
  GridPosition,
  Rarity,
} from '@game/stamp';
import {
  DROP_RATES,
  PITY_RARE_THRESHOLD,
  PITY_LEGENDARY_THRESHOLD,
} from '@game/stamp';

// ─── Storage keys ─────────────────────────────────────────────────────────────
const STORAGE_KEYS = {
  PLAYER: '@stamp_player',
  PITY_COUNTER: '@stamp_pity',
};

// ─── Card Catalog ─────────────────────────────────────────────────────────────
export const CARD_CATALOG: StampCard[] = [
  // ── Common ──────────────────────────────────────────────────────────────
  {
    id: 'c001', name: 'Sunlit Meadow', artist: 'A. Monet', artworkEmoji: '🌾',
    artworkColor: '#FFF3CD', rarity: 'common', series: 'Nature',
    power: { top: 3, bottom: 4, left: 2, right: 5 }, dropRate: DROP_RATES.common,
    flavorText: 'A gentle breeze carries the scent of summer.',
  },
  {
    id: 'c002', name: 'Blue Harbour', artist: 'P. Cézanne', artworkEmoji: '⛵',
    artworkColor: '#D6EAF8', rarity: 'common', series: 'Impressionism',
    power: { top: 4, bottom: 3, left: 5, right: 2 }, dropRate: DROP_RATES.common,
    flavorText: 'Waves carry whispers from distant shores.',
  },
  {
    id: 'c003', name: 'Street Corner', artist: 'B. Banksy', artworkEmoji: '🏙️',
    artworkColor: '#EAECEE', rarity: 'common', series: 'Street Art',
    power: { top: 2, bottom: 5, left: 4, right: 3 }, dropRate: DROP_RATES.common,
    flavorText: 'Art lives in the cracks of the city.',
  },
  {
    id: 'c004', name: 'Autumn Leaf', artist: 'H. Hokusai', artworkEmoji: '🍂',
    artworkColor: '#FAD7A0', rarity: 'common', series: 'Nature',
    power: { top: 5, bottom: 2, left: 3, right: 4 }, dropRate: DROP_RATES.common,
    flavorText: 'Even in falling, beauty is found.',
  },
  {
    id: 'c005', name: 'Cobblestone Path', artist: 'R. Renoir', artworkEmoji: '🪨',
    artworkColor: '#D5D8DC', rarity: 'common', series: 'Impressionism',
    power: { top: 3, bottom: 3, left: 4, right: 4 }, dropRate: DROP_RATES.common,
    flavorText: 'Every stone tells a thousand stories.',
  },
  // ── Uncommon ────────────────────────────────────────────────────────────
  {
    id: 'u001', name: 'Starry Rooftop', artist: 'V. van Gogh', artworkEmoji: '🌟',
    artworkColor: '#D6EAF8', rarity: 'uncommon', series: 'Impressionism',
    power: { top: 5, bottom: 4, left: 6, right: 3 }, dropRate: DROP_RATES.uncommon,
    flavorText: 'The night sky is a canvas without limits.',
  },
  {
    id: 'u002', name: 'Neon Alley', artist: 'T. Yoshida', artworkEmoji: '🎆',
    artworkColor: '#F9EBEA', rarity: 'uncommon', series: 'Street Art',
    power: { top: 6, bottom: 3, left: 4, right: 5 }, dropRate: DROP_RATES.uncommon,
    flavorText: 'Light dances on wet asphalt.',
  },
  {
    id: 'u003', name: 'Tide Pool', artist: 'S. Homer', artworkEmoji: '🐚',
    artworkColor: '#D1F2EB', rarity: 'uncommon', series: 'Nature',
    power: { top: 4, bottom: 6, left: 5, right: 3 }, dropRate: DROP_RATES.uncommon,
    flavorText: 'Hidden worlds exist within a single tide pool.',
    ability: {
      id: 'ab_peek', name: 'Peek', type: 'peek',
      description: "Reveal one card from opponent's hand",
      icon: '👁️',
    },
  },
  {
    id: 'u004', name: 'Cherry Blossom Path', artist: 'K. Hiroshige', artworkEmoji: '🌸',
    artworkColor: '#FDEDEC', rarity: 'uncommon', series: 'Nature',
    power: { top: 3, bottom: 5, left: 6, right: 4 }, dropRate: DROP_RATES.uncommon,
    flavorText: 'Beauty is most precious in its brevity.',
  },
  // ── Rare ────────────────────────────────────────────────────────────────
  {
    id: 'r001', name: 'Golden Hour', artist: 'C. Monet', artworkEmoji: '🌅',
    artworkColor: '#FEF9E7', rarity: 'rare', series: 'Impressionism',
    power: { top: 6, bottom: 5, left: 7, right: 4 }, dropRate: DROP_RATES.rare,
    flavorText: 'The world holds its breath as day meets dusk.',
    ability: {
      id: 'ab_boost', name: 'Golden Boost', type: 'boost',
      description: '+2 to all adjacent ally card power values',
      icon: '✨',
    },
  },
  {
    id: 'r002', name: 'Midnight Garden', artist: 'G. Klimt', artworkEmoji: '🌙',
    artworkColor: '#EAF2FF', rarity: 'rare', series: 'Nature',
    power: { top: 7, bottom: 4, left: 5, right: 6 }, dropRate: DROP_RATES.rare,
    flavorText: 'Night blooms carry secrets in their petals.',
    ability: {
      id: 'ab_steal', name: 'Midnight Steal', type: 'steal',
      description: 'Convert one adjacent opponent card to yours',
      icon: '🌑',
    },
  },
  {
    id: 'r003', name: 'Urban Canvas', artist: 'J. Haring', artworkEmoji: '🎨',
    artworkColor: '#FEF5E7', rarity: 'rare', series: 'Street Art',
    power: { top: 5, bottom: 7, left: 4, right: 6 }, dropRate: DROP_RATES.rare,
    flavorText: 'The city is the greatest gallery of all.',
  },
  // ── Epic ────────────────────────────────────────────────────────────────
  {
    id: 'e001', name: 'Celestial Dragon', artist: 'W. Turner', artworkEmoji: '🐉',
    artworkColor: '#F5EEF8', rarity: 'epic', series: 'Mythical',
    power: { top: 7, bottom: 6, left: 8, right: 7 }, dropRate: DROP_RATES.epic,
    flavorText: 'Born from storm and starlight.',
    ability: {
      id: 'ab_mirror', name: 'Mirror Scale', type: 'mirror',
      description: 'Copy the highest power value of a placed opponent card',
      icon: '🔮',
    },
  },
  {
    id: 'e002', name: 'Iron Phoenix', artist: 'F. Kahlo', artworkEmoji: '🦅',
    artworkColor: '#FEF9E7', rarity: 'epic', series: 'Mythical',
    power: { top: 8, bottom: 5, left: 6, right: 7 }, dropRate: DROP_RATES.epic,
    flavorText: 'Rising always, falling never.',
    ability: {
      id: 'ab_shield', name: 'Phoenix Shield', type: 'shield',
      description: 'This card cannot be captured for 1 turn',
      icon: '🛡️',
    },
  },
  // ── Legendary ───────────────────────────────────────────────────────────
  {
    id: 'l001', name: 'The Infinite Bloom', artist: 'Y. Kusama', artworkEmoji: '🌺',
    artworkColor: '#FEF9E7', rarity: 'legendary', series: 'Contemporary',
    power: { top: 9, bottom: 8, left: 7, right: 9 }, dropRate: DROP_RATES.legendary,
    flavorText: 'Infinity is not a place. It is a feeling.',
    ability: {
      id: 'ab_freeze', name: 'Bloom Freeze', type: 'freeze',
      description: 'Freeze all opponent cards adjacent to this one for 1 turn',
      icon: '❄️',
    },
  },
  {
    id: 'l002', name: 'Starfall Sonata', artist: 'A. Warhol', artworkEmoji: '🎵',
    artworkColor: '#EAF2FF', rarity: 'legendary', series: 'Contemporary',
    power: { top: 8, bottom: 9, left: 9, right: 7 }, dropRate: DROP_RATES.legendary,
    flavorText: 'In the future, everyone will be art for 15 minutes.',
    ability: {
      id: 'ab_steal2', name: 'Fame Steal', type: 'steal',
      description: 'Steal up to 2 adjacent opponent cards at once',
      icon: '⭐',
    },
  },
];

// ─── Helper: get card by id ────────────────────────────────────────────────────
export function getCardById(id: string): StampCard | undefined {
  return CARD_CATALOG.find((c) => c.id === id);
}

// ─── Helper: get cards by rarity ──────────────────────────────────────────────
export function getCardsByRarity(rarity: Rarity): StampCard[] {
  return CARD_CATALOG.filter((c) => c.rarity === rarity);
}

// ─── Default player ───────────────────────────────────────────────────────────
export const DEFAULT_PLAYER: PlayerProfile = {
  id: 'player-local',
  username: 'Collector',
  avatarEmoji: '🎨',
  level: 1,
  energy: 5,
  maxEnergy: 10,
  coins: 500,
  gems: 20,
  collection: [
    {
      instanceId: 'inst-c001-1',
      card: CARD_CATALOG[0],
      acquiredAt: new Date().toISOString(),
      isFavorite: false,
    },
    {
      instanceId: 'inst-c002-1',
      card: CARD_CATALOG[1],
      acquiredAt: new Date().toISOString(),
      isFavorite: false,
    },
    {
      instanceId: 'inst-c003-1',
      card: CARD_CATALOG[2],
      acquiredAt: new Date().toISOString(),
      isFavorite: false,
    },
    {
      instanceId: 'inst-u001-1',
      card: CARD_CATALOG[5],
      acquiredAt: new Date().toISOString(),
      isFavorite: true,
    },
  ],
  wins: 0,
  losses: 0,
};

// ─── Load / Save player profile ───────────────────────────────────────────────
export async function loadPlayer(): Promise<PlayerProfile> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.PLAYER);
    if (raw) return JSON.parse(raw) as PlayerProfile;
  } catch {}
  return { ...DEFAULT_PLAYER };
}

export async function savePlayer(player: PlayerProfile): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PLAYER, JSON.stringify(player));
  } catch {}
}

// ─── Pity counters ────────────────────────────────────────────────────────────
interface PityCounters { sinceRare: number; sinceLegendary: number }

async function loadPity(): Promise<PityCounters> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.PITY_COUNTER);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { sinceRare: 0, sinceLegendary: 0 };
}

async function savePity(pity: PityCounters): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PITY_COUNTER, JSON.stringify(pity));
  } catch {}
}

// ─── Weighted random pull ─────────────────────────────────────────────────────
function weightedPull(forcedRarity?: Rarity): StampCard {
  const pool = forcedRarity ? getCardsByRarity(forcedRarity) : CARD_CATALOG;
  if (forcedRarity && pool.length > 0) {
    return pool[Math.floor(Math.random() * pool.length)];
  }
  const roll = Math.random();
  let cumulative = 0;
  const rarityOrder: Rarity[] = ['legendary', 'epic', 'rare', 'uncommon', 'common'];
  for (const rarity of rarityOrder) {
    cumulative += DROP_RATES[rarity];
    if (roll <= cumulative) {
      const rarityPool = getCardsByRarity(rarity);
      if (rarityPool.length > 0) {
        return rarityPool[Math.floor(Math.random() * rarityPool.length)];
      }
    }
  }
  return CARD_CATALOG[Math.floor(Math.random() * CARD_CATALOG.length)];
}

// ─── Gacha pull ────────────────────────────────────────────────────────────────
export async function performGachaPull(player: PlayerProfile): Promise<{ result: GachaResult; updatedPlayer: PlayerProfile }> {
  const pity = await loadPity();
  let wasGuaranteedRare = false;
  let forcedRarity: Rarity | undefined;

  // Pity check
  if (pity.sinceLegendary >= PITY_LEGENDARY_THRESHOLD) {
    forcedRarity = 'legendary';
    wasGuaranteedRare = true;
  } else if (pity.sinceRare >= PITY_RARE_THRESHOLD) {
    forcedRarity = 'rare';
    wasGuaranteedRare = true;
  }

  const card = weightedPull(forcedRarity);
  const isNew = !player.collection.some((o) => o.card.id === card.id);

  // Update pity counters
  const newPity: PityCounters = {
    sinceRare: card.rarity === 'rare' || card.rarity === 'epic' || card.rarity === 'legendary'
      ? 0 : pity.sinceRare + 1,
    sinceLegendary: card.rarity === 'legendary' ? 0 : pity.sinceLegendary + 1,
  };
  await savePity(newPity);

  const newOwned: OwnedCard = {
    instanceId: `inst-${card.id}-${Date.now()}`,
    card,
    acquiredAt: new Date().toISOString(),
    isFavorite: false,
  };

  const updatedPlayer: PlayerProfile = {
    ...player,
    energy: player.energy - 1,
    collection: [...player.collection, newOwned],
    lastFreeGachaAt: new Date().toISOString(),
  };

  return { result: { card, isNew, wasGuaranteedRare }, updatedPlayer };
}

// ─── Check daily free pull ────────────────────────────────────────────────────
export function canFreeGacha(player: PlayerProfile): boolean {
  if (!player.lastFreeGachaAt) return true;
  const last = new Date(player.lastFreeGachaAt);
  const now = new Date();
  return now.getDate() !== last.getDate() ||
    now.getMonth() !== last.getMonth() ||
    now.getFullYear() !== last.getFullYear();
}

// ─── Duel helper: create fresh duel state ─────────────────────────────────────
export function createDuelState(playerHand: OwnedCard[]): DuelState {
  const grid: GridCell[] = Array.from({ length: 9 }, (_, i) => ({
    position: i as GridPosition,
    card: null,
    ownedBy: null,
  }));

  return {
    id: `duel-${Date.now()}`,
    phase: 'selecting',
    grid,
    playerHand: playerHand.slice(0, 5),
    opponentHand: 5,
    playerScore: 0,
    opponentScore: 0,
    currentTurn: 'player',
    winner: null,
    turnCount: 0,
  };
}

// ─── Duel: place card on grid & resolve captures ──────────────────────────────
export function placeCard(
  state: DuelState,
  card: StampCard,
  position: GridPosition,
  owner: 'player' | 'opponent',
): DuelState {
  const newGrid = state.grid.map((cell) => ({ ...cell }));
  newGrid[position] = { position, card, ownedBy: owner };

  // Resolve adjacent captures (4-direction)
  const adjacentMap: Record<number, { pos: number; myDir: keyof typeof card.power; theirDir: keyof typeof card.power }[]> = {
    0: [{ pos: 1, myDir: 'right', theirDir: 'left' }, { pos: 3, myDir: 'bottom', theirDir: 'top' }],
    1: [{ pos: 0, myDir: 'left', theirDir: 'right' }, { pos: 2, myDir: 'right', theirDir: 'left' }, { pos: 4, myDir: 'bottom', theirDir: 'top' }],
    2: [{ pos: 1, myDir: 'left', theirDir: 'right' }, { pos: 5, myDir: 'bottom', theirDir: 'top' }],
    3: [{ pos: 0, myDir: 'top', theirDir: 'bottom' }, { pos: 4, myDir: 'right', theirDir: 'left' }, { pos: 6, myDir: 'bottom', theirDir: 'top' }],
    4: [{ pos: 1, myDir: 'top', theirDir: 'bottom' }, { pos: 3, myDir: 'left', theirDir: 'right' }, { pos: 5, myDir: 'right', theirDir: 'left' }, { pos: 7, myDir: 'bottom', theirDir: 'top' }],
    5: [{ pos: 2, myDir: 'top', theirDir: 'bottom' }, { pos: 4, myDir: 'left', theirDir: 'right' }, { pos: 8, myDir: 'bottom', theirDir: 'top' }],
    6: [{ pos: 3, myDir: 'top', theirDir: 'bottom' }, { pos: 7, myDir: 'right', theirDir: 'left' }],
    7: [{ pos: 6, myDir: 'left', theirDir: 'right' }, { pos: 8, myDir: 'right', theirDir: 'left' }, { pos: 4, myDir: 'top', theirDir: 'bottom' }],
    8: [{ pos: 7, myDir: 'left', theirDir: 'right' }, { pos: 5, myDir: 'top', theirDir: 'bottom' }],
  };

  const adjacent = adjacentMap[position] ?? [];
  for (const { pos, myDir, theirDir } of adjacent) {
    const target = newGrid[pos];
    if (target.card && target.ownedBy && target.ownedBy !== owner) {
      if (card.power[myDir] > target.card.power[theirDir]) {
        newGrid[pos] = { ...target, ownedBy: owner };
      }
    }
  }

  // Recalculate scores
  const playerScore = newGrid.filter((c) => c.ownedBy === 'player').length;
  const opponentScore = newGrid.filter((c) => c.ownedBy === 'opponent').length;
  const filled = newGrid.filter((c) => c.card !== null).length;

  // Remove placed card from player hand
  const newHand = state.playerHand.filter((oc) => oc.card.id !== card.id);

  // Check win condition
  let winner = state.winner;
  if (filled === 9) {
    if (playerScore > opponentScore) winner = 'player';
    else if (opponentScore > playerScore) winner = 'opponent';
    else winner = 'draw';
  }

  return {
    ...state,
    grid: newGrid,
    playerHand: newHand,
    playerScore,
    opponentScore,
    currentTurn: owner === 'player' ? 'opponent' : 'player',
    turnCount: state.turnCount + 1,
    phase: filled === 9 ? 'finished' : 'selecting',
    winner,
  };
}

// ─── AI: simple opponent move ─────────────────────────────────────────────────
export function aiMove(state: DuelState): DuelState {
  const emptyPositions = state.grid
    .filter((c) => c.card === null)
    .map((c) => c.position);
  if (emptyPositions.length === 0) return state;

  const allAiCards = CARD_CATALOG.filter((c) => c.rarity === 'common' || c.rarity === 'uncommon');
  const randomCard = allAiCards[Math.floor(Math.random() * allAiCards.length)];
  const randomPos = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];

  return placeCard(state, randomCard, randomPos, 'opponent');
}

// ─── Trade room helpers ───────────────────────────────────────────────────────
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// ─── Shop catalog ─────────────────────────────────────────────────────────────
import type { ShopItem } from '@game/stamp';

export const SHOP_ITEMS: ShopItem[] = [
  // Sleeves
  { id: 'sl001', name: 'Charcoal Classic', type: 'sleeve', description: 'Elegant dark charcoal card sleeve', previewEmoji: '🖤', previewColor: '#2D3436', priceCoin: 200 },
  { id: 'sl002', name: 'Peach Blossom', type: 'sleeve', description: 'Warm peach sleeve with bloom pattern', previewEmoji: '🌸', previewColor: '#E17055', priceCoin: 200 },
  { id: 'sl003', name: 'Gilded Edge', type: 'sleeve', description: 'Luxurious gold-trim sleeve for rare cards', previewEmoji: '✨', previewColor: '#FDCB6E', priceCoin: 350, isLimited: false },
  // Frames
  { id: 'fr001', name: 'Minimalist Frame', type: 'frame', description: 'Clean, thin border in matte charcoal', previewEmoji: '🖼️', previewColor: '#2D3436', priceCoin: 300 },
  { id: 'fr002', name: 'Golden Ornate', type: 'frame', description: 'Ornate gold frame for legendary-tier display', previewEmoji: '👑', previewColor: '#FDCB6E', priceGem: 15, isBestValue: false },
  // Tickets
  { id: 'tk001', name: 'Rare Ticket', type: 'ticket', description: 'Guarantees at least one Rare stamp', previewEmoji: '🎫', previewColor: '#FDCB6E', priceCoin: 500 },
  { id: 'tk002', name: 'Epic Ticket', type: 'ticket', description: 'Guarantees at least one Epic stamp', previewEmoji: '💎', previewColor: '#A29BFE', priceGem: 30 },
  // Energy packs
  { id: 'en001', name: 'Energy Sip', type: 'energy_pack', description: '+3 Energy', previewEmoji: '⚡', previewColor: '#E17055', priceCoin: 100 },
  { id: 'en002', name: 'Energy Surge', type: 'energy_pack', description: '+10 Energy', previewEmoji: '⚡', previewColor: '#E17055', priceCoin: 300, isBestValue: true },
  // Starter pack
  { id: 'sp001', name: 'Artist Starter Pack', type: 'starter_pack', description: '5 curated common + 2 uncommon stamps. Beautiful, not broken.', previewEmoji: '🎨', previewColor: '#F8F9FA', priceReal: 99, isBestValue: true },
];
