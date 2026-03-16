// ─── Heist — Reveal Screen (The Betrayal) ────────────────────────────────────
// Shows only: pool loot remaining + your own earnings.
// Other players' actions/money are hidden.
// Deposit to Vault visible only on final round (round 3).
// Next Round → Chat screen (pre-round lobby chat).
// ─────────────────────────────────────────────────────────────────────────────
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@theme/index';
import { useGameStore } from '../store/gameStore';

const MAX_ROUNDS = 3;
type Props = { navigation: any };

export default function RevealScreen({ navigation }: Props) {
  const {
    roundResults, matchMoney, currentRound, totalLoot,
    depositToVault, leaveRoom,
  } = useGameStore();

  const [showSummary, setShowSummary] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const summaryAnim = useRef(new Animated.Value(0)).current;

  // ── Reanimated exit transition ──────────────────────────────────────────────
  const screenOpacity = useSharedValue(1);
  const screenScale = useSharedValue(1);
  const screenTranslateY = useSharedValue(0);

  const screenAnimStyle = useAnimatedStyle(() => ({
    flex: 1,
    opacity: screenOpacity.value,
    transform: [
      { scale: screenScale.value },
      { translateY: screenTranslateY.value },
    ],
  }));

  const navigateHome = useCallback(() => {
    leaveRoom();
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  }, [leaveRoom, navigation]);

  const handleDepositAndExit = useCallback(() => {
    depositToVault(matchMoney);
    screenScale.value = withTiming(0.92, { duration: 180, easing: Easing.in(Easing.quad) });
    screenOpacity.value = withTiming(0, { duration: 320, easing: Easing.in(Easing.quad) });
    screenTranslateY.value = withSequence(
      withTiming(12, { duration: 120, easing: Easing.out(Easing.quad) }),
      withTiming(60, { duration: 260, easing: Easing.in(Easing.quad) }, (finished) => {
        if (finished) { runOnJS(navigateHome)(); }
      }),
    );
  }, [depositToVault, matchMoney, navigateHome, screenOpacity, screenScale, screenTranslateY]);

  const myResult = roundResults.find((r) => r.playerId.startsWith('local'));
  const isLastRound = currentRound >= MAX_ROUNDS;

  // Calculate pool remaining: totalLoot minus all gains this round
  const totalGained = roundResults.reduce((sum, r) => sum + r.moneyGained, 0);
  const poolRemaining = Math.max(0, totalLoot - totalGained);

  useEffect(() => {
    const t = setTimeout(() => {
      setShowSummary(true);
      Animated.spring(summaryAnim, { toValue: 1, useNativeDriver: true, speed: 6, bounciness: 8 }).start();
    }, 800);
    return () => clearTimeout(t);
  }, [summaryAnim]);

  // ── 5-second auto-navigate to Chat (non-final rounds) ──────────────────────
  useEffect(() => {
    if (isLastRound) { return; }
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          navigation.replace('Chat');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isLastRound, navigation]);

  return (
    <Reanimated.View style={screenAnimStyle}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.background} hidden={true} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>� ROUND {currentRound} RESULT</Text>
          <Text style={styles.roundLabel}>
            {isLastRound ? '🏁 FINAL ROUND' : `ROUND ${currentRound} / ${MAX_ROUNDS}`}
          </Text>
        </View>

        {/* Pool remaining — big focal card */}
        <View style={styles.poolCard}>
          <Text style={styles.poolLabel}>💰 POOL REMAINING</Text>
          <Text style={styles.poolValue}>{poolRemaining.toLocaleString()} 💵</Text>
          <Text style={styles.poolSub}>Out of {totalLoot.toLocaleString()} total loot</Text>
        </View>

        {/* My result summary */}
        {showSummary && (
          <Animated.View style={[styles.summary, { transform: [{ scale: summaryAnim }], opacity: summaryAnim }]}>
            <Text style={styles.summaryTitle}>🎯 YOUR ROUND</Text>

            {myResult ? (
              <>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryItem}>You gained</Text>
                  <Text style={[styles.summaryValue, { color: Colors.shareGreen }]}>
                    +{myResult.moneyGained} 💵
                  </Text>
                </View>
                {myResult.moneyLost > 0 && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryItem}>You lost (stolen)</Text>
                    <Text style={[styles.summaryValue, { color: Colors.stealRed }]}>
                      -{myResult.moneyLost} 💵
                    </Text>
                  </View>
                )}
                {myResult.wasBetrayed && (
                  <View style={styles.betrayedBanner}>
                    <Text style={styles.betrayedBannerText}>⚠️ YOU WERE BETRAYED THIS ROUND</Text>
                  </View>
                )}
              </>
            ) : (
              <Text style={styles.noResult}>No data for this round.</Text>
            )}

            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryItem}>Your total match money</Text>
              <Text style={[styles.summaryValue, { color: Colors.gold }]}>{matchMoney} 💵</Text>
            </View>

            {/* Action buttons */}
            <View style={styles.summaryActions}>
              {isLastRound ? (
                <TouchableOpacity style={styles.depositBtn} onPress={handleDepositAndExit}>
                  <Text style={styles.depositBtnText}>🏦 Deposit to Vault</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.autoNextBox}>
                  <Text style={styles.autoNextText}>
                    ⏱ Next round in <Text style={styles.autoNextCount}>{countdown}s</Text>
                  </Text>
                </View>
              )}
            </View>
          </Animated.View>
        )}
      </SafeAreaView>
    </Reanimated.View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.bold as any, color: Colors.textPrimary },
  roundLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, letterSpacing: 2, marginTop: 2 },

  // Pool card
  poolCard: {
    margin: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: 'rgba(255,200,50,0.1)',
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderColor: Colors.gold,
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  poolLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    letterSpacing: 2,
    marginBottom: Spacing.xs,
  },
  poolValue: {
    fontSize: 42,
    fontWeight: FontWeight.bold as any,
    color: Colors.gold,
  },
  poolSub: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 4,
  },

  // Summary card
  summary: {
    flex: 1,
    margin: Spacing.md,
    marginTop: 0,
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  summaryTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold as any,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  summaryItem: { fontSize: FontSize.sm, color: Colors.textSecondary },
  summaryValue: { fontSize: FontSize.sm, fontWeight: FontWeight.bold as any },
  noResult: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', paddingVertical: Spacing.sm },
  divider: { height: 1, backgroundColor: Colors.divider, marginVertical: Spacing.sm },

  betrayedBanner: {
    backgroundColor: 'rgba(255,77,77,0.18)',
    borderRadius: Radius.sm,
    padding: Spacing.xs,
    marginVertical: Spacing.xs,
    alignItems: 'center',
  },
  betrayedBannerText: { fontSize: FontSize.xs, color: Colors.stealRed, fontWeight: FontWeight.bold as any, letterSpacing: 1 },

  summaryActions: { marginTop: Spacing.md },
  depositBtn: {
    backgroundColor: Colors.gold,
    borderRadius: Radius.md,
    padding: 14,
    alignItems: 'center',
  },
  depositBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold as any, color: Colors.background },
  autoNextBox: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.shieldBlue,
  },
  autoNextText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  autoNextCount: { color: Colors.shieldBlue, fontWeight: FontWeight.bold as any },
});
