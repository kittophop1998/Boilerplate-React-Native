// ─── Core Defense — Gacha Screen (Mythical Loot) ─────────────────────────────
// Pull for auras, button sounds, avatar frames. 0.1% mythical drop rate.
// Neon Chaotic style with animated reveal
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Animated,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@theme/index';
import { useGameStore } from '../store/gameStore';
import type { LootItem, LootRarity } from '@game/game';

type Props = { navigation: any };

const RARITY_COLOR: Record<LootRarity, string> = {
  common: Colors.inactive,
  rare: Colors.neonGreen,
  epic: Colors.electricPurple,
  mythical: Colors.cyberGold,
};

const RARITY_LABEL: Record<LootRarity, string> = {
  common: 'COMMON',
  rare: 'RARE',
  epic: 'EPIC',
  mythical: '✨ MYTHICAL',
};

const DROP_RATE_DISPLAY = [
  { rarity: 'mythical' as LootRarity, rate: '0.1%', color: Colors.cyberGold },
  { rarity: 'epic' as LootRarity, rate: '5%', color: Colors.electricPurple },
  { rarity: 'rare' as LootRarity, rate: '19%', color: Colors.neonGreen },
  { rarity: 'common' as LootRarity, rate: '75.9%', color: Colors.inactive },
];

function LootCard({ item }: { item: LootItem }) {
  const color = RARITY_COLOR[item.rarity];
  return (
    <View style={[styles.lootCard, { borderColor: color }]}>
      <Text style={styles.lootIcon}>{item.icon}</Text>
      <Text style={[styles.lootRarity, { color }]}>{RARITY_LABEL[item.rarity]}</Text>
      <Text style={styles.lootName}>{item.name}</Text>
      <Text style={styles.lootDesc}>{item.description}</Text>
      <Text style={[styles.lootType, { color: Colors.textSecondary }]}>{item.type.replace('_', ' ').toUpperCase()}</Text>
    </View>
  );
}

