// ─── Heist — Role Library Screen (สมุดสะสมโจร) ───────────────────────────────
// Grid 2xN of role cards, owned/locked states, modal with upgrade
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
  FlatList, Modal, ScrollView, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@theme/index';
import { useGameStore } from '../store/gameStore';
import type { HeistRole } from '@game/game';
import { SkiaBadge, SkiaGlassCard, SkiaGlowButton } from '@components/skia';

const { width: W } = Dimensions.get('window');
const CARD_GAP = Spacing.md;
const CARD_W = (W - Spacing.md * 2 - CARD_GAP) / 2;
const CARD_H = 170;

type Props = { navigation?: any };

const RARITY_COLORS: Record<string, string> = {
  common: Colors.textSecondary,
  rare: Colors.shieldBlue,
  epic: Colors.electricPurple,
  legendary: Colors.gold,
};

// ── Role Card ─────────────────────────────────────────────────────────────────
function RoleCard({ role, onPress }: { role: HeistRole; onPress: () => void }) {
  const rarityColor = RARITY_COLORS[role.rarity] ?? Colors.textSecondary;
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[styles.cardWrapper, !role.isOwned && styles.cardLocked]}>
      <SkiaGlassCard
        width={CARD_W}
        height={CARD_H}
        borderRadius={Radius.lg}
        animateBorder={role.isOwned}
        borderColor={role.isOwned ? rarityColor : Colors.divider}
        fillColor={role.isOwned ? Colors.cardGlass : 'rgba(255,255,255,0.04)'}
        glowColor={role.isOwned ? `${rarityColor}44` : 'transparent'}
      >
        {/* Rarity badge — top right */}
        <View style={styles.rarityBadge}>
          <SkiaBadge
            label={role.rarity.toUpperCase()}
            color={rarityColor}
            textColor="#fff"
            fontSize={7}
            paddingH={5}
            paddingV={2}
            borderRadius={4}
            animated={role.isOwned}
          />
        </View>

        {/* Center content */}
        <View style={styles.cardCenter}>
          {/* Icon */}
          <Text style={[styles.cardIcon, !role.isOwned && styles.lockedIcon]}>
            {role.isOwned ? role.icon : '🔒'}
          </Text>

          {/* Name */}
          <Text style={[styles.cardName, !role.isOwned && styles.lockedText]} numberOfLines={1}>
            {role.name}
          </Text>

          {/* Equipped badge */}
          {role.isEquipped && (
            <View style={styles.equippedBadge}>
              <SkiaBadge
                label="EQUIPPED"
                color={Colors.shareGreen}
                textColor="#fff"
                fontSize={8}
                paddingH={8}
                paddingV={2}
                animated
              />
            </View>
          )}

          {/* Lock cost */}
          {!role.isOwned && (
            <Text style={styles.lockCost}>🏦 {role.unlockCost.toLocaleString()}</Text>
          )}
        </View>
      </SkiaGlassCard>
    </TouchableOpacity>
  );
}

