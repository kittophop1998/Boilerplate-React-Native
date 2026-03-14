// ─── StampCard Component — Stamp Duel ────────────────────────────────────────
// Renders a stamp card with rarity border, artwork, 4-direction power stats,
// and optional ability badge. Modern Minimalist aesthetic.
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Radius, FontWeight } from '@theme/index';
import type { StampCard as StampCardType } from '@game/stamp';

// ─── Rarity helpers ───────────────────────────────────────────────────────────
const RARITY_COLORS: Record<string, string> = {
  common: Colors.rarityCommon,
  uncommon: Colors.rarityUncommon,
  rare: Colors.rarityRare,
  epic: Colors.rarityEpic,
  legendary: Colors.rarityLegendary,
};

const RARITY_LABELS: Record<string, string> = {
  common: 'C',
  uncommon: 'U',
  rare: 'R',
  epic: 'E',
  legendary: 'L',
};

// ─── Props ────────────────────────────────────────────────────────────────────
interface StampCardProps {
  card: StampCardType;
  size?: 'small' | 'medium' | 'large';
  isSelected?: boolean;
  isOwned?: boolean;         // grey out if not owned (opponent cell etc.)
  onPress?: () => void;
  disabled?: boolean;
}

const SIZES = {
  small:  { width: 72,  height: 90,  artSize: 36, nameFontSize: 8,  powerSize: 9  },
  medium: { width: 104, height: 130, artSize: 52, nameFontSize: 10, powerSize: 11 },
  large:  { width: 148, height: 188, artSize: 76, nameFontSize: 13, powerSize: 13 },
};

export default function StampCard({
  card,
  size = 'medium',
  isSelected = false,
  isOwned = true,
  onPress,
  disabled = false,
}: StampCardProps) {
  const dim = SIZES[size];
  const rarityColor = RARITY_COLORS[card.rarity] ?? Colors.rarityCommon;
  const isLegendaryOrEpic = card.rarity === 'legendary' || card.rarity === 'epic';

  const cardStyle = [
    styles.card,
    {
      width: dim.width,
      height: dim.height,
      borderColor: rarityColor,
      borderWidth: card.rarity === 'legendary' ? 2.5 : card.rarity === 'epic' ? 2 : 1.5,
    },
    isSelected && styles.cardSelected,
    !isOwned && styles.cardUnowned,
    isLegendaryOrEpic && {
      shadowColor: rarityColor,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 8,
    },
  ];

  const content = (
    <View style={cardStyle}>
      {/* ── Rarity badge ── */}
      <View style={[styles.rarityBadge, { backgroundColor: rarityColor }]}>
        <Text style={styles.rarityText}>{RARITY_LABELS[card.rarity]}</Text>
      </View>

      {/* ── Artwork area ── */}
      <View style={[styles.artworkArea, { width: dim.artSize, height: dim.artSize, backgroundColor: card.artworkColor }]}>
        <Text style={{ fontSize: dim.artSize * 0.48 }}>{card.artworkEmoji}</Text>
      </View>

      {/* ── Card name ── */}
      <Text style={[styles.cardName, { fontSize: dim.nameFontSize }]} numberOfLines={1}>
        {card.name}
      </Text>

      {/* ── 4-direction power grid ── */}
      <View style={styles.powerGrid}>
        {/* Top */}
        <View style={[styles.powerRow, styles.powerRowTop]}>
          <PowerStat value={card.power.top} size={dim.powerSize} />
        </View>
        {/* Middle row: Left - [space] - Right */}
        <View style={styles.powerMiddle}>
          <PowerStat value={card.power.left} size={dim.powerSize} />
          <View style={styles.powerCenter} />
          <PowerStat value={card.power.right} size={dim.powerSize} />
        </View>
        {/* Bottom */}
        <View style={[styles.powerRow, styles.powerRowBottom]}>
          <PowerStat value={card.power.bottom} size={dim.powerSize} />
        </View>
      </View>

      {/* ── Ability badge ── */}
      {card.ability && (
        <View style={styles.abilityBadge}>
          <Text style={styles.abilityIcon}>{card.ability.icon}</Text>
        </View>
      )}

      {/* ── Selected overlay ── */}
      {isSelected && <View style={styles.selectedOverlay} />}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.8} onPress={onPress} disabled={disabled}>
        {content}
      </TouchableOpacity>
    );
  }
  return content;
}

// ─── Power stat sub-component ─────────────────────────────────────────────────
function PowerStat({ value, _direction, size }: { value: number; _direction?: string; size: number }) {
  const isHigh = value >= 7;
  const isLow = value <= 3;
  return (
    <View style={[styles.powerStat, { width: size + 6, height: size + 6 }]}>
      <Text
        style={[
          styles.powerValue,
          { fontSize: size },
          isHigh && styles.powerHigh,
          isLow && styles.powerLow,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: Spacing.xs,
    paddingHorizontal: Spacing.xs,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 3,
  },
  cardSelected: {
    borderColor: Colors.accent,
    borderWidth: 2.5,
    transform: [{ scale: 1.05 }],
  },
  cardUnowned: {
    opacity: 0.45,
  },
  rarityBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 16,
    height: 16,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rarityText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: FontWeight.bold,
  },
  artworkArea: {
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  cardName: {
    color: Colors.textPrimary,
    fontWeight: FontWeight.semiBold,
    textAlign: 'center',
    paddingHorizontal: 2,
    marginBottom: 2,
  },
  powerGrid: {
    width: '100%',
    alignItems: 'center',
  },
  powerRow: {
    width: '100%',
    alignItems: 'center',
  },
  powerRowTop: { marginBottom: 0 },
  powerRowBottom: { marginTop: 0 },
  powerMiddle: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  powerCenter: { flex: 1 },
  powerStat: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 4,
  },
  powerValue: {
    color: Colors.textPrimary,
    fontWeight: FontWeight.bold,
  },
  powerHigh: { color: Colors.accent },
  powerLow: { color: Colors.inactive },
  abilityBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  abilityIcon: { fontSize: 10 },
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.accentLight,
    borderRadius: Radius.md,
  },
});
