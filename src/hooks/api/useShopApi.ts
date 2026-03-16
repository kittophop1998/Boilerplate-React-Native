// ─── useShopApi ───────────────────────────────────────────────────────────────
// React Query hooks for the global shop and in-match item shop.
// ─────────────────────────────────────────────────────────────────────────────
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import shopService, {
  GlobalShopCategory,
  PurchaseGlobalItemRequest,
  PurchaseInMatchItemRequest,
} from '@services/shopService';

// ── Query Keys ─────────────────────────────────────────────────────────────────
export const shopKeys = {
  all: ['shop'] as const,
  global: (category?: GlobalShopCategory) =>
    category
      ? ([...shopKeys.all, 'global', category] as const)
      : ([...shopKeys.all, 'global'] as const),
  inMatch: (roomId: string) => [...shopKeys.all, 'in-match', roomId] as const,
};

// ── Queries ────────────────────────────────────────────────────────────────────

/**
 * Fetches global shop items. Optionally filter by category.
 */
export function useGlobalShopItems(category?: GlobalShopCategory) {
  return useQuery({
    queryKey: shopKeys.global(category),
    queryFn: () => shopService.getGlobalItems(category),
    staleTime: 2 * 60 * 1000, // 2 min
  });
}

/**
 * Fetches in-match available items for a specific game room.
 */
export function useInMatchShopItems(roomId: string) {
  return useQuery({
    queryKey: shopKeys.inMatch(roomId),
    queryFn: () => shopService.getInMatchItems(roomId),
    enabled: !!roomId,
    staleTime: 30 * 1000, // 30 s — items can change during match
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

/**
 * Purchase a global shop item.
 * Refreshes the global catalog and player profile (vault gold balance).
 */
export function usePurchaseGlobalItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: PurchaseGlobalItemRequest) =>
      shopService.purchaseGlobalItem(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: shopKeys.global() });
      qc.invalidateQueries({ queryKey: ['inventory'] });
      qc.invalidateQueries({ queryKey: ['player', 'profile'] });
    },
  });
}

/**
 * Purchase an in-match item.
 * Refreshes in-match shop and player profile (match money balance).
 */
export function usePurchaseInMatchItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: PurchaseInMatchItemRequest) =>
      shopService.purchaseInMatchItem(body),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: shopKeys.inMatch(variables.roomId) });
      qc.invalidateQueries({ queryKey: ['player', 'profile'] });
    },
  });
}
