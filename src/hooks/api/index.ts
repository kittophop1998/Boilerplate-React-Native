// ─── hooks/api — Barrel Export ────────────────────────────────────────────────
// Import all API hooks from a single entry point:
//   import { useMyProfile, useRoles, ... } from '@hooks/api';
// ─────────────────────────────────────────────────────────────────────────────

// Auth
export * from './useAuthApi';

// Player
export * from './usePlayerApi';
export { playerKeys } from './usePlayerApi';

// Roles
export * from './useRolesApi';
export { roleKeys } from './useRolesApi';

// Shop
export * from './useShopApi';
export { shopKeys } from './useShopApi';

// Inventory
export * from './useInventoryApi';
export { inventoryKeys } from './useInventoryApi';

// Transfers
export * from './useTransferApi';
export { transferKeys } from './useTransferApi';

// Lobby / Matchmaking
export * from './useLobbyApi';
export { lobbyKeys } from './useLobbyApi';
