// ─── Stamp Duel — Core Type Definitions ──────────────────────────────────────

// ── Rarity ───────────────────────────────────────────────────────────────────
// C = Common, R = Rare, SR = Super Rare, SP = Special
export type Rarity = 'C' | 'R' | 'SR' | 'SP';

// ── Ability type ─────────────────────────────────────────────────────────────
export type AbilityType = 'peek' | 'steal' | 'shield' | 'boost' | 'mirror' | 'freeze';

export interface Ability {
  id: string;
  name: string;
  type: AbilityType;
  description: string;
  icon: string; // emoji icon
}

// ── Card power (4-direction values) ──────────────────────────────────────────
export interface CardPower {
  top: number;    // 1–9
  bottom: number; // 1–9
  left: number;   // 1–9
  right: number;  // 1–9
}

// ── Stamp Card definition (from catalog) ─────────────────────────────────────
export interface StampCard {
  id: string;
  name: string;
  artist: string;
  artworkEmoji: string;        // fallback emoji if image not loaded
  artworkColor: string;        // background color for artwork area
  artworkImage?: string;       // local image path e.g. 'public/images/image1.png'
  rarity: Rarity;
  power: CardPower;
  ability?: Ability;
  flavorText: string;
  series: string;              // e.g. "Impressionism", "Street Art", "Nature"
  dropRate: number;            // 0–1, used to show in UI
}

// ── Player-owned card instance ────────────────────────────────────────────────
export interface OwnedCard {
  instanceId: string;          // unique per instance (for trading)
  card: StampCard;
  acquiredAt: string;          // ISO date
  sleeveId?: string;           // cosmetic sleeve applied
  frameId?: string;            // cosmetic frame applied
  isFavorite: boolean;
}

// ── Player profile ────────────────────────────────────────────────────────────
export interface PlayerProfile {
  id: string;
  username: string;
  avatarEmoji: string;
  level: number;
  energy: number;
  maxEnergy: number;
  coins: number;
  gems: number;
  collection: OwnedCard[];
  wins: number;
  losses: number;
  lastFreeGachaAt?: string;    // ISO date — for daily free pull tracking
}

// ── Duel (3×3 Grid) ──────────────────────────────────────────────────────────
export type GridPosition = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface GridCell {
  position: GridPosition;
  card: StampCard | null;
  ownedBy: 'player' | 'opponent' | null;
}

export type DuelPhase = 'waiting' | 'selecting' | 'placing' | 'resolving' | 'finished';

export interface DuelState {
  id: string;
  phase: DuelPhase;
  grid: GridCell[];
  playerHand: OwnedCard[];    // up to 5 cards
  opponentHand: number;       // opponent hand size (hidden)
  playerScore: number;        // cells owned
  opponentScore: number;
  currentTurn: 'player' | 'opponent';
  winner: 'player' | 'opponent' | 'draw' | null;
  turnCount: number;
}

// ── Trade ─────────────────────────────────────────────────────────────────────
export type TradeStatus = 'pending' | 'active' | 'confirmed' | 'cancelled' | 'completed';

export interface TradeRoom {
  roomCode: string;
  creatorId: string;
  joinerId?: string;
  creatorOffer?: OwnedCard;
  joinerOffer?: OwnedCard;
  status: TradeStatus;
  createdAt: string;
  expiresAt: string;
}

// ── Shop items ────────────────────────────────────────────────────────────────
export type ShopItemType = 'sleeve' | 'frame' | 'ticket' | 'energy_pack' | 'starter_pack';

export interface ShopItem {
  id: string;
  name: string;
  type: ShopItemType;
  description: string;
  previewEmoji: string;
  previewColor: string;
  priceCoin?: number;
  priceGem?: number;
  priceReal?: number;          // IAP price in THB
  isBestValue?: boolean;
  isLimited?: boolean;
}

// ── Gacha result ─────────────────────────────────────────────────────────────
export interface GachaResult {
  card: StampCard;
  isNew: boolean;              // first time getting this card
  wasGuaranteedRare: boolean;  // triggered pity system
}

// ── Drop rate info (for UI display) ──────────────────────────────────────────
export const DROP_RATES: Record<Rarity, number> = {
  C:  0.55,
  R:  0.30,
  SR: 0.12,
  SP: 0.03,
};

// ── Pity system ───────────────────────────────────────────────────────────────
export const PITY_RARE_THRESHOLD = 10;       // guaranteed rare every 10 pulls
export const PITY_LEGENDARY_THRESHOLD = 80;  // guaranteed legendary every 80 pulls
