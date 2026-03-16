// ─── Transfer Service ─────────────────────────────────────────────────────────
// Handles vault gold transfers between players and match-money vault deposits.
// ─────────────────────────────────────────────────────────────────────────────
import api from './api';
import type { TransferPayload } from '@game/game';

// ── Request / Response types ──────────────────────────────────────────────────
export interface SendGoldRequest
  extends Omit<TransferPayload, 'timestamp'> {}

export interface SendGoldResponse {
  success: boolean;
  message: string;
}

export interface DepositRequest {
  matchMoney: number;
  roleId: string; // to determine server-side fee
}

export interface DepositResponse {
  deposited: number;
  fee: number;
  newVaultGold: number;
}

export interface TransferHistoryItem {
  id: string;
  fromPlayerId: string;
  fromPlayerName: string;
  toPlayerId: string;
  toPlayerName: string;
  amount: number;
  message: string;
  timestamp: string; // ISO date
  type: 'sent' | 'received' | 'deposit';
}

// ── Endpoints ─────────────────────────────────────────────────────────────────
const BASE = '/transfers';

export const transferService = {
  /**
   * POST /transfers/send
   * Sends vault gold from the current player to another player.
   */
  sendGold: (body: SendGoldRequest) =>
    api.post<SendGoldResponse>(`${BASE}/send`, body).then((r) => r.data),

  /**
   * POST /transfers/deposit
   * Converts match money (silver) to vault gold with a fee.
   */
  depositToVault: (body: DepositRequest) =>
    api.post<DepositResponse>(`${BASE}/deposit`, body).then((r) => r.data),

  /**
   * GET /transfers/history
   * Returns the player's full transfer & deposit history.
   */
  getHistory: (page = 1, limit = 20) =>
    api
      .get<TransferHistoryItem[]>(`${BASE}/history`, { params: { page, limit } })
      .then((r) => r.data),
};

export default transferService;