// ── Role Detail Modal ─────────────────────────────────────────────────────────
function RoleModal({
  role,
  vaultGold,
  onClose,
  onEquip,
  onUnlock,
  onUpgradeSkill,
}: {
  role: HeistRole;
  vaultGold: number;
  onClose: () => void;
  onEquip: () => void;
  onUnlock: () => void;
  onUpgradeSkill: (skillId: string) => void;
}) {
  const rarityColor = RARITY_COLORS[role.rarity] ?? Colors.textSecondary;
  const canAffordUnlock = vaultGold >= role.unlockCost;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.sheet}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={modalStyles.header}>
              <Text style={modalStyles.icon}>{role.icon}</Text>
              <View style={modalStyles.headerText}>
                <Text style={modalStyles.name}>{role.name}</Text>
                <Text style={[modalStyles.rarity, { color: rarityColor }]}>
                  ★ {role.rarity.toUpperCase()}
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={modalStyles.closeBtn}>
                <Text style={modalStyles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={modalStyles.description}>{role.description}</Text>

            {/* Skills */}
            <Text style={modalStyles.sectionTitle}>SKILLS</Text>
            {[role.passiveSkill, role.activeSkill].map((skill) => (
              <View key={skill.id} style={modalStyles.skillCard}>
                <View style={modalStyles.skillHeader}>
                  <View style={[modalStyles.skillTypeBadge, { backgroundColor: skill.type === 'passive' ? Colors.surfaceElevated : Colors.goldLight }]}>
                    <Text style={[modalStyles.skillTypeText, { color: skill.type === 'passive' ? Colors.textSecondary : Colors.gold }]}>
                      {skill.type.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={modalStyles.skillName}>{skill.name}</Text>
                  <Text style={modalStyles.skillLevel}>Lv.{skill.level}/{skill.maxLevel}</Text>
                </View>
                <Text style={modalStyles.skillDesc}>{skill.description}</Text>
                {skill.cooldown > 0 && (
                  <Text style={modalStyles.skillCooldown}>Cooldown: {skill.cooldown}s</Text>
                )}
                {/* Upgrade button */}
                {role.isOwned && skill.level < skill.maxLevel && (
                  <TouchableOpacity
                    style={[
                      modalStyles.upgradeBtn,
                      vaultGold < skill.upgradeCost && modalStyles.upgradeBtnDisabled,
                    ]}
                    onPress={() => onUpgradeSkill(skill.id)}
                    disabled={vaultGold < skill.upgradeCost}
                  >
                    <Text style={modalStyles.upgradeBtnText}>
                      ⬆ Upgrade  🏦 {skill.upgradeCost.toLocaleString()}
                    </Text>
                  </TouchableOpacity>
                )}
                {skill.level >= skill.maxLevel && (
                  <View style={modalStyles.maxLevelBadge}>
                    <Text style={modalStyles.maxLevelText}>MAX LEVEL ✓</Text>
                  </View>
                )}
              </View>
            ))}

            <View style={modalStyles.spacer} />
          </ScrollView>

          {/* Action button */}
          {role.isOwned ? (
            <View style={styles.actionBtn}>
              <SkiaGlowButton
                label={role.isEquipped ? '✓ CURRENTLY EQUIPPED' : `EQUIP ${role.icon} ${role.name}`}
                onPress={onEquip}
                disabled={role.isEquipped}
                color={role.isEquipped ? Colors.shareGreen : Colors.gold}
                glowColor={role.isEquipped ? Colors.shareGreenGlow : Colors.goldGlow}
                width={320}
                height={52}
              />
            </View>
          ) : (
            <View style={styles.actionBtn}>
              <SkiaGlowButton
                label={canAffordUnlock
                  ? `🔓 UNLOCK — 🏦 ${role.unlockCost.toLocaleString()}`
                  : `🔒 Need 🏦 ${role.unlockCost.toLocaleString()} Gold`}
                onPress={onUnlock}
                disabled={!canAffordUnlock}
                color={canAffordUnlock ? Colors.gold : Colors.inactive}
                glowColor={canAffordUnlock ? Colors.goldGlow : 'transparent'}
                width={320}
                height={52}
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function RoleLibraryScreen({ navigation: _navigation }: Props) {
  const { roles, vaultGold, equipRole, unlockRole, upgradeSkill } = useGameStore();
  const [selectedRole, setSelectedRole] = useState<HeistRole | null>(null);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>📖 ROLE LIBRARY</Text>
          <SkiaBadge
            label={`🏦 ${vaultGold.toLocaleString()}`}
            color={Colors.gold}
            textColor={Colors.background}
            fontSize={FontSize.sm}
            paddingH={10}
            paddingV={4}
            borderRadius={Radius.sm}
          />
        </View>
        <Text style={styles.subtitle}>
          {roles.filter((r) => r.isOwned).length}/{roles.length} Roles Owned
        </Text>

        {/* Grid */}
        <FlatList
          data={roles}
          keyExtractor={(r) => r.id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <RoleCard role={item} onPress={() => setSelectedRole(item)} />
          )}
        />

        {/* Modal */}
        {selectedRole && (
          <RoleModal
            role={selectedRole}
            vaultGold={vaultGold}
            onClose={() => setSelectedRole(null)}
            onEquip={() => {
              equipRole(selectedRole.id);
              setSelectedRole(null);
            }}
            onUnlock={() => {
              unlockRole(selectedRole.id);
              setSelectedRole((prev) => prev ? { ...prev, isOwned: true } : null);
            }}
            onUpgradeSkill={(skillId) => {
              upgradeSkill(selectedRole.id, skillId);
            }}
          />
        )}
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingTop: Spacing.md },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.bold as any, color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.xs, color: Colors.textSecondary, paddingHorizontal: Spacing.md, marginTop: 2, marginBottom: Spacing.md },

  // Grid
  grid: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xl },
  row: { gap: CARD_GAP, marginBottom: CARD_GAP },
  cardWrapper: { borderRadius: Radius.lg, overflow: 'hidden' },
  cardLocked: { opacity: 0.55 },
  rarityBadge: { position: 'absolute', top: 8, right: 8, zIndex: 1 },
  cardCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
    paddingTop: 8,
    paddingBottom: 8,
  },
  cardIcon: { fontSize: 44, marginBottom: 8, textAlign: 'center' },
  lockedIcon: { opacity: 0.6 },
  cardName: { fontSize: FontSize.sm, fontWeight: FontWeight.bold as any, color: Colors.textPrimary, textAlign: 'center' },
  lockedText: { color: Colors.textSecondary },
  equippedBadge: { marginTop: 6, zIndex: 1 },
  lockCost: { fontSize: FontSize.xs, color: Colors.gold, marginTop: 6 },

  // Action button wrap
  actionBtn: { alignItems: 'center', paddingVertical: Spacing.md },
});

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.78)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: Colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%', paddingTop: Spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, marginBottom: Spacing.sm },
  icon: { fontSize: 44, marginRight: Spacing.sm },
  headerText: { flex: 1 },
  name: { fontSize: FontSize.xl, fontWeight: FontWeight.bold as any, color: Colors.textPrimary },
  rarity: { fontSize: FontSize.xs, letterSpacing: 1 },
  closeBtn: { padding: 8 },
  closeBtnText: { fontSize: FontSize.lg, color: Colors.textSecondary },
  description: { fontSize: FontSize.sm, color: Colors.textSecondary, paddingHorizontal: Spacing.md, marginBottom: Spacing.md, lineHeight: 20 },
  sectionTitle: { fontSize: FontSize.xs, color: Colors.textDisabled, letterSpacing: 2, paddingHorizontal: Spacing.md, marginBottom: 8 },
  skillCard: { marginHorizontal: Spacing.md, marginBottom: Spacing.sm, backgroundColor: Colors.cardBg, borderRadius: Radius.md, padding: Spacing.sm, borderWidth: 1, borderColor: Colors.divider },
  skillHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  skillTypeBadge: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, marginRight: 6 },
  skillTypeText: { fontSize: 9, fontWeight: FontWeight.bold as any, letterSpacing: 0.5 },
  skillName: { flex: 1, fontSize: FontSize.sm, fontWeight: FontWeight.bold as any, color: Colors.textPrimary },
  skillLevel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  skillDesc: { fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 18 },
  skillCooldown: { fontSize: FontSize.xs, color: Colors.shieldBlue, marginTop: 4 },
  upgradeBtn: { marginTop: 8, backgroundColor: Colors.gold, borderRadius: Radius.sm, padding: 8, alignItems: 'center' },
  upgradeBtnDisabled: { backgroundColor: Colors.inactive, opacity: 0.5 },
  upgradeBtnText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold as any, color: Colors.background },
  maxLevelBadge: { marginTop: 8, backgroundColor: 'rgba(0,230,118,0.15)', borderRadius: Radius.sm, padding: 6, alignItems: 'center', borderWidth: 1, borderColor: Colors.shareGreen },
  maxLevelText: { fontSize: FontSize.xs, color: Colors.shareGreen, fontWeight: FontWeight.bold as any },
  spacer: { height: 16 },
});
