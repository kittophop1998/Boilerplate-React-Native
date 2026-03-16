// ─── Shop Service ─────────────────────────────────────────────────────────────
// Handles global shop (cosmetics / roles / boosters) and in-match shop.
// ─────────────────────────────────────────────────────────────────────────────
import api from './api';
import type { GlobalShopItem, InMatchShopItem } from '@game/game';

// ── Request / Response types ──────────────────────────────────────────────────
export interface PurchaseGlobalItemRequest {
  itemId: string;
}

export interface PurchaseInMatchItemRequest {
  itemId: string;
  roomId: string; // needed so server can validate the active session
}

export interface PurchaseResponse {
  success: boolean;
  message: string;
}

export type GlobalShopCategory = 'cosmetics' | 'roles' | 'boosters';

// ── Endpoints ─────────────────────────────────────────────────────────────────
const BASE = '/shop';

export const shopService = {
  // ── Global Shop ────────────────────────────────────────────────────────────

  /**
   * GET /shop/global
   * Returns all purchasable global items tagged with player-ownership status.
   */
  getGlobalItems: (category?: GlobalShopCategory) =>
    api
      .get<GlobalShopItem[]>(`${BASE}/global`, { params: category ? { category } : {} })
      .then((r) => r.data),

  /**
   * POST /shop/global/purchase
   * Deducts vault gold and marks item as owned.
   */
  purchaseGlobalItem: (body: PurchaseGlobalItemRequest) =>
    api.post<PurchaseResponse>(`${BASE}/global/purchase`, body).then((r) => r.data),

  // ── In-Match Shop ──────────────────────────────────────────────────────────

  /**
   * GET /shop/in-match/:roomId
   * Returns available in-match items for a specific room.
   */
  getInMatchItems: (roomId: string) =>
    api.get<InMatchShopItem[]>(`${BASE}/in-match/${roomId}`).then((r) => r.data),

  /**
   * POST /shop/in-match/purchase
   * Deducts match money and adds the item to the player's match inventory.
   */
  purchaseInMatchItem: (body: PurchaseInMatchItemRequest) =>
    api.post<PurchaseResponse>(`${BASE}/in-match/purchase`, body).then((r) => r.data),
};

export default shopService;
