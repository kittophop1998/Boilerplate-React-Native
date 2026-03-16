// ─── useInventoryApi ──────────────────────────────────────────────────────────
// React Query hooks for player inventory (owned items) and equipping.
// ─────────────────────────────────────────────────────────────────────────────
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import inventoryService, { EquipItemRequest } from '@services/inventoryService';

// ── Query Keys ─────────────────────────────────────────────────────────────────
export const inventoryKeys = {
  all: ['inventory'] as const,
  list: () => [...inventoryKeys.all, 'list'] as const,
};

// ── Queries ────────────────────────────────────────────────────────────────────

/**
 * Fetches all items owned by the current player.
 */
export function useInventory() {
  return useQuery({
    queryKey: inventoryKeys.list(),
    queryFn: () => inventoryService.getInventory(),
    staleTime: 3 * 60 * 1000, // 3 min
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

/**
 * Equip an inventory item (server handles un-equipping same-type duplicates).
 */
export function useEquipItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: EquipItemRequest) => inventoryService.equipItem(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: inventoryKeys.list() });
    },
  });
}

/**
 * Remove an item from the inventory permanently.
 */
export function useRemoveItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => inventoryService.removeItem(itemId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: inventoryKeys.list() });
    },
  });
}
