// ─── Role Service ─────────────────────────────────────────────────────────────
// Handles heist role catalog, equipping, unlocking and skill upgrades.
// ─────────────────────────────────────────────────────────────────────────────
import api from './api';
import type { HeistRole } from '@game/game';

// ── Request / Response types ──────────────────────────────────────────────────
export interface EquipRoleRequest {
  roleId: string;
}

export interface UnlockRoleRequest {
  roleId: string;
}

export interface UpgradeSkillRequest {
  roleId: string;
  skillId: string;
}

export interface MutationResponse {
  success: boolean;
  message: string;
}

export interface UpgradeSkillResponse extends MutationResponse {
  newLevel?: number;
}

// ── Endpoints ─────────────────────────────────────────────────────────────────
const BASE = '/roles';

export const roleService = {
  /**
   * GET /roles
   * Returns the full role catalog with player ownership flags.
   */
  getRoles: () =>
    api.get<HeistRole[]>(BASE).then((r) => r.data),

  /**
   * GET /roles/:id
   * Returns a single role's full detail.
   */
  getRoleById: (roleId: string) =>
    api.get<HeistRole>(`${BASE}/${roleId}`).then((r) => r.data),

  /**
   * POST /roles/equip
   * Sets the player's currently equipped role.
   */
  equipRole: (body: EquipRoleRequest) =>
    api.post<MutationResponse>(`${BASE}/equip`, body).then((r) => r.data),

  /**
   * POST /roles/unlock
   * Purchases a role using vault gold (deducted server-side).
   */
  unlockRole: (body: UnlockRoleRequest) =>
    api.post<MutationResponse>(`${BASE}/unlock`, body).then((r) => r.data),

  /**
   * POST /roles/upgrade-skill
   * Levels up an active or passive skill for a role.
   */
  upgradeSkill: (body: UpgradeSkillRequest) =>
    api.post<UpgradeSkillResponse>(`${BASE}/upgrade-skill`, body).then((r) => r.data),
};

export default roleService;
