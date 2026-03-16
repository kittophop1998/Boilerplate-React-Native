// ─── Inventory Service ────────────────────────────────────────────────────────
// Handles player's owned item collection and equipping cosmetics.
// ─────────────────────────────────────────────────────────────────────────────
import api from './api';
import type { InventoryItem } from '@game/game';

// ── Request / Response types ──────────────────────────────────────────────────
export interface EquipItemRequest {
  itemId: string;
}

export interface EquipItemResponse {
  success: boolean;
}

// ── Endpoints ─────────────────────────────────────────────────────────────────
const BASE = '/inventory';

export const inventoryService = {
  /**
   * GET /inventory
   * Returns all items owned by the current player.
   */
  getInventory: () =>
    api.get<InventoryItem[]>(BASE).then((r) => r.data),

  /**
   * POST /inventory/equip
   * Equips an item (server un-equips all others of the same type).
   */
  equipItem: (body: EquipItemRequest) =>
    api.post<EquipItemResponse>(`${BASE}/equip`, body).then((r) => r.data),

  /**
   * DELETE /inventory/:itemId
   * Removes an item from the player's inventory (if allowed).
   */
  removeItem: (itemId: string) =>
    api.delete<{ success: boolean }>(`${BASE}/${itemId}`).then((r) => r.data),
};

export default inventoryService;
