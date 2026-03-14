// ─── Heist — Reveal Screen (The Betrayal) ────────────────────────────────────
// 4-panel reveal, haptic feedback, red flash on steal, aftermath summary
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
  Dimensions, Vibration, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@theme/index';
import { useGameStore } from '../store/gameStore';
import type { RoundResult } from '@game/game';

const { width: W } = Dimensions.get('window');
type Props = { navigation: any };

const ACTION_CONFIG: Record<string, { emoji: string; label: string; color: string; bg: string }> = {
  share: { emoji: '🤝', label: 'SHARED', color: Colors.shareGreen, bg: 'rgba(0,230,118,0.14)' },
  steal: { emoji: '🗡️', label: 'STOLE', color: Colors.stealRed, bg: 'rgba(255,77,77,0.14)' },
  shield: { emoji: '🛡️', label: 'SHIELDED', color: Colors.shieldBlue, bg: 'rgba(41,121,255,0.14)' },
};

// ── Result Card ───────────────────────────────────────────────────────────────
function ResultCard({ result, delay }: { result: RoundResult; delay: number }) {
  const revealAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;
  const config = ACTION_CONFIG[result.action];

  useEffect(() => {
    setTimeout(() => {
      Animated.spring(revealAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 8,
        bounciness: 12,
      }).start(() => {
        if (result.action === 'steal') {
          Vibration.vibrate([0, 80, 50, 80]);
          // Red flash
          Animated.sequence([
            Animated.timing(flashAnim, { toValue: 1, duration: 120, useNativeDriver: false }),
            Animated.timing(flashAnim, { toValue: 0, duration: 300, useNativeDriver: false }),
          ]).start();
          // Shake
          Animated.sequence([
            Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
          ]).start();
        }
      });
    }, delay);
  }, [delay, flashAnim, revealAnim, result.action, shakeAnim]);

  const flashBg = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', 'rgba(255,77,77,0.5)'],
  });

  return (
    <Animated.View
      style={[
        styles.resultCard,
        { backgroundColor: config.bg, borderColor: config.color },
        { transform: [{ scale: revealAnim }, { translateX: shakeAnim }] },
        { opacity: revealAnim },
      ]}
    >
      {/* Red flash overlay */}
      <Animated.View style={[StyleSheet.absoluteFillObject, { backgroundColor: flashBg, borderRadius: Radius.md }]} />
      <Text style={styles.resultAvatar}>{result.avatar}</Text>
      <Text style={styles.resultName} numberOfLines={1}>{result.playerName}</Text>
      <Text style={styles.resultActionEmoji}>{config.emoji}</Text>
      <Text style={[styles.resultActionLabel, { color: config.color }]}>{config.label}</Text>
      {result.moneyGained > 0 && (
        <Text style={styles.resultGain}>+{result.moneyGained} 💵</Text>
      )}
      {result.moneyLost > 0 && (
        <Text style={styles.resultLoss}>-{result.moneyLost} 💵</Text>
      )}
      {result.wasBetrayed && (
        <View style={styles.betrayedBadge}>
          <Text style={styles.betrayedBadgeText}>BETRAYED!</Text>
        </View>
      )}
    </Animated.View>
  );
}