export default function GachaScreen({ navigation }: Props) {
  const { pullGacha, lastLoot, ownedLoot, localCoins } = useGameStore();
  const [phase, setPhase] = useState<'idle' | 'pulling' | 'reveal'>('idle');
  const [displayedLoot, setDisplayedLoot] = useState<LootItem | null>(null);

  const spinAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (lastLoot && phase === 'pulling') {
      setDisplayedLoot(lastLoot);
      // Reveal animation
      Animated.sequence([
        Animated.timing(spinAnim, { toValue: 3, duration: 600, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.timing(glowAnim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
          ]),
          { iterations: 4 },
        ),
      ]).start();
      if (lastLoot.rarity === 'mythical') { Vibration.vibrate([0, 100, 50, 100, 50, 200]); }
      else if (lastLoot.rarity === 'epic') { Vibration.vibrate([0, 80, 40, 80]); }
      setPhase('reveal');
    }
  }, [lastLoot, phase, spinAnim, scaleAnim, glowAnim]);

  const handlePull = () => {
    setPhase('pulling');
    scaleAnim.setValue(0);
    spinAnim.setValue(0);
    glowAnim.setValue(0);
    setDisplayedLoot(null);
    // Spin animation while waiting
    Animated.loop(
      Animated.timing(spinAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      { iterations: 6 },
    ).start();
    pullGacha();
  };

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const revealColor = displayedLoot ? RARITY_COLOR[displayedLoot.rarity] : Colors.neonGreen;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>LOOT PULL</Text>
        <Text style={styles.coins}>🪙 {localCoins}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Pull Zone ─────────────────────────────────────────────────────── */}
        <View style={styles.pullZone}>
          {phase === 'idle' && (
            <View style={styles.idleOrb}>
              <Text style={styles.idleOrbText}>🎰</Text>
              <Text style={styles.idleOrbSub}>Pull for legendary loot</Text>
            </View>
          )}

          {phase === 'pulling' && (
            <Animated.View style={[styles.spinOrb, { transform: [{ rotate: spin }] }]}>
              <Text style={styles.spinOrbText}>⚡</Text>
            </Animated.View>
          )}

          {phase === 'reveal' && displayedLoot && (
            <Animated.View
              style={[
                styles.revealCard,
                { borderColor: revealColor, opacity: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) },
                { transform: [{ scale: scaleAnim }] },
              ]}>
              <Text style={styles.revealIcon}>{displayedLoot.icon}</Text>
              <Text style={[styles.revealRarity, { color: revealColor }]}>
                {RARITY_LABEL[displayedLoot.rarity]}
              </Text>
              <Text style={styles.revealName}>{displayedLoot.name}</Text>
              <Text style={styles.revealDesc}>{displayedLoot.description}</Text>
            </Animated.View>
          )}
        </View>

        {/* ── Pull Button ───────────────────────────────────────────────────── */}
        <TouchableOpacity
          style={[styles.pullBtn, phase === 'pulling' && styles.pullBtnDisabled]}
          onPress={handlePull}
          disabled={phase === 'pulling'}
          activeOpacity={0.8}>
          <Text style={styles.pullBtnText}>
            {phase === 'pulling' ? 'Pulling...' : '⚡ PULL NOW'}
          </Text>
          <Text style={styles.pullBtnSub}>FREE (win tower to earn more)</Text>
        </TouchableOpacity>

        {/* ── Drop Rates ────────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DROP RATES</Text>
          {DROP_RATE_DISPLAY.map((d) => (
            <View key={d.rarity} style={styles.rateRow}>
              <Text style={[styles.rateLabel, { color: d.color }]}>{RARITY_LABEL[d.rarity]}</Text>
              <Text style={[styles.rateValue, { color: d.color }]}>{d.rate}</Text>
            </View>
          ))}
        </View>

        {/* ── Owned Loot ────────────────────────────────────────────────────── */}
        {ownedLoot.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>YOUR COLLECTION ({ownedLoot.length})</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {ownedLoot.map((item, i) => (
                <LootCard key={`${item.id}_${i}`} item={item} />
              ))}
            </ScrollView>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.md, paddingBottom: 60 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { padding: 4 },
  backText: { color: Colors.neonGreen, fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.black,
    color: Colors.textPrimary,
    letterSpacing: 3,
  },
  coins: { color: Colors.cyberGold, fontSize: FontSize.sm, fontWeight: FontWeight.bold },

  // Pull zone
  pullZone: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 240,
    marginBottom: Spacing.lg,
  },
  idleOrb: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  idleOrbText: { fontSize: 60 },
  idleOrbSub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 8, textAlign: 'center' },

  spinOrb: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 3,
    borderColor: Colors.neonGreen,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  spinOrbText: { fontSize: 70 },

  revealCard: {
    width: 220,
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: 3,
    backgroundColor: Colors.surface,
    alignItems: 'center',
  },
  revealIcon: { fontSize: 64, marginBottom: Spacing.sm },
  revealRarity: { fontSize: FontSize.sm, fontWeight: FontWeight.black, letterSpacing: 2, marginBottom: 4 },
  revealName: { fontSize: FontSize.xl, fontWeight: FontWeight.black, color: Colors.textPrimary, textAlign: 'center' },
  revealDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', marginTop: 8 },

  // Pull button
  pullBtn: {
    backgroundColor: Colors.neonGreen,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    shadowColor: Colors.neonGreen,
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  pullBtnDisabled: { backgroundColor: Colors.inactive, shadowOpacity: 0 },
  pullBtnText: { fontSize: FontSize.lg, fontWeight: FontWeight.black, color: Colors.background, letterSpacing: 2 },
  pullBtnSub: { fontSize: FontSize.xs, color: Colors.background, opacity: 0.7, marginTop: 2 },

  // Section
  section: { marginBottom: Spacing.lg },
  sectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
    letterSpacing: 2,
    marginBottom: Spacing.sm,
  },

  // Drop rates
  rateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  rateLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  rateValue: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },

  // Owned loot
  lootCard: {
    width: 130,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 2,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  lootIcon: { fontSize: 36, marginBottom: 4 },
  lootRarity: { fontSize: 9, fontWeight: FontWeight.black, letterSpacing: 1.5 },
  lootName: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary, textAlign: 'center', marginTop: 2 },
  lootDesc: { fontSize: 9, color: Colors.textSecondary, textAlign: 'center', marginTop: 2 },
  lootType: { fontSize: 8, letterSpacing: 1, marginTop: 4 },
});
