// ─── Lobby Service ────────────────────────────────────────────────────────────
// Handles party creation, joining, leaving and matchmaking queue.
// ─────────────────────────────────────────────────────────────────────────────
import api from './api';
import type { Party, HeistPlayer } from '@game/game';

// ── Request / Response types ──────────────────────────────────────────────────
export interface CreatePartyResponse {
  party: Party;
}

export interface JoinPartyRequest {
  partyCode: string;
}

export interface JoinPartyResponse {
  party: Party;
}

export interface MatchmakingStatusResponse {
  status: 'searching' | 'found' | 'cancelled';
  roomId?: string;
  estimatedWaitSeconds?: number;
}

export interface RoomPlayersResponse {
  roomId: string;
  players: HeistPlayer[];
  phase: string;
}

// ── Endpoints ─────────────────────────────────────────────────────────────────
const BASE = '/lobby';

export const lobbyService = {
  /**
   * POST /lobby/party
   * Creates a new party; returns party info including the invite code.
   */
  createParty: () =>
    api.post<CreatePartyResponse>(`${BASE}/party`).then((r) => r.data),

  /**
   * POST /lobby/party/join
   * Joins an existing party using a 6-character code.
   */
  joinParty: (body: JoinPartyRequest) =>
    api.post<JoinPartyResponse>(`${BASE}/party/join`, body).then((r) => r.data),

  /**
   * DELETE /lobby/party/leave
   * Leaves the current party (disbands if the leader leaves).
   */
  leaveParty: () =>
    api.delete<{ success: boolean }>(`${BASE}/party/leave`).then((r) => r.data),

  /**
   * GET /lobby/party/current
   * Returns the current party state for the authenticated player.
   */
  getCurrentParty: () =>
    api.get<Party | null>(`${BASE}/party/current`).then((r) => r.data),

  /**
   * POST /lobby/matchmaking/start
   * Enters the matchmaking queue (solo or with current party).
   */
  startMatchmaking: () =>
    api.post<{ success: boolean }>(`${BASE}/matchmaking/start`).then((r) => r.data),

  /**
   * DELETE /lobby/matchmaking/cancel
   * Cancels the current matchmaking search.
   */
  cancelMatchmaking: () =>
    api.delete<{ success: boolean }>(`${BASE}/matchmaking/cancel`).then((r) => r.data),

  /**
   * GET /lobby/matchmaking/status
   * Polls matchmaking status. Use polling or switch to WebSocket when ready.
   */
  getMatchmakingStatus: () =>
    api.get<MatchmakingStatusResponse>(`${BASE}/matchmaking/status`).then((r) => r.data),

  /**
   * GET /lobby/room/:roomId/players
   * Returns all players currently in a game room.
   */
  getRoomPlayers: (roomId: string) =>
    api.get<RoomPlayersResponse>(`${BASE}/room/${roomId}/players`).then((r) => r.data),
};

export default lobbyService;
