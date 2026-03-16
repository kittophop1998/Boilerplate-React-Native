// ─── Heist — Role Library Screen (สมุดสะสมโจร) ───────────────────────────────
// Filter tabs by rarity · 4-column card grid with cartoon avatar + name below
// Owned/locked states · Bottom-sheet modal with skills & upgrade
// ─────────────────────────────────────────────────────────────────────────────
import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
  FlatList, Modal, ScrollView, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@theme/index';
import { useGameStore } from '../store/gameStore';
import type { HeistRole, RoleRarity } from '@game/game';
import { SkiaGlowButton } from '@components/skia';

const { width: W } = Dimensions.get('window');

// ── Grid layout — 3 columns ───────────────────────────────────────────────────
const COLS = 3;
const GRID_PAD = Spacing.md;
const CARD_GAP = 12;
const CARD_W = (W - GRID_PAD * 2 - CARD_GAP * (COLS - 1)) / COLS;
const CARD_H = CARD_W * 1.45;

type Props = { navigation?: any };

// ── Rarity meta ───────────────────────────────────────────────────────────────
type FilterKey = 'all' | RoleRarity;

interface RarityMeta {
  label: string;
  color: string;        // pill background when active
  textColor: string;    // text on active pill
  cardTop: string;      // card avatar area bg
  cardBottom: string;   // card name area bg
  border: string;       // card border
}

const RARITY_META: Record<RoleRarity, RarityMeta> = {
  common: {
    label: 'COMMON',
    color: '#E8E4F5',
    textColor: '#4A3572',
    cardTop: '#C7E8F5',
    cardBottom: '#FFFFFF',
    border: '#A8D8EA',
  },
  rare: {
    label: 'RARE',
    color: '#51E5FF',
    textColor: '#003B4A',
    cardTop: '#FFD580',
    cardBottom: '#FFFFFF',
    border: '#FFC14D',
  },
  epic: {
    label: 'EPIC',
    color: '#FF6B6B',
    textColor: '#FFFFFF',
    cardTop: '#A8E6A3',
    cardBottom: '#FFFFFF',
    border: '#5DBD58',
  },
  legendary: {
    label: 'LEGENDARY',
    color: '#FFD23F',
    textColor: '#4A3572',
    cardTop: '#FFD580',
    cardBottom: '#FFF5CC',
    border: '#FFD23F',
  },
};

const FILTER_TABS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'ALL ROLES' },
  { key: 'common', label: 'COMMON' },
  { key: 'rare', label: 'RARE' },
  { key: 'epic', label: 'EPIC' },
  { key: 'legendary', label: 'LEGENDARY' },
];

// ── Avatar background colours cycling (for cards without rarity-specific bg) ─
const AVATAR_BG_CYCLE = ['#C7E8F5', '#FFD580', '#A8E6A3', '#F5C6D0', '#D4C5F9'];

