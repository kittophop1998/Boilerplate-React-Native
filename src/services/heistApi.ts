// ─── Heist — Mock API Service ─────────────────────────────────────────────────
// Mock REST API layer for Heist game. Simulates server responses with delays.
// Replace with real axios calls (api.ts) when backend is ready.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  HeistRole,
  GlobalShopItem,
  InMatchShopItem,
  InventoryItem,
  NemesisRecord,
  TransferPayload,
} from '@game/game';
import {
  MOCK_ROLES,
  MOCK_GLOBAL_SHOP_ITEMS,
  MOCK_IN_MATCH_ITEMS,
  MOCK_INVENTORY,
  MOCK_NEMESIS,
  MOCK_LOCAL_PLAYER,
} from '../data/mockData';

const delay = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));

// ─────────────────────────────────────────────────────────────────────────────
// PLAYER PROFILE
// ─────────────────────────────────────────────────────────────────────────────
export const heistApi = {
  async getProfile() {
    await delay(300);
    return { ...MOCK_LOCAL_PLAYER };
  },

  async updateAvatar(avatar: string) {
    await delay(200);
    return { success: true, avatar };
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ROLES
  // ─────────────────────────────────────────────────────────────────────────
  async getRoles(): Promise<HeistRole[]> {
    await delay(400);
    return [...MOCK_ROLES];
  },

  async equipRole(roleId: string): Promise<{ success: boolean }> {
    await delay(200);
    MOCK_ROLES.forEach((r) => { r.isEquipped = r.id === roleId; });
    return { success: true };
  },

  async unlockRole(roleId: string, vaultGold: number): Promise<{ success: boolean; message: string }> {
    await delay(500);
    const role = MOCK_ROLES.find((r) => r.id === roleId);
    if (!role) { return { success: false, message: 'Role not found' }; }
    if (vaultGold < role.unlockCost) {
      return { success: false, message: 'Not enough Vault Gold' };
    }
    role.isOwned = true;
    return { success: true, message: `${role.name} unlocked!` };
  },

  async upgradeSkill(
    roleId: string,
    skillId: string,
    vaultGold: number,
  ): Promise<{ success: boolean; message: string; newLevel?: number }> {
    await delay(500);
    const role = MOCK_ROLES.find((r) => r.id === roleId);
    if (!role) { return { success: false, message: 'Role not found' }; }
    const skill =
      role.passiveSkill.id === skillId ? role.passiveSkill : role.activeSkill;
    if (skill.level >= skill.maxLevel) {
      return { success: false, message: 'Skill is already max level' };
    }
    if (vaultGold < skill.upgradeCost) {
      return { success: false, message: 'Not enough Vault Gold' };
    }
    skill.level += 1;
    return { success: true, message: `Upgraded to Level ${skill.level}!`, newLevel: skill.level };
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SHOP — Global
  // ─────────────────────────────────────────────────────────────────────────
  async getGlobalShopItems(): Promise<GlobalShopItem[]> {
    await delay(400);
    return [...MOCK_GLOBAL_SHOP_ITEMS];
  },

  async purchaseGlobalItem(
    itemId: string,
    vaultGold: number,
  ): Promise<{ success: boolean; message: string }> {
    await delay(600);
    const item = MOCK_GLOBAL_SHOP_ITEMS.find((i) => i.id === itemId);
    if (!item) { return { success: false, message: 'Item not found' }; }
    if (item.isOwned) { return { success: false, message: 'Already owned' }; }
    if (vaultGold < item.priceGold) {
      return { success: false, message: 'Not enough Vault Gold' };
    }
    item.isOwned = true;
    return { success: true, message: `ยินดีด้วย! คุณดูรวยขึ้นอีก 20% แล้ว 💰` };
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SHOP — In-Match
  // ─────────────────────────────────────────────────────────────────────────
  async getInMatchItems(): Promise<InMatchShopItem[]> {
    await delay(200);
    return [...MOCK_IN_MATCH_ITEMS];
  },

  async purchaseInMatchItem(
    itemId: string,
    matchMoney: number,
  ): Promise<{ success: boolean; message: string }> {
    await delay(300);
    const item = MOCK_IN_MATCH_ITEMS.find((i) => i.id === itemId);
    if (!item) { return { success: false, message: 'Item not found' }; }
    if (item.isOwned) { return { success: false, message: 'Already owned' }; }
    if (matchMoney < item.cost) {
      return { success: false, message: 'Not enough Match Money' };
    }
    item.isOwned = true;
    return { success: true, message: `${item.name} purchased!` };
  },

  // ─────────────────────────────────────────────────────────────────────────
  // INVENTORY
  // ─────────────────────────────────────────────────────────────────────────
  async getInventory(): Promise<InventoryItem[]> {
    await delay(300);
    return [...MOCK_INVENTORY];
  },

  async equipItem(itemId: string): Promise<{ success: boolean }> {
    await delay(200);
    MOCK_INVENTORY.forEach((i) => {
      if (i.type === MOCK_INVENTORY.find((x) => x.id === itemId)?.type) {
        i.isEquipped = i.id === itemId;
      }
    });
    return { success: true };
  },

  // ─────────────────────────────────────────────────────────────────────────
  // NEMESIS
  // ─────────────────────────────────────────────────────────────────────────
  async getNemesisList(): Promise<NemesisRecord[]> {
    await delay(300);
    return [...MOCK_NEMESIS];
  },

  async getTopNemesis(): Promise<NemesisRecord | null> {
    await delay(200);
    const online = MOCK_NEMESIS
      .filter((n) => n.isOnline)
      .sort((a, b) => b.stolenCount - a.stolenCount);
    return online[0] ?? null;
  },

  // ─────────────────────────────────────────────────────────────────────────
  // CURRENCY
  // ─────────────────────────────────────────────────────────────────────────
  async depositToVault(
    matchMoney: number,
    roleId: string,
  ): Promise<{ deposited: number; fee: number; newVaultGold: number }> {
    await delay(400);
    // Banker role gets -10% fee, others pay 5%
    const feeRate = roleId === 'role_banker' ? 0.04 : 0.05;
    const fee = Math.floor(matchMoney * feeRate);
    const deposited = matchMoney - fee;
    return { deposited, fee, newVaultGold: MOCK_LOCAL_PLAYER.vaultGold + deposited };
  },

  // ─────────────────────────────────────────────────────────────────────────
  // TRANSFER
  // ─────────────────────────────────────────────────────────────────────────
  async sendGold(payload: TransferPayload): Promise<{ success: boolean; message: string }> {
    await delay(500);
    if (payload.amount <= 0) { return { success: false, message: 'Invalid amount' }; }
    if (payload.amount > MOCK_LOCAL_PLAYER.vaultGold) {
      return { success: false, message: 'Not enough Vault Gold' };
    }
    MOCK_LOCAL_PLAYER.vaultGold -= payload.amount;
    return { success: true, message: `Sent ${payload.amount} Gold to ${payload.toPlayerName}` };
  },
};

export default heistApi;
