// ─── Heist — Zustand Game Store ───────────────────────────────────────────────
// Global state: lobby, heist action, reveal, vault, nemesis, roles, shop
// ─────────────────────────────────────────────────────────────────────────────

import { create } from 'zustand';
import HeistSocket from '@services/socketMock';
import type {
  HeistPlayer,
  HeistRole,
  HeistAction,
  RoomPhase,
  RoundResult,
  NemesisRecord,
  GlobalShopItem,
  InMatchShopItem,
  InventoryItem,
  TransferPayload,
} from '@game/game';
import {
  MOCK_LOCAL_PLAYER,
  MOCK_LOBBY_PLAYERS,
  MOCK_ROLES,
  MOCK_NEMESIS,
  MOCK_GLOBAL_SHOP_ITEMS,
  MOCK_IN_MATCH_ITEMS,
  MOCK_INVENTORY,
  LOCAL_PLAYER_ID,
} from '../data/mockData';

// ─────────────────────────────────────────────────────────────────────────────
// Store shape
// ─────────────────────────────────────────────────────────────────────────────
interface HeistState {
  // ── Player ────────────────────────────────────────────────────────────────
  localPlayerId: string;
  localPlayerName: string;
  localAvatar: string;
  matchMoney: number;       // Silver — resets each match
  vaultGold: number;        // Gold  — permanent

  // ── Lobby ─────────────────────────────────────────────────────────────────
  roomPhase: RoomPhase;
  lobbyPlayers: HeistPlayer[];
  isSearching: boolean;
  countdown: number | null;

  // ── Action Phase ──────────────────────────────────────────────────────────
  actionTimer: number;
  selectedAction: HeistAction | null;
  currentRound: number;
  lootType: 'cash' | 'gold_bars' | 'diamonds';
  totalLoot: number;
  skillCooldown: number;    // seconds remaining

  // ── Reveal ────────────────────────────────────────────────────────────────
  roundResults: RoundResult[];

  // ── Roles ─────────────────────────────────────────────────────────────────
  roles: HeistRole[];
  equippedRoleId: string;

  // ── Nemesis ───────────────────────────────────────────────────────────────
  nemesisList: NemesisRecord[];
  topNemesis: NemesisRecord | null;

  // ── Shop ──────────────────────────────────────────────────────────────────
  globalShopItems: GlobalShopItem[];
  inMatchItems: InMatchShopItem[];

  // ── Inventory ─────────────────────────────────────────────────────────────
  inventory: InventoryItem[];