// ─────────────────────────────────────────────────────────────────────────────
// ── Filter Tab Bar ────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
function FilterTabs({
  active,
  onChange,
}: {
  active: FilterKey;
  onChange: (k: FilterKey) => void;
}) {
  return (
    <View style={tabStyles.container}>
      {FILTER_TABS.map((tab) => {
        const isActive = tab.key === active;
        const rarityMeta = tab.key !== 'all' ? RARITY_META[tab.key as RoleRarity] : null;
        const activeBg = rarityMeta ? rarityMeta.color : '#FFFFFF';
        const activeText = rarityMeta ? rarityMeta.textColor : '#4A3572';

        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onChange(tab.key)}
            activeOpacity={0.75}
            style={[
              tabStyles.pill,
              isActive && { backgroundColor: activeBg },
            ]}
          >
            <Text style={[tabStyles.label, isActive && { color: activeText }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── Role Card (compact, 4-per-row) ───────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
function RoleCard({
  role,
  index,
  onPress,
}: {
  role: HeistRole;
  index: number;
  onPress: () => void;
}) {
  const meta = RARITY_META[role.rarity];
  const avatarBg = role.isOwned
    ? meta.cardTop
    : AVATAR_BG_CYCLE[index % AVATAR_BG_CYCLE.length];
  const nameBg = role.isOwned ? meta.cardBottom : '#F0EDF8';
  const borderColor = role.isOwned ? meta.border : 'rgba(74,53,114,0.15)';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.82}
      style={[
        cardSt.wrapper,
        { width: CARD_W, borderColor },
        !role.isOwned && cardSt.locked,
      ]}
    >
      {/* ── Avatar area ─────────────────────────────────────────────────── */}
      <View style={[cardSt.avatarArea, { backgroundColor: avatarBg }]}>
        {/* Number badge top-left */}
        <View style={cardSt.numBadge}>
          <Text style={cardSt.numText}>{index + 1}</Text>
        </View>

        {/* Owned checkmark top-right */}
        {role.isOwned && (
          <View style={cardSt.checkBadge}>
            <Text style={cardSt.checkText}>✓</Text>
          </View>
        )}

        {/* Equipped star indicator */}
        {role.isEquipped && (
          <View style={cardSt.starBadge}>
            <Text style={cardSt.starText}>★</Text>
          </View>
        )}

        {/* Character emoji / lock */}
        <Text style={[cardSt.avatar, !role.isOwned && cardSt.lockedAvatar]}>
          {role.isOwned ? role.icon : '🔒'}
        </Text>
      </View>

      {/* ── Name area ───────────────────────────────────────────────────── */}
      <View style={[cardSt.nameArea, { backgroundColor: nameBg }]}>
        <Text style={cardSt.roleName} numberOfLines={1} adjustsFontSizeToFit>
          {role.name.replace(/^The /, '')}
        </Text>
        {!role.isOwned && (
          <Text style={cardSt.costText} numberOfLines={1}>
            🏦 {role.unlockCost >= 1000
              ? `${(role.unlockCost / 1000).toFixed(role.unlockCost % 1000 === 0 ? 0 : 1)}K`
              : role.unlockCost}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── Role Detail Modal (bottom sheet) ─────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
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
  const meta = RARITY_META[role.rarity];
  const canAffordUnlock = vaultGold >= role.unlockCost;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={modalSt.overlay}>
        <View style={modalSt.sheet}>
          {/* Drag handle */}
          <View style={modalSt.handle} />

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* ── Card-style header ──────────────────────────────────────── */}
            <View style={[modalSt.heroCard, { backgroundColor: meta.cardTop }]}>
              <Text style={modalSt.heroIcon}>{role.isOwned ? role.icon : '🔒'}</Text>
              {role.isOwned && (
                <View style={modalSt.heroCheck}>
                  <Text style={modalSt.heroCheckText}>✓</Text>
                </View>
              )}
            </View>

            {/* Rarity pill */}
            <View style={modalSt.rarityRow}>
              <View style={[modalSt.rarityPill, { backgroundColor: meta.color }]}>
                <Text style={[modalSt.rarityLabel, { color: meta.textColor }]}>
                  ★ {meta.label}
                </Text>
              </View>
              {role.isEquipped && (
                <View style={modalSt.equippedPill}>
                  <Text style={modalSt.equippedPillText}>EQUIPPED</Text>
                </View>
              )}
            </View>

            <Text style={modalSt.name}>{role.name}</Text>
            <Text style={modalSt.description}>{role.description}</Text>

            {/* ── Skills ────────────────────────────────────────────────── */}
            <Text style={modalSt.sectionTitle}>SKILLS</Text>
            {[role.passiveSkill, role.activeSkill].map((skill) => (
              <View key={skill.id} style={modalSt.skillCard}>
                <View style={modalSt.skillHeader}>
                  <View
                    style={[
                      modalSt.skillTypePill,
                      skill.type === 'passive' ? modalSt.skillPillPassive : modalSt.skillPillActive,
                    ]}
                  >
                    <Text
                      style={[
                        modalSt.skillTypeText,
                        skill.type === 'passive' ? modalSt.skillTextPassive : modalSt.skillTextActive,
                      ]}
                    >
                      {skill.type.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={modalSt.skillName}>{skill.name}</Text>
                  <Text style={modalSt.skillLevel}>
                    Lv.{skill.level}/{skill.maxLevel}
                  </Text>
                </View>
                <Text style={modalSt.skillDesc}>{skill.description}</Text>
                {skill.cooldown > 0 && (
                  <Text style={modalSt.skillCooldown}>⏱ Cooldown: {skill.cooldown}s</Text>
                )}
                {role.isOwned && skill.level < skill.maxLevel && (
                  <TouchableOpacity
                    style={[
                      modalSt.upgradeBtn,
                      vaultGold < skill.upgradeCost && modalSt.upgradeBtnDisabled,
                    ]}
                    onPress={() => onUpgradeSkill(skill.id)}
                    disabled={vaultGold < skill.upgradeCost}
                  >
                    <Text style={modalSt.upgradeBtnText}>
                      ⬆ Upgrade  🏦 {skill.upgradeCost.toLocaleString()}
                    </Text>
                  </TouchableOpacity>
                )}
                {skill.level >= skill.maxLevel && (
                  <View style={modalSt.maxLevelBadge}>
                    <Text style={modalSt.maxLevelText}>MAX LEVEL ✓</Text>
                  </View>
                )}
              </View>
            ))}
            <View style={modalSt.spacer} />
          </ScrollView>

          {/* ── CTA button ────────────────────────────────────────────────── */}
          <View style={modalSt.ctaWrap}>
            {role.isOwned ? (
              <SkiaGlowButton
                label={role.isEquipped ? '✓ CURRENTLY EQUIPPED' : `EQUIP ${role.icon} ${role.name}`}
                onPress={onEquip}
                disabled={role.isEquipped}
                color={role.isEquipped ? Colors.shareGreen : Colors.gold}
                glowColor={role.isEquipped ? Colors.shareGreenGlow : Colors.goldGlow}
                width={W - 32}
                height={52}
              />
            ) : (
              <SkiaGlowButton
                label={
                  canAffordUnlock
                    ? `🔓 UNLOCK — 🏦 ${role.unlockCost.toLocaleString()}`
                    : `🔒 Need 🏦 ${role.unlockCost.toLocaleString()} Gold`
                }
                onPress={onUnlock}
                disabled={!canAffordUnlock}
                color={canAffordUnlock ? Colors.gold : Colors.inactive}
                glowColor={canAffordUnlock ? Colors.goldGlow : 'transparent'}
                width={W - 32}
                height={52}
              />
            )}
          </View>

          {/* Close button */}
          <TouchableOpacity onPress={onClose} style={modalSt.closeBtn}>
            <Text style={modalSt.closeBtnText}>✕ CLOSE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── Main Screen ───────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
export default function RoleLibraryScreen({ navigation }: Props) {
  const { roles, vaultGold, equipRole, unlockRole, upgradeSkill } = useGameStore();
  const [filter, setFilter] = useState<FilterKey>('all');
  const [selectedRole, setSelectedRole] = useState<HeistRole | null>(null);

  const filtered = useMemo(
    () => (filter === 'all' ? roles : roles.filter((r) => r.rarity === filter)),
    [roles, filter],
  );

  return (
    <SafeAreaView style={screenSt.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent hidden={true} />

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View style={screenSt.header}>
        <TouchableOpacity style={screenSt.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Text style={screenSt.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={screenSt.title}>📖 ROLE LIBRARY</Text>
        <View style={screenSt.goldBadge}>
          <Text style={screenSt.goldText}>🏦 {vaultGold.toLocaleString()}</Text>
        </View>
      </View>
      <Text style={screenSt.subtitle}>
        {roles.filter((r) => r.isOwned).length}/{roles.length} Roles Owned
      </Text>

      {/* ── Rarity filter tabs ──────────────────────────────────────────── */}
      <FilterTabs active={filter} onChange={setFilter} />

      {/* ── 4-column grid ───────────────────────────────────────────────── */}
      <FlatList
        data={filtered}
        keyExtractor={(r) => r.id}
        numColumns={COLS}
        key={`grid-${COLS}`}
        contentContainerStyle={screenSt.grid}
        columnWrapperStyle={screenSt.row}
        renderItem={({ item, index }) => (
          <RoleCard
            role={item}
            index={index}
            onPress={() => setSelectedRole(item)}
          />
        )}
      />

      {/* ── Detail Modal ─────────────────────────────────────────────────── */}
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
            setSelectedRole((prev) => (prev ? { ...prev, isOwned: true } : null));
          }}
          onUpgradeSkill={(skillId) => {
            upgradeSkill(selectedRole.id, skillId);
          }}
        />
      )}
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── Styles ────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

// Screen
const screenSt = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: GRID_PAD,
    paddingTop: Spacing.sm,
    paddingBottom: 2,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: { color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: FontWeight.bold as any, lineHeight: 20 },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold as any,
    color: Colors.textPrimary,
  },
  goldBadge: {
    backgroundColor: Colors.gold,
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  goldText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold as any,
    color: Colors.textOnYellow,
  },
  subtitle: {
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
    opacity: 0.75,
    paddingHorizontal: GRID_PAD,
    marginBottom: Spacing.sm,
  },
  grid: {
    paddingHorizontal: GRID_PAD,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.sm,
  },
  row: { gap: CARD_GAP, marginBottom: CARD_GAP },
});

// Filter tabs
const tabStyles = StyleSheet.create({
  container: {
    paddingHorizontal: GRID_PAD,
    paddingBottom: Spacing.sm,
    paddingTop: 2,
    gap: 6,
    flexDirection: 'row',
  },
  pill: {
    flex: 1,
    backgroundColor: 'rgba(74,53,114,0.45)',
    borderRadius: Radius.full,
    paddingHorizontal: 4,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 9,
    fontWeight: FontWeight.bold as any,
    color: '#E8E0F8',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
});

// Role card
const cardSt = StyleSheet.create({
  wrapper: {
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: 2,
    // shadow
    shadowColor: 'rgba(74,53,114,0.30)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },
  locked: { opacity: 0.62 },

  // Avatar (top) section
  avatarArea: {
    height: CARD_H * 0.66,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numBadge: {
    position: 'absolute',
    top: 5,
    left: 5,
    backgroundColor: 'rgba(74,53,114,0.75)',
    borderRadius: Radius.full,
    width: 17,
    height: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numText: {
    fontSize: 9,
    fontWeight: FontWeight.bold as any,
    color: '#FFFFFF',
  },
  checkBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: Colors.shareGreen,
    borderRadius: Radius.full,
    width: 17,
    height: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: { fontSize: 9, fontWeight: FontWeight.bold as any, color: '#fff' },
  starBadge: {
    position: 'absolute',
    bottom: 4,
    right: 5,
    backgroundColor: Colors.gold,
    borderRadius: Radius.full,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  starText: { fontSize: 8, color: Colors.textOnYellow, fontWeight: FontWeight.bold as any },
  avatar: { fontSize: CARD_W * 0.4 },
  lockedAvatar: { opacity: 0.55 },

  // Name (bottom) section
  nameArea: {
    height: CARD_H * 0.34,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  roleName: {
    fontSize: FontSize.xs - 1,
    fontWeight: FontWeight.bold as any,
    color: '#2A1A5E',
    textAlign: 'center',
  },
  costText: {
    fontSize: 8,
    color: Colors.revengeOrange,
    fontWeight: FontWeight.semiBold as any,
    marginTop: 1,
    textAlign: 'center',
  },
});

// Modal
const modalSt = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(42,26,94,0.80)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#F5F0FF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '88%',
    paddingTop: 8,
    paddingBottom: Spacing.lg,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(74,53,114,0.25)',
    marginBottom: 12,
  },
  // Hero card
  heroCard: {
    marginHorizontal: GRID_PAD,
    height: 130,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  heroIcon: { fontSize: 72 },
  heroCheck: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: Colors.shareGreen,
    borderRadius: Radius.full,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCheckText: { fontSize: 12, color: '#fff', fontWeight: FontWeight.bold as any },
  // Rarity
  rarityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: GRID_PAD,
    marginBottom: 6,
    gap: 8,
  },
  rarityPill: {
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  rarityLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.bold as any, letterSpacing: 0.5 },
  equippedPill: {
    backgroundColor: Colors.shareGreen,
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  equippedPillText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold as any,
    color: '#fff',
    letterSpacing: 0.5,
  },
  // Name & desc
  name: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold as any,
    color: '#2A1A5E',
    paddingHorizontal: GRID_PAD,
    marginBottom: 4,
  },
  description: {
    fontSize: FontSize.sm,
    color: '#5A4A8A',
    paddingHorizontal: GRID_PAD,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: FontSize.xs,
    color: '#8B7BB5',
    letterSpacing: 2,
    fontWeight: FontWeight.bold as any,
    paddingHorizontal: GRID_PAD,
    marginBottom: 8,
  },
  // Skill card
  skillCard: {
    marginHorizontal: GRID_PAD,
    marginBottom: Spacing.sm,
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.md,
    padding: Spacing.sm,
    borderWidth: 1.5,
    borderColor: 'rgba(155,126,213,0.20)',
    shadowColor: 'rgba(74,53,114,0.10)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  skillHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  skillTypePill: { borderRadius: 4, paddingHorizontal: 7, paddingVertical: 3, marginRight: 6 },
  skillPillPassive: { backgroundColor: 'rgba(155,126,213,0.18)' },
  skillPillActive: { backgroundColor: 'rgba(255,210,63,0.18)' },
  skillTypeText: { fontSize: 9, fontWeight: FontWeight.bold as any, letterSpacing: 0.5 },
  skillTextPassive: { color: Colors.electricPurple },
  skillTextActive: { color: Colors.gold },
  skillName: { flex: 1, fontSize: FontSize.sm, fontWeight: FontWeight.bold as any, color: '#2A1A5E' },
  skillLevel: { fontSize: FontSize.xs, color: '#8B7BB5' },
  skillDesc: { fontSize: FontSize.xs, color: '#5A4A8A', lineHeight: 18 },
  skillCooldown: { fontSize: FontSize.xs, color: Colors.shieldBlue, marginTop: 4 },
  upgradeBtn: {
    marginTop: 8,
    backgroundColor: Colors.gold,
    borderRadius: Radius.sm,
    padding: 8,
    alignItems: 'center',
  },
  upgradeBtnDisabled: { backgroundColor: Colors.inactive, opacity: 0.5 },
  upgradeBtnText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold as any,
    color: Colors.textOnYellow,
  },
  maxLevelBadge: {
    marginTop: 8,
    backgroundColor: 'rgba(81,229,255,0.12)',
    borderRadius: Radius.sm,
    padding: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.shareGreen,
  },
  maxLevelText: { fontSize: FontSize.xs, color: Colors.shareGreen, fontWeight: FontWeight.bold as any },
  spacer: { height: 24 },
  // CTA
  ctaWrap: { paddingHorizontal: 16, paddingBottom: 6, paddingTop: 4 },
  closeBtn: { alignItems: 'center', paddingVertical: 10 },
  closeBtnText: {
    fontSize: FontSize.sm,
    color: '#8B7BB5',
    fontWeight: FontWeight.semiBold as any,
    letterSpacing: 0.5,
  },
});
