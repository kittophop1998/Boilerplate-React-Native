// ─── useLobbyApi ──────────────────────────────────────────────────────────────
// React Query hooks for party management and matchmaking.
// ─────────────────────────────────────────────────────────────────────────────
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import lobbyService, { JoinPartyRequest } from '@services/lobbyService';

// ── Query Keys ─────────────────────────────────────────────────────────────────
export const lobbyKeys = {
  all: ['lobby'] as const,
  party: () => [...lobbyKeys.all, 'party'] as const,
  matchmaking: () => [...lobbyKeys.all, 'matchmaking'] as const,
  roomPlayers: (roomId: string) => [...lobbyKeys.all, 'room', roomId, 'players'] as const,
};

// ── Queries ────────────────────────────────────────────────────────────────────

/**
 * Returns the player's current party (null if not in one).
 * Refetches every 5 seconds while the screen is mounted — temporary polling
 * until WebSocket is implemented.
 */
export function useCurrentParty() {
  return useQuery({
    queryKey: lobbyKeys.party(),
    queryFn: () => lobbyService.getCurrentParty(),
    staleTime: 0,
    refetchInterval: 5_000, // poll every 5 s
  });
}

/**
 * Polls matchmaking status until a room is found or cancelled.
 * Polling is enabled only when `isSearching` is true.
 */
export function useMatchmakingStatus(isSearching: boolean) {
  return useQuery({
    queryKey: lobbyKeys.matchmaking(),
    queryFn: () => lobbyService.getMatchmakingStatus(),
    enabled: isSearching,
    staleTime: 0,
    refetchInterval: isSearching ? 3_000 : false, // poll every 3 s while searching
  });
}

/**
 * Fetches all players in a given game room.
 */
export function useRoomPlayers(roomId: string) {
  return useQuery({
    queryKey: lobbyKeys.roomPlayers(roomId),
    queryFn: () => lobbyService.getRoomPlayers(roomId),
    enabled: !!roomId,
    staleTime: 0,
    refetchInterval: 5_000,
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

/**
 * Create a new party. Refreshes the current party cache.
 */
export function useCreateParty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => lobbyService.createParty(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: lobbyKeys.party() });
    },
  });
}

/**
 * Join an existing party by code. Refreshes the current party cache.
 */
export function useJoinParty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: JoinPartyRequest) => lobbyService.joinParty(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: lobbyKeys.party() });
    },
  });
}

/**
 * Leave the current party. Clears the party cache.
 */
export function useLeaveParty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => lobbyService.leaveParty(),
    onSuccess: () => {
      qc.removeQueries({ queryKey: lobbyKeys.party() });
    },
  });
}

/**
 * Start matchmaking queue (solo or party).
 */
export function useStartMatchmaking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => lobbyService.startMatchmaking(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: lobbyKeys.matchmaking() });
    },
  });
}

/**
 * Cancel matchmaking search.
 */
export function useCancelMatchmaking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => lobbyService.cancelMatchmaking(),
    onSuccess: () => {
      qc.removeQueries({ queryKey: lobbyKeys.matchmaking() });
    },
  });
}
