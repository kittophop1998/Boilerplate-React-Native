// ─── usePlayerApi ─────────────────────────────────────────────────────────────
// React Query hooks for player profile and nemesis data.
// ─────────────────────────────────────────────────────────────────────────────
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import playerService, {
  UpdateProfileRequest,
  UpdateAvatarRequest,
} from '@services/playerService';

// ── Query Keys ─────────────────────────────────────────────────────────────────
export const playerKeys = {
  all: ['player'] as const,
  profile: () => [...playerKeys.all, 'profile'] as const,
  byId: (id: string) => [...playerKeys.all, 'profile', id] as const,
  nemesis: () => [...playerKeys.all, 'nemesis'] as const,
  topNemesis: () => [...playerKeys.all, 'nemesis', 'top'] as const,
};

// ── Queries ────────────────────────────────────────────────────────────────────

/**
 * Fetches the current authenticated player's profile.
 * Cached for 5 minutes — auto-refreshed on window focus.
 */
export function useMyProfile() {
  return useQuery({
    queryKey: playerKeys.profile(),
    queryFn: () => playerService.getProfile(),
    staleTime: 5 * 60 * 1000, // 5 min
  });
}

/**
 * Fetches another player's public profile by ID.
 */
export function usePlayerById(playerId: string) {
  return useQuery({
    queryKey: playerKeys.byId(playerId),
    queryFn: () => playerService.getPlayerById(playerId),
    enabled: !!playerId,
    staleTime: 2 * 60 * 1000, // 2 min
  });
}

/**
 * Fetches the nemesis list (players who have stolen from you).
 */
export function useNemesisList() {
  return useQuery({
    queryKey: playerKeys.nemesis(),
    queryFn: () => playerService.getNemesisList(),
    staleTime: 60 * 1000, // 1 min
  });
}

/**
 * Fetches the single top (most dangerous) nemesis.
 */
export function useTopNemesis() {
  return useQuery({
    queryKey: playerKeys.topNemesis(),
    queryFn: () => playerService.getTopNemesis(),
    staleTime: 60 * 1000,
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

/**
 * Updates the player's name / avatar. Invalidates the profile cache on success.
 */
export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateProfileRequest) => playerService.updateProfile(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: playerKeys.profile() });
    },
  });
}

/**
 * Quick avatar-only update mutation.
 */
export function useUpdateAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateAvatarRequest) => playerService.updateAvatar(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: playerKeys.profile() });
    },
  });
}
