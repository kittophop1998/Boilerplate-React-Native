// ─── useRolesApi ──────────────────────────────────────────────────────────────
// React Query hooks for the heist role catalog, equipping, unlocking & upgrading.
// ─────────────────────────────────────────────────────────────────────────────
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import roleService, {
  EquipRoleRequest,
  UnlockRoleRequest,
  UpgradeSkillRequest,
} from '@services/roleService';

// ── Query Keys ─────────────────────────────────────────────────────────────────
export const roleKeys = {
  all: ['roles'] as const,
  list: () => [...roleKeys.all, 'list'] as const,
  detail: (id: string) => [...roleKeys.all, 'detail', id] as const,
};

// ── Queries ────────────────────────────────────────────────────────────────────

/**
 * Full role catalog with ownership + equipped flags for the current player.
 */
export function useRoles() {
  return useQuery({
    queryKey: roleKeys.list(),
    queryFn: () => roleService.getRoles(),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Single role detail (useful for a role detail / upgrade screen).
 */
export function useRoleDetail(roleId: string) {
  return useQuery({
    queryKey: roleKeys.detail(roleId),
    queryFn: () => roleService.getRoleById(roleId),
    enabled: !!roleId,
    staleTime: 5 * 60 * 1000,
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

/**
 * Equip a role. Refreshes the catalog so equipped flags update everywhere.
 */
export function useEquipRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: EquipRoleRequest) => roleService.equipRole(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: roleKeys.list() });
    },
  });
}

/**
 * Purchase (unlock) a role using vault gold.
 * Refreshes catalog + player profile (vault gold balance changes).
 */
export function useUnlockRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UnlockRoleRequest) => roleService.unlockRole(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: roleKeys.list() });
      // Invalidate player profile to refresh vaultGold balance
      qc.invalidateQueries({ queryKey: ['player', 'profile'] });
    },
  });
}

/**
 * Upgrade an active or passive skill.
 * Refreshes the specific role detail so the new level is reflected.
 */
export function useUpgradeSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpgradeSkillRequest) => roleService.upgradeSkill(body),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: roleKeys.detail(variables.roleId) });
      qc.invalidateQueries({ queryKey: roleKeys.list() });
      qc.invalidateQueries({ queryKey: ['player', 'profile'] });
    },
  });
}