  // ── Actions ──────────────────────────────────────────────────────────────
  joinHeist: () => void;
  setReady: () => void;
  submitAction: (action: HeistAction) => void;
  useSkill: () => void;
  depositToVault: (amount: number) => void;
  sendGold: (payload: TransferPayload) => void;
  unlockRole: (roleId: string) => void;
  equipRole: (roleId: string) => void;
  upgradeSkill: (roleId: string, skillId: string) => void;
  purchaseGlobalItem: (itemId: string) => void;
  purchaseInMatchItem: (itemId: string) => void;
  equipItem: (itemId: string) => void;       // toggle equip item for next match
  findNemesisMatch: (nemesisPlayerId: string) => void;
  leaveRoom: () => void;
  _initSocket: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
export const useGameStore = create<HeistState>((set, get) => ({
  // ── Player ────────────────────────────────────────────────────────────────
  localPlayerId: LOCAL_PLAYER_ID,
  localPlayerName: MOCK_LOCAL_PLAYER.name,
  localAvatar: MOCK_LOCAL_PLAYER.avatar,
  matchMoney: 0,
  vaultGold: MOCK_LOCAL_PLAYER.vaultGold,

  // ── Lobby ─────────────────────────────────────────────────────────────────
  roomPhase: 'lobby',
  lobbyPlayers: [MOCK_LOBBY_PLAYERS[0]],
  isSearching: false,
  countdown: null,

  // ── Action Phase ──────────────────────────────────────────────────────────
  actionTimer: 15,
  selectedAction: null,
  currentRound: 1,
  lootType: 'cash',
  totalLoot: 2000,
  skillCooldown: 0,

  // ── Reveal ────────────────────────────────────────────────────────────────
  roundResults: [],

  // ── Roles ─────────────────────────────────────────────────────────────────
  roles: MOCK_ROLES,
  equippedRoleId: 'role_ghost',

  // ── Nemesis ───────────────────────────────────────────────────────────────
  nemesisList: MOCK_NEMESIS,
  topNemesis: MOCK_NEMESIS.find((n) => n.isOnline) ?? null,

  // ── Shop ──────────────────────────────────────────────────────────────────
  globalShopItems: MOCK_GLOBAL_SHOP_ITEMS,
  inMatchItems: MOCK_IN_MATCH_ITEMS,

  // ── Inventory ─────────────────────────────────────────────────────────────
  inventory: MOCK_INVENTORY,

  // ─────────────────────────────────────────────────────────────────────────
  // ACTIONS
  // ─────────────────────────────────────────────────────────────────────────
  joinHeist() {
    set({ isSearching: true, roomPhase: 'lobby', lobbyPlayers: [MOCK_LOBBY_PLAYERS[0]] });
    get()._initSocket();
    HeistSocket.joinHeist();
  },

  setReady() {
    const { localPlayerId, lobbyPlayers } = get();
    const updated = lobbyPlayers.map((p) =>
      p.isLocal ? { ...p, isReady: true } : p,
    );
    set({ lobbyPlayers: updated });
    HeistSocket.setReady(localPlayerId, true);
  },

  submitAction(action: HeistAction) {
    set({ selectedAction: action });
    HeistSocket.submitAction(get().localPlayerId, action);
  },

  useSkill() {
    const { equippedRoleId, localPlayerId, roles, skillCooldown } = get();
    if (skillCooldown > 0) { return; }
    const role = roles.find((r) => r.id === equippedRoleId);
    if (!role) { return; }
    set({ skillCooldown: role.activeSkill.cooldown });
    HeistSocket.useSkill(localPlayerId, role.activeSkill.id);
    // Countdown skill cooldown
    const interval = setInterval(() => {
      const current = useGameStore.getState().skillCooldown;
      if (current <= 1) {
        clearInterval(interval);
        set({ skillCooldown: 0 });
      } else {
        set({ skillCooldown: current - 1 });
      }
    }, 1000);
  },

  depositToVault(amount: number) {
    const { matchMoney, vaultGold, equippedRoleId } = get();
    const clamped = Math.min(amount, matchMoney);
    const feeRate = equippedRoleId === 'role_banker' ? 0.04 : 0.05;
    const fee = Math.floor(clamped * feeRate);
    const deposited = clamped - fee;
    set({
      matchMoney: matchMoney - clamped,
      vaultGold: vaultGold + deposited,
    });
    HeistSocket.depositToVault(get().localPlayerId, clamped);
  },

  sendGold(payload: TransferPayload) {
    const { vaultGold } = get();
    if (payload.amount > vaultGold) { return; }
    set({ vaultGold: vaultGold - payload.amount });
    HeistSocket.transferGold(payload);
  },

  unlockRole(roleId: string) {
    const { roles, vaultGold } = get();
    const role = roles.find((r) => r.id === roleId);
    if (!role || role.isOwned || vaultGold < role.unlockCost) { return; }
    set({
      vaultGold: vaultGold - role.unlockCost,
      roles: roles.map((r) => r.id === roleId ? { ...r, isOwned: true } : r),
    });
  },

  equipRole(roleId: string) {
    const { roles } = get();
    const role = roles.find((r) => r.id === roleId);
    if (!role || !role.isOwned) { return; }
    set({
      equippedRoleId: roleId,
      roles: roles.map((r) => ({ ...r, isEquipped: r.id === roleId })),
    });
  },

  upgradeSkill(roleId: string, skillId: string) {
    const { roles, vaultGold } = get();
    const role = roles.find((r) => r.id === roleId);
    if (!role) { return; }
    const isPassive = role.passiveSkill.id === skillId;
    const skill = isPassive ? role.passiveSkill : role.activeSkill;
    if (skill.level >= skill.maxLevel || vaultGold < skill.upgradeCost) { return; }
    const newSkill = { ...skill, level: skill.level + 1 };
    set({
      vaultGold: vaultGold - skill.upgradeCost,
      roles: roles.map((r) => {
        if (r.id !== roleId) { return r; }
        return {
          ...r,
          passiveSkill: isPassive ? newSkill : r.passiveSkill,
          activeSkill: !isPassive ? newSkill : r.activeSkill,
        };
      }),
    });
  },

  purchaseGlobalItem(itemId: string) {
    const { globalShopItems, vaultGold } = get();
    const item = globalShopItems.find((i) => i.id === itemId);
    if (!item || item.isOwned || vaultGold < item.priceGold) { return; }
    set({
      vaultGold: vaultGold - item.priceGold,
      globalShopItems: globalShopItems.map((i) =>
        i.id === itemId ? { ...i, isOwned: true } : i,
      ),
    });
  },

  purchaseInMatchItem(itemId: string) {
    const { inMatchItems, matchMoney } = get();
    const item = inMatchItems.find((i) => i.id === itemId);
    if (!item || item.isOwned || matchMoney < item.cost) { return; }
    set({
      matchMoney: matchMoney - item.cost,
      inMatchItems: inMatchItems.map((i) =>
        i.id === itemId ? { ...i, isOwned: true } : i,
      ),
    });
  },

  equipItem(itemId: string) {
    // Toggle equipped state — only 1 item active at a time
    set((state) => ({
      inventory: state.inventory.map((i) =>
        i.id === itemId
          ? { ...i, isEquipped: !i.isEquipped }
          : { ...i, isEquipped: false },
      ),
    }));
  },

  findNemesisMatch(nemesisPlayerId: string) {
    set({ isSearching: true });
    get()._initSocket();
    HeistSocket.findNemesisMatch(nemesisPlayerId);
  },

  leaveRoom() {
    HeistSocket.disconnect();
    set({
      roomPhase: 'lobby',
      lobbyPlayers: [MOCK_LOBBY_PLAYERS[0]],
      isSearching: false,
      selectedAction: null,
      roundResults: [],
      countdown: null,
      actionTimer: 15,
      matchMoney: 0,
    });
  },

  // ─────────────────────────────────────────────────────────────────────────
  _initSocket() {
    // Remove any old listeners first
    HeistSocket.off('lobby:searching');
    HeistSocket.off('lobby:player_joined');
    HeistSocket.off('lobby:ready');
    HeistSocket.off('lobby:player_ready');
    HeistSocket.off('game:countdown');
    HeistSocket.off('game:action_phase_start');
    HeistSocket.off('game:timer_tick');
    HeistSocket.off('game:action_submitted');
    HeistSocket.off('game:skill_used');
    HeistSocket.off('game:reveal');
    HeistSocket.off('vault:deposited');
    HeistSocket.off('transfer:received');

    HeistSocket.on('lobby:searching', () => {
      set({ isSearching: true });
    });

    HeistSocket.on('lobby:player_joined', ({ player }: { player: HeistPlayer }) => {
      set((s) => ({
        lobbyPlayers: s.lobbyPlayers.some((p) => p.id === player.id)
          ? s.lobbyPlayers
          : [...s.lobbyPlayers, player],
      }));
    });

    HeistSocket.on('lobby:ready', ({ players }: { players: HeistPlayer[] }) => {
      set({ lobbyPlayers: players, isSearching: false });
    });

    HeistSocket.on('lobby:player_ready', ({ playerId, isReady }: { playerId: string; isReady: boolean }) => {
      set((s) => ({
        lobbyPlayers: s.lobbyPlayers.map((p) =>
          p.id === playerId ? { ...p, isReady } : p,
        ),
      }));
    });

    HeistSocket.on('game:countdown', ({ count }: { count: number }) => {
      set({ countdown: count, roomPhase: 'countdown' });
    });

    HeistSocket.on('game:action_phase_start', ({
      round, lootType, totalLoot, timer,
    }: { round: number; lootType: 'cash' | 'gold_bars' | 'diamonds'; totalLoot: number; timer: number }) => {
      set({
        roomPhase: 'action',
        currentRound: round,
        lootType,
        totalLoot,
        actionTimer: timer,
        selectedAction: null,
        countdown: null,
      });
    });

    HeistSocket.on('game:timer_tick', ({ seconds }: { seconds: number }) => {
      set({ actionTimer: seconds });
    });

    HeistSocket.on('game:reveal', ({ results }: { results: RoundResult[] }) => {
      // Record nemesis: anyone who stole from us
      const stolenByMe = results.filter(
        (r) => r.wasBetrayed && !r.playerId.startsWith('local'),
      );
      stolenByMe.forEach((r) => {
        set((s) => {
          const existing = s.nemesisList.find((n) => n.playerId === r.playerId);
          if (existing) {
            return {
              nemesisList: s.nemesisList.map((n) =>
                n.playerId === r.playerId
                  ? { ...n, stolenCount: n.stolenCount + 1, isOnline: true }
                  : n,
              ),
            };
          }
          return {
            nemesisList: [
              ...s.nemesisList,
              {
                playerId: r.playerId,
                playerName: r.playerName,
                avatar: r.avatar,
                stolenCount: 1,
                lastSeenAt: Date.now(),
                isOnline: true,
              },
            ],
          };
        });
      });

      // Calculate our round earnings
      const myResult = results.find((r) => r.playerId === get().localPlayerId);
      if (myResult) {
        set((s) => ({
          matchMoney: s.matchMoney + myResult.moneyGained - myResult.moneyLost,
        }));
      }

      set({
        roomPhase: 'reveal',
        roundResults: results,
        topNemesis: useGameStore.getState().nemesisList
          .filter((n) => n.isOnline)
          .sort((a, b) => b.stolenCount - a.stolenCount)[0] ?? null,
      });
    });

    HeistSocket.on('vault:deposited', ({ deposited }: { deposited: number }) => {
      set((s) => ({ vaultGold: s.vaultGold + deposited }));
    });

    HeistSocket.on('transfer:received', ({ notification }: { notification: string }) => {
      console.log('[Transfer]', notification);
    });
  },
}));