export default function RevealScreen({ navigation }: Props) {
  const { roundResults, matchMoney, currentRound, depositToVault, leaveRoom } = useGameStore();
  const [showSummary, setShowSummary] = useState(false);
  const summaryAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Show summary after all cards reveal
    const t = setTimeout(() => {
      setShowSummary(true);
      Animated.spring(summaryAnim, { toValue: 1, useNativeDriver: true, speed: 6, bounciness: 8 }).start();
    }, roundResults.length * 400 + 1000);
    return () => clearTimeout(t);
  }, [roundResults.length, summaryAnim]);

  const hasSteal = roundResults.some((r) => r.action === 'steal');
  const myResult = roundResults.find((r) => r.playerId.startsWith('local'));

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {hasSteal ? '💀 BETRAYAL DETECTED' : '✅ ROUND COMPLETE'}
        </Text>
        <Text style={styles.roundLabel}>ROUND {currentRound}</Text>
      </View>

      {/* 4-panel cards */}
      <View style={styles.cardsGrid}>
        {roundResults.map((result, i) => (
          <ResultCard key={result.playerId} result={result} delay={i * 300} />
        ))}
      </View>

      {/* Aftermath summary */}
      {showSummary && (
        <Animated.View style={[styles.summary, { transform: [{ scale: summaryAnim }], opacity: summaryAnim }]}>
          <Text style={styles.summaryTitle}>💰 YOUR CUT</Text>
          {myResult && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryItem}>Gained</Text>
              <Text style={[styles.summaryValue, { color: Colors.shareGreen }]}>+{myResult.moneyGained}</Text>
            </View>
          )}
          {myResult && myResult.moneyLost > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryItem}>Lost (stolen)</Text>
              <Text style={[styles.summaryValue, { color: Colors.stealRed }]}>-{myResult.moneyLost}</Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryItem}>Total Match Money</Text>
            <Text style={[styles.summaryValue, { color: Colors.gold }]}>{matchMoney} 💵</Text>
          </View>

          <View style={styles.summaryActions}>
            <TouchableOpacity
              style={styles.depositBtn}
              onPress={() => {
                depositToVault(matchMoney);
                setTimeout(() => { leaveRoom(); navigation.replace('Home'); }, 800);
              }}
            >
              <Text style={styles.depositBtnText}>🏦 Deposit to Vault</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.continueBtn}
              onPress={() => navigation.replace('Game')}
            >
              <Text style={styles.continueBtnText}>▶ Next Round</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { alignItems: 'center', paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.bold as any, color: Colors.textPrimary },
  roundLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, letterSpacing: 2, marginTop: 2 },

  // Cards grid — 2x2
  cardsGrid: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', padding: Spacing.md, alignContent: 'center' },
  resultCard: {
    width: W / 2 - Spacing.md * 1.5,
    marginHorizontal: Spacing.xs,
    marginVertical: Spacing.xs,
    borderRadius: Radius.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.sm,
    minHeight: 140,
    overflow: 'hidden',
  },
  resultAvatar: { fontSize: 36, marginBottom: 4 },
  resultName: { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center' },
  resultActionEmoji: { fontSize: 28, marginTop: 4 },
  resultActionLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.bold as any, letterSpacing: 1.5, marginTop: 2 },
  resultGain: { fontSize: FontSize.xs, color: Colors.shareGreen, marginTop: 2 },
  resultLoss: { fontSize: FontSize.xs, color: Colors.stealRed, marginTop: 2 },
  betrayedBadge: { marginTop: 4, backgroundColor: Colors.stealRed, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  betrayedBadgeText: { fontSize: 8, color: '#fff', fontWeight: FontWeight.bold as any, letterSpacing: 1 },

  // Summary
  summary: { margin: Spacing.md, backgroundColor: Colors.cardBg, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.gold },
  summaryTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold as any, color: Colors.gold, textAlign: 'center', marginBottom: Spacing.sm },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  summaryItem: { fontSize: FontSize.sm, color: Colors.textSecondary },
  summaryValue: { fontSize: FontSize.sm, fontWeight: FontWeight.bold as any },
  summaryActions: { flexDirection: 'row', gap: 10, marginTop: Spacing.md },
  depositBtn: { flex: 1, backgroundColor: Colors.gold, borderRadius: Radius.md, padding: 12, alignItems: 'center' },
  depositBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold as any, color: Colors.background },
  continueBtn: { flex: 1, backgroundColor: Colors.surfaceElevated, borderRadius: Radius.md, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: Colors.shieldBlue },
  continueBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold as any, color: Colors.shieldBlue },
});
