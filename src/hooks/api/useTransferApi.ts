// ─── useTransferApi ───────────────────────────────────────────────────────────
// React Query hooks for vault-gold transfers and match-money deposits.
// ─────────────────────────────────────────────────────────────────────────────
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import transferService, {
  SendGoldRequest,
  DepositRequest,
} from '@services/transferService';

// ── Query Keys ─────────────────────────────────────────────────────────────────
export const transferKeys = {
  all: ['transfers'] as const,
  history: (page: number) => [...transferKeys.all, 'history', page] as const,
};

// ── Queries ────────────────────────────────────────────────────────────────────

/**
 * Fetches transfer & deposit history for the current player.
 * @param page - 1-indexed page number (default 1).
 */
export function useTransferHistory(page = 1) {
  return useQuery({
    queryKey: transferKeys.history(page),
    queryFn: () => transferService.getHistory(page),
    staleTime: 60 * 1000, // 1 min
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

/**
 * Send vault gold to another player.
 * Refreshes player profile (balance) and transfer history on success.
 */
export function useSendGold() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: SendGoldRequest) => transferService.sendGold(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['player', 'profile'] });
      qc.invalidateQueries({ queryKey: transferKeys.all });
    },
  });
}

/**
 * Deposit match money (silver) into the vault as gold.
 * Refreshes player profile (balance) on success.
 */
export function useDepositToVault() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: DepositRequest) => transferService.depositToVault(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['player', 'profile'] });
      qc.invalidateQueries({ queryKey: transferKeys.all });
    },
  });
}
