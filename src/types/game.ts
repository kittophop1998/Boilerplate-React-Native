// ─── Heist — Game Types ───────────────────────────────────────────────────────

// ── Heist Action ──────────────────────────────────────────────────────────────
export type HeistAction = 'share' | 'steal' | 'shield';

// ── Room phase ────────────────────────────────────────────────────────────────
export type RoomPhase = 'lobby' | 'countdown' | 'action' | 'reveal' | 'summary' | 'finished';

// ── Role Rarity ───────────────────────────────────────────────────────────────
export type RoleRarity = 'common' | 'rare' | 'epic' | 'legendary';

// ── Role Skill Type ───────────────────────────────────────────────────────────
export type SkillType = 'passive' | 'active';

// ── Currency ──────────────────────────────────────────────────────────────────
export interface Currency {
  matchMoney: number;   // Silver — resets each match
  vaultGold: number;    // Gold — permanent
}

// ── Role Skill ────────────────────────────────────────────────────────────────
export interface RoleSkill {
  id: string;
  name: string;
  description: string;
  type: SkillType;
  cooldown: number;     // seconds, 0 for passive
  level: number;        // 1–5
  maxLevel: number;
  upgradeCost: number;  // vault gold to upgrade
}

// ── Heist Role ────────────────────────────────────────────────────────────────
export interface HeistRole {
  id: string;
  name: string;           // e.g. "The Informant"
  icon: string;           // emoji
  description: string;
  rarity: RoleRarity;
  isOwned: boolean;
  isEquipped: boolean;
  unlockCost: number;     // vault gold
  passiveSkill: RoleSkill;
  activeSkill: RoleSkill;
  skinEquipped?: string;
}

// ── Nemesis record ────────────────────────────────────────────────────────────
export interface NemesisRecord {
  playerId: string;
  playerName: string;
  avatar: string;
  stolenCount: number;   // how many times they stole from us
  lastSeenAt: number;    // unix timestamp
  isOnline: boolean;
}

// ── Heist Player ──────────────────────────────────────────────────────────────
export interface HeistPlayer {
  id: string;
  name: string;
  avatar: string;        // emoji
  roleId: string;
  roleName: string;
  roleIcon: string;
  isReady: boolean;
  isLocal: boolean;
  action?: HeistAction;  // set during action phase
  matchMoney: number;
  vaultGold: number;
  skinId?: string;
}

// ── Round Result ──────────────────────────────────────────────────────────────
export interface RoundResult {
  playerId: string;
  playerName: string;
  avatar: string;
  action: HeistAction;
  moneyGained: number;
  moneyLost: number;
  wasBetrayed: boolean;   // someone stole from them
  usedSkill: boolean;
}

// ── Match Summary ─────────────────────────────────────────────────────────────
export interface MatchSummary {
  round: number;
  results: RoundResult[];
  totalLoot: number;
  lootType: 'cash' | 'gold_bars' | 'diamonds';
}

// ── In-Match Shop Item ────────────────────────────────────────────────────────
export type InMatchItemType = 'smoke_bomb' | 'bug_device' | 'trap' | 'decoy';

export interface InMatchShopItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  type: InMatchItemType;
  cost: number;          // match money (silver)
  isOwned: boolean;
}

// ── Global Shop Item ──────────────────────────────────────────────────────────
export type GlobalShopCategory = 'cosmetics' | 'roles' | 'boosters';
export type GlobalShopItemType =
  | 'suit_skin'
  | 'profile_frame'
  | 'win_effect'
  | 'role_unlock'
  | 'vault_booster';

export interface GlobalShopItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: GlobalShopCategory;
  type: GlobalShopItemType;
  priceGold: number;      // vault gold
  isOwned: boolean;
  isLimited: boolean;
  isBestValue: boolean;
  previewImage?: string;
}

// ── Inventory Item ────────────────────────────────────────────────────────────
export interface InventoryItem {
  id: string;
  name: string;
  icon: string;
  type: GlobalShopItemType | InMatchItemType;
  isEquipped: boolean;
  acquiredAt: number;
}

// ── Transfer ──────────────────────────────────────────────────────────────────
export interface TransferPayload {
  fromPlayerId: string;
  toPlayerId: string;
  toPlayerName: string;
  amount: number;         // vault gold
  message: string;
  timestamp: number;
}

// ── Chat message ──────────────────────────────────────────────────────────────
export interface ChatMessage {
  playerId: string;
  playerName: string;
  text: string;
  timestamp: number;
}

// ── Party ─────────────────────────────────────────────────────────────────────
export interface Party {
  partyId: string;
  partyCode: string;
  members: HeistPlayer[];
  maxSize: 4;
  isSearching: boolean;
}

// ── Legacy aliases (backward compat) ─────────────────────────────────────────
export type ButtonType = 'green' | 'red' | 'gold';
export type PlayerStatus = 'alive' | 'dead' | 'pressing_red';

export interface RoomPlayer {
  id: string;
  name: string;
  avatar: string;
  status: PlayerStatus;
  coins: number;
  isReady: boolean;
  isPartyMember: boolean;
  lastPressedButton?: ButtonType;
}

export interface TowerFloor {
  floorNumber: number;
  startTime: number;
  buttonCooldown: number;
  survivorCount: number;
}

export type LootRarity = 'common' | 'rare' | 'epic' | 'mythical';

export interface LootItem {
  id: string;
  name: string;
  description: string;
  rarity: LootRarity;
  icon: string;
  dropRate: number;
  type: 'aura' | 'button_sound' | 'avatar_frame' | 'chat_emote';
}

export interface DailySacrifice {
  victimId: string;
  victimName: string;
  expiresAt: number;
  votesSave: number;
  votesExecute: number;
  hasVoted: boolean;
}
