// ─── Heist — Full-Screen Action Screen ───────────────────────────────────────
// Commander's Monitor: Action Dial center + teardrop chip buttons
// Role badge bottom-left · Timer top · Loot display · Skill shortcut
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
  Dimensions, Vibration, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@theme/index';
import { useGameStore } from '../store/gameStore';
import { LOOT_EMOJIS, LOOT_LABELS } from '../data/mockData';

const { width: W } = Dimensions.get('window');
const DIAL_SIZE   = W * 0.52;   // Central action dial
const CHIP_SIZE   = 74;         // Casino chip button diameter

type Props = { navigation: any };

// ── Chip Action Button (casino-chip / teardrop style) ────────────────────────
interface ChipBtnProps {
  label: string;
  emoji: string;
  color: string;
  glowColor: string;
  selected: boolean;
  onPress: () => void;
}

function ChipBtn({ label, emoji, color, glowColor, selected, onPress }: ChipBtnProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = useCallback(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 0.84, useNativeDriver: true, speed: 50 }),
      Animated.spring(scaleAnim, { toValue: 1.08, useNativeDriver: true, speed: 22 }),
      Animated.spring(scaleAnim, { toValue: 1,    useNativeDriver: true, speed: 30 }),
    ]).start();
    Vibration.vibrate(50);
    onPress();
  }, [scaleAnim, onPress]);

  const chipDynamic = {
    backgroundColor: selected ? color : 'rgba(0,0,0,0.50)' as string,
    borderColor: color,
    shadowColor: selected ? glowColor : ('transparent' as string),
  };
  const labelDynamic = { color: selected ? ('#fff' as string) : color };

  return (
    <Animated.View style={[styles.chipWrap, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={[
          styles.chipBtn,
          chipDynamic,
          selected && styles.chipBtnGlow,
        ]}
        onPress={handlePress}
        activeOpacity={0.82}
      >
        <Text style={styles.chipEmoji}>{emoji}</Text>
        <Text style={[styles.chipLabel, labelDynamic]}>{label}</Text>
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
  // Dial rotation pulse
  const dialRotate = useRef(new Animated.Value(0)).current;

  const equippedRole = roles.find((r) => r.id === equippedRoleId);

  // Navigate when reveal phase starts
  useEffect(() => {
    if (roomPhase === 'reveal') {
      navigation.replace('Reveal');
    }
  }, [roomPhase, navigation]);

  // Dial idle spin
  useEffect(() => {
    Animated.loop(
      Animated.timing(dialRotate, { toValue: 1, duration: 18000, useNativeDriver: true }),
    ).start();
  }, [dialRotate]);

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

  const dialSpin = dialRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent hidden={true} />

      {/* ── TOP: Round + Timer ── */}
      <View style={styles.topHud}>
        <View style={styles.roundBadge}>
          <Text style={styles.roundLabel}>ROUND</Text>
          <Text style={styles.roundNum}>{currentRound}</Text>
        </View>

        {/* Countdown in center */}
        <Animated.Text
          style={[
            styles.timer,
            { color: timerColor },
            { transform: [{ translateX: timerShake }, { scale: timerScale }] },
          ]}
        >
          {actionTimer}
        </Animated.Text>

        {/* Loot badge top right */}
        <View style={styles.lootBadge}>
          <Text style={styles.lootBadgeEmoji}>{LOOT_EMOJIS[lootType]}</Text>
          <Text style={styles.lootBadgeAmount}>{totalLoot.toLocaleString()}</Text>
          <Text style={styles.lootBadgeLabel}>{LOOT_LABELS[lootType]}</Text>
        </View>
      </View>

      {/* ── CENTRAL ACTION DIAL ── */}
      <View style={styles.dialArea}>
        {/* Outer glow ring — slow rotating */}
        <Animated.View
          style={[styles.dialOuterRing, { transform: [{ rotate: dialSpin }] }]}
          pointerEvents="none"
        />
        {/* Dial container */}
        <View style={styles.dial}>
          {/* ── SHIELD — top ── */}
          <View style={styles.chipTop}>
            <ChipBtn
              label="SHIELD"
              emoji="🛡️"
              color={Colors.shieldBlue}
              glowColor={Colors.shieldBlueGlow}
              selected={selectedAction === 'shield'}
              onPress={() => submitAction('shield')}
            />
          </View>

          {/* ── Middle row: STEAL — center dial — SHARE ── */}
          <View style={styles.chipMiddleRow}>
            {/* STEAL — left */}
            <ChipBtn
              label="STEAL"
              emoji="🗡️"
              color={Colors.stealRed}
              glowColor={Colors.stealRedGlow}
              selected={selectedAction === 'steal'}
              onPress={() => submitAction('steal')}
            />

            {/* Central Dial Core */}
            <View style={styles.dialCore}>
              <Text style={styles.dialCoreEmoji}>
                {selectedAction === 'share' ? '🤝'
                  : selectedAction === 'steal' ? '🗡️'
                  : selectedAction === 'shield' ? '🛡️'
                  : '⚡'}
              </Text>
              <Text style={styles.dialCoreLabel}>
                {selectedAction ? selectedAction.toUpperCase() : 'CHOOSE'}
              </Text>
            </View>

            {/* SHARE — right */}
            <ChipBtn
              label="SHARE"
              emoji="🤝"
              color={Colors.shareGreen}
              glowColor={Colors.shareGreenGlow}
              selected={selectedAction === 'share'}
              onPress={() => submitAction('share')}
            />
          </View>
        </View>
      </View>

      {/* ── BOTTOM HUD ROW ── */}
      <View style={styles.bottomHud}>
        {/* Role badge — bottom left */}
        <View style={styles.roleBadge}>
          {equippedRole ? (
            <>
              <Text style={styles.roleBadgeIcon}>{equippedRole.icon}</Text>
              <Text style={styles.roleBadgeName}>{equippedRole.name.toUpperCase()}</Text>
            </>
          ) : (
            <Text style={styles.roleBadgeName}>NO ROLE</Text>
          )}
        </View>

        {/* Skill button — center */}
        {equippedRole && (
          <TouchableOpacity
            style={[styles.skillBtn, skillCooldown > 0 && styles.skillBtnCooldown]}
            onPress={useSkill}
            disabled={skillCooldown > 0}
          >
            <Text style={styles.skillBtnIcon}>{equippedRole.icon}</Text>
            <View>
              <Text style={styles.skillBtnName}>{equippedRole.activeSkill.name}</Text>
              {skillCooldown > 0
                ? <Text style={styles.skillBtnCooldownText}>{skillCooldown}s</Text>
                : <Text style={styles.skillBtnReady}>READY</Text>}
            </View>
          </TouchableOpacity>
        )}

        {/* Leave — bottom right */}
        <TouchableOpacity
          style={styles.leaveBtn}
          onPress={() => { leaveRoom(); navigation.replace('Home'); }}
        >
          <Text style={styles.leaveBtnIcon}>✕</Text>
          <Text style={styles.leaveBtnText}>LEAVE</Text>
        </TouchableOpacity>
      </View>

      {/* ── Status banner (when action chosen) ── */}
      {selectedAction && (
        <View style={[
          styles.selectedBanner,
          selectedAction === 'share' ? styles.bannerShare
            : selectedAction === 'steal' ? styles.bannerSteal
            : styles.bannerShield,
        ]}>
          <Text style={styles.selectedBannerText}>
            {selectedAction === 'share' ? '🤝 Sharing — waiting...'
              : selectedAction === 'steal' ? '🗡️ Stealing — stay cool...'
              : '🛡️ Shield up — protected!'}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },

  // ── Top HUD ───────────────────────────────────────────────────────────────────
  topHud: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  roundBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.38)',
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  roundLabel: { fontSize: 9, color: 'rgba(255,255,255,0.60)', letterSpacing: 2 },
  roundNum: { fontSize: FontSize.xl, fontWeight: FontWeight.black as any, color: Colors.textPrimary },
  timer: {
    fontSize: 80,
    fontWeight: FontWeight.black as any,
    lineHeight: 88,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  lootBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.38)',
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  lootBadgeEmoji: { fontSize: 22 },
  lootBadgeAmount: { fontSize: FontSize.sm, fontWeight: FontWeight.bold as any, color: Colors.gold },
  lootBadgeLabel: { fontSize: 8, color: 'rgba(255,255,255,0.55)', letterSpacing: 1 },

  // ── Central Dial Area ─────────────────────────────────────────────────────────
  dialArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialOuterRing: {
    position: 'absolute',
    width: DIAL_SIZE + 60,
    height: DIAL_SIZE + 60,
    borderRadius: (DIAL_SIZE + 60) / 2,
    borderWidth: 1,
    borderColor: 'rgba(255,210,63,0.22)',
    borderStyle: 'dashed',
  },
  dial: {
    width: DIAL_SIZE + CHIP_SIZE * 2 + Spacing.lg * 2,
    alignItems: 'center',
    gap: Spacing.md,
  },
  chipTop: { alignItems: 'center' },
  chipMiddleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: Spacing.xs,
  },
  dialCore: {
    width: DIAL_SIZE,
    height: DIAL_SIZE,
    borderRadius: DIAL_SIZE / 2,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
    gap: 4,
  },
  dialCoreEmoji: { fontSize: 52 },
  dialCoreLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold as any,
    color: 'rgba(255,255,255,0.70)',
    letterSpacing: 2,
  },

  // ── Chip Buttons (casino chip style) ─────────────────────────────────────────
  chipWrap: {},
  chipBtn: {
    width: CHIP_SIZE,
    height: CHIP_SIZE,
    borderRadius: CHIP_SIZE / 2,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  chipBtnGlow: {
    shadowOpacity: 0.9,
    shadowRadius: 18,
    elevation: 14,
  },
  chipEmoji: { fontSize: 26 },
  chipLabel: { fontSize: 9, fontWeight: FontWeight.bold as any, letterSpacing: 1 },

  // ── Bottom HUD ────────────────────────────────────────────────────────────────
  bottomHud: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  roleBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.50)',
    borderRadius: Radius.md,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
    minWidth: 64,
  },
  roleBadgeIcon: { fontSize: 26 },
  roleBadgeName: {
    fontSize: 8,
    fontWeight: FontWeight.bold as any,
    color: 'rgba(255,255,255,0.70)',
    letterSpacing: 1,
    marginTop: 2,
  },

  // Skill
  skillBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.50)',
    borderRadius: Radius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.gold,
    gap: 10,
  },
  skillBtnCooldown: { borderColor: Colors.inactive, opacity: 0.55 },
  skillBtnIcon: { fontSize: 24 },
  skillBtnName: { fontSize: FontSize.xs, color: Colors.textPrimary, fontWeight: FontWeight.bold as any },
  skillBtnReady: { fontSize: 9, color: Colors.shareGreen, fontWeight: FontWeight.bold as any, letterSpacing: 1 },
  skillBtnCooldownText: { fontSize: 9, color: Colors.stealRed },

  // Leave
  leaveBtn: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.40)',
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    minWidth: 56,
  },
  leaveBtnIcon: { fontSize: 16, color: 'rgba(255,255,255,0.55)' },
  leaveBtnText: { fontSize: 9, color: 'rgba(255,255,255,0.55)', letterSpacing: 1, marginTop: 2 },

  // ── Status Banner ─────────────────────────────────────────────────────────────
  selectedBanner: {
    position: 'absolute',
    bottom: 90,
    left: Spacing.md,
    right: Spacing.md,
    borderRadius: Radius.md,
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  selectedBannerText: { fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: FontWeight.semiBold as any },
  bannerShare:  { borderColor: Colors.shareGreen, backgroundColor: 'rgba(81,229,255,0.15)' },
  bannerSteal:  { borderColor: Colors.stealRed,   backgroundColor: 'rgba(255,107,107,0.15)' },
  bannerShield: { borderColor: Colors.shieldBlue, backgroundColor: 'rgba(136,224,239,0.15)' },
});
