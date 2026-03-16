// ─── Player Service ───────────────────────────────────────────────────────────
// Handles player profile fetching and mutation.
// ─────────────────────────────────────────────────────────────────────────────
import api from './api';
import type { HeistPlayer, NemesisRecord } from '@game/game';

// ── Request / Response types ──────────────────────────────────────────────────
export interface UpdateAvatarRequest {
  avatar: string; // emoji
}

export interface UpdateProfileRequest {
  name?: string;
  avatarEmoji?: string;
}

export interface PlayerProfileResponse extends HeistPlayer {
  email?: string;
  createdAt: string; // ISO date
}

// ── Endpoints ─────────────────────────────────────────────────────────────────
const BASE = '/players';

export const playerService = {
  /**
   * GET /players/me
   * Returns the current authenticated player's full profile.
   */
  getProfile: () =>
    api.get<PlayerProfileResponse>(`${BASE}/me`).then((r) => r.data),

  /**
   * PATCH /players/me
   * Updates name and/or avatar.
   */
  updateProfile: (body: UpdateProfileRequest) =>
    api.patch<PlayerProfileResponse>(`${BASE}/me`, body).then((r) => r.data),

  /**
   * PATCH /players/me/avatar
   * Quick endpoint just for avatar changes.
   */
  updateAvatar: (body: UpdateAvatarRequest) =>
    api.patch<{ avatar: string }>(`${BASE}/me/avatar`, body).then((r) => r.data),

  /**
   * GET /players/:id
   * Returns another player's public profile.
   */
  getPlayerById: (playerId: string) =>
    api.get<PlayerProfileResponse>(`${BASE}/${playerId}`).then((r) => r.data),

  /**
   * GET /players/me/nemesis
   * Returns the nemesis list for the current player.
   */
  getNemesisList: () =>
    api.get<NemesisRecord[]>(`${BASE}/me/nemesis`).then((r) => r.data),

  /**
   * GET /players/me/nemesis/top
   * Returns the single top nemesis (most times stolen from).
   */
  getTopNemesis: () =>
    api.get<NemesisRecord | null>(`${BASE}/me/nemesis/top`).then((r) => r.data),
};

export default playerService;
