// ─── Heist — Action Screen (The Heist) ──────────────────────────────────────
// Share / Steal / Shield buttons, 15s countdown timer, loot image, skill button
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
  Dimensions, Vibration, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@theme/index';
import { useGameStore } from '../store/gameStore';
import type { HeistAction } from '@game/game';
import { LOOT_EMOJIS, LOOT_LABELS } from '../data/mockData';

const { width: W } = Dimensions.get('window');
const BTN_SIZE = W * 0.3;

type Props = { navigation: any };

// ── Action Button ─────────────────────────────────────────────────────────────
interface ActionBtnProps {
  label: string;
  emoji: string;
  color: string;
  glowColor: string;
  action: HeistAction;
  selected: boolean;
  onPress: () => void;
}

function ActionBtn({ label, emoji, color, glowColor: _glowColor, selected, onPress }: ActionBtnProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = useCallback(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 0.88, useNativeDriver: true, speed: 40 }),
      Animated.spring(scaleAnim, { toValue: 1.05, useNativeDriver: true, speed: 20 }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 30 }),
    ]).start();
    Vibration.vibrate(60);
    onPress();
  }, [scaleAnim, onPress]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
          style={[
          styles.actionBtn,
          { backgroundColor: selected ? color : Colors.cardBg, borderColor: color },
          selected && styles.actionBtnGlow,
        ]}
        onPress={handlePress}
        activeOpacity={0.85}
      >
        <Text style={styles.actionBtnEmoji}>{emoji}</Text>
        <Text style={[styles.actionBtnLabel, { color: selected ? Colors.background : color }]}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function GameScreen({ navigation }: Props) {
  const {
    actionTimer, selectedAction, lootType, totalLoot, currentRound,
    skillCooldown, roomPhase, equippedRoleId, roles,
    submitAction, useSkill, leaveRoom,
  } = useGameStore();

  const timerShake = useRef(new Animated.Value(0)).current;
  const timerScale = useRef(new Animated.Value(1)).current;

  const equippedRole = roles.find((r) => r.id === equippedRoleId);

  // Navigate when reveal phase starts
  useEffect(() => {
    if (roomPhase === 'reveal') {
      navigation.replace('Reveal');
    }
  }, [roomPhase, navigation]);

  // Timer shake when <= 5s
  useEffect(() => {
    if (actionTimer <= 5 && actionTimer > 0) {
      Animated.sequence([
        Animated.timing(timerShake, { toValue: -6, duration: 60, useNativeDriver: true }),
        Animated.timing(timerShake, { toValue: 6, duration: 60, useNativeDriver: true }),
        Animated.timing(timerShake, { toValue: -4, duration: 60, useNativeDriver: true }),
        Animated.timing(timerShake, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
      Animated.spring(timerScale, { toValue: 1.1, useNativeDriver: true, speed: 20 }).start(() => {
        Animated.spring(timerScale, { toValue: 1, useNativeDriver: true, speed: 20 }).start();
      });
    }
  }, [actionTimer, timerShake, timerScale]);

  const timerColor =
    actionTimer <= 5 ? Colors.stealRed : actionTimer <= 10 ? Colors.gold : Colors.textPrimary;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* ── Timer ── */}
      <View style={styles.timerSection}>
        <Text style={styles.roundLabel}>ROUND {currentRound}</Text>
        <Animated.Text
          style={[
            styles.timer,
            { color: timerColor },
            { transform: [{ translateX: timerShake }, { scale: timerScale }] },
          ]}
        >
          {actionTimer}
        </Animated.Text>
        <Text style={styles.timerLabel}>SECONDS</Text>
      </View>

      {/* ── Loot Display ── */}
      <View style={styles.lootSection}>
        <Text style={styles.lootEmoji}>{LOOT_EMOJIS[lootType]}</Text>
        <Text style={styles.lootLabel}>{LOOT_LABELS[lootType]}</Text>
        <Text style={styles.lootAmount}>💰 {totalLoot.toLocaleString()}</Text>
      </View>

      {/* ── Status ── */}
      {selectedAction && (
        <View style={[
          styles.selectedBanner,
          selectedAction === 'share' ? styles.bannerShare
            : selectedAction === 'steal' ? styles.bannerSteal
            : styles.bannerShield,
        ]}>
          <Text style={styles.selectedBannerText}>
            {selectedAction === 'share' ? '🤝 Sharing — waiting for others...'
              : selectedAction === 'steal' ? '🗡️ Stealing — stay cool...'
              : '🛡️ Shield up — protected!'}
          </Text>
        </View>
      )}

      {/* ── 3 Action Buttons ── */}
      <View style={styles.btnRow}>
        <ActionBtn
          label="SHARE"
          emoji="🤝"
          color={Colors.shareGreen}
          glowColor={Colors.shareGreenGlow}
          action="share"
          selected={selectedAction === 'share'}
          onPress={() => submitAction('share')}
        />
        <ActionBtn
          label="STEAL"
          emoji="🗡️"
          color={Colors.stealRed}
          glowColor={Colors.stealRedGlow}
          action="steal"
          selected={selectedAction === 'steal'}
          onPress={() => submitAction('steal')}
        />
        <ActionBtn
          label="SHIELD"
          emoji="🛡️"
          color={Colors.shieldBlue}
          glowColor={Colors.shieldBlueGlow}
          action="shield"
          selected={selectedAction === 'shield'}
          onPress={() => submitAction('shield')}
        />
      </View>

      {/* ── Active Skill ── */}
      {equippedRole && (
        <View style={styles.skillSection}>
          <TouchableOpacity
            style={[
              styles.skillBtn,
              skillCooldown > 0 && styles.skillBtnCooldown,
            ]}
            onPress={useSkill}
            disabled={skillCooldown > 0}
          >
            <Text style={styles.skillBtnIcon}>{equippedRole.icon}</Text>
            <View>
              <Text style={styles.skillBtnName}>{equippedRole.activeSkill.name}</Text>
              {skillCooldown > 0
                ? <Text style={styles.skillBtnCooldownText}>Cooldown: {skillCooldown}s</Text>
                : <Text style={styles.skillBtnReady}>READY</Text>
              }
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Leave ── */}
      <TouchableOpacity style={styles.leaveBtn} onPress={() => { leaveRoom(); navigation.replace('Home'); }}>
        <Text style={styles.leaveBtnText}>✕ Leave</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  // Timer
  timerSection: { alignItems: 'center', paddingTop: Spacing.md },
  roundLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, letterSpacing: 2, marginBottom: 4 },
  timer: { fontSize: 88, fontWeight: FontWeight.bold as any, lineHeight: 96 },
  timerLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, letterSpacing: 2 },

  // Loot
  lootSection: { alignItems: 'center', paddingVertical: Spacing.lg },
  lootEmoji: { fontSize: 64 },
  lootLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4, letterSpacing: 1 },
  lootAmount: { fontSize: FontSize.xl, fontWeight: FontWeight.bold as any, color: Colors.gold, marginTop: 4 },

  // Selected
  selectedBanner: { marginHorizontal: Spacing.md, borderRadius: Radius.sm, paddingVertical: 10, paddingHorizontal: Spacing.md, borderWidth: 1, alignItems: 'center', marginBottom: Spacing.md },
  selectedBannerText: { fontSize: FontSize.sm, color: Colors.textPrimary },
  bannerShare:  { borderColor: Colors.shareGreen, backgroundColor: 'rgba(0,230,118,0.12)' },
  bannerSteal:  { borderColor: Colors.stealRed,   backgroundColor: 'rgba(255,77,77,0.12)' },
  bannerShield: { borderColor: Colors.shieldBlue, backgroundColor: 'rgba(41,121,255,0.12)' },

  // Action buttons
  btnRow: { flexDirection: 'row', justifyContent: 'space-evenly', paddingHorizontal: Spacing.sm, flex: 1, alignItems: 'center' },
  actionBtn: {
    width: BTN_SIZE,
    height: BTN_SIZE,
    borderRadius: BTN_SIZE / 2,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnEmoji: { fontSize: 32 },
  actionBtnLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.bold as any, letterSpacing: 1.5, marginTop: 4 },
  actionBtnGlow: { shadowOpacity: 0.8, shadowRadius: 20, shadowOffset: { width: 0, height: 0 }, elevation: 12 },

  // Skill
  skillSection: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm },
  skillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.gold,
    gap: 12,
  },
  skillBtnCooldown: { borderColor: Colors.inactive, opacity: 0.6 },
  skillBtnIcon: { fontSize: 28 },
  skillBtnName: { fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: FontWeight.bold as any },
  skillBtnReady: { fontSize: FontSize.xs, color: Colors.shareGreen, fontWeight: FontWeight.bold as any },
  skillBtnCooldownText: { fontSize: FontSize.xs, color: Colors.stealRed },

  // Leave
  leaveBtn: { alignItems: 'center', paddingBottom: Spacing.md },
  leaveBtnText: { fontSize: FontSize.xs, color: Colors.textSecondary },
});
