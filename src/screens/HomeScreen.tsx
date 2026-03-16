// ─── Heist — Game Dashboard (Home Screen) ────────────────────────────────────
// Greedy Gang — Full-screen mobile game layout (Clash of Clans / Free Fire style)
// No bottom tab bar. All nav is inline: left menu corner, right menu corner.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@theme/index';
import { useGameStore } from '../store/gameStore';

const { width: W, height: H } = Dimensions.get('window');

type Props = { navigation: any };

// ── Square corner button (Shop / Profile) ────────────────────────────────────
function SquareMenuBtn({
  emoji,
  label,
  onPress,
}: {
  emoji: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.squareBtn} onPress={onPress} activeOpacity={0.82}>
      <Text style={styles.squareBtnEmoji}>{emoji}</Text>
      <Text style={styles.squareBtnLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

// ── Spotlight glow behind character ──────────────────────────────────────────
function Spotlight() {
  const pulse = useRef(new Animated.Value(0.6)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.6, duration: 1800, useNativeDriver: true }),
      ]),
    ).start();
  }, [pulse]);
  return (
    <Animated.View style={[styles.spotlight, { opacity: pulse }]} pointerEvents="none" />
  );
}

export default function HomeScreen({ navigation }: Props) {
  const {
    localPlayerName,
    localAvatar,
    vaultGold,
    roles,
    joinHeist,
    equippedRoleId,
  } = useGameStore();

  const equippedRole = roles.find((r) => r.id === equippedRoleId);

  // Floating animation for avatar
  const floatAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -10, duration: 1600, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 1600, useNativeDriver: true }),
      ]),
    ).start();
  }, [floatAnim]);

  const handleJoinHeist = () => {
    joinHeist();
    navigation.navigate('Lobby');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent hidden={true} />

      {/* ── TOP BAR ── */}
      <View style={styles.topBar}>
        {/* Settings — top left */}
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => navigation.navigate('ProfileTab')}
          activeOpacity={0.8}
        >
          <Text style={styles.settingsBtnIcon}>⚙️</Text>
        </TouchableOpacity>

        {/* Title center */}
        <Text style={styles.appTitle}>GREEDY GANG</Text>

        {/* Gold — top right */}
        <View style={styles.coinBadge}>
          <Text style={styles.coinIcon}>🪙</Text>
          <Text style={styles.coinAmount}>{vaultGold.toLocaleString()}</Text>
        </View>
      </View>

      {/* ── STAT STRIP — above character ── */}
      <View style={styles.statsStrip}>
        <View style={styles.statPill}>
          <Text style={styles.statPillValue}>{vaultGold.toLocaleString()}</Text>
          <Text style={styles.statPillLabel}>VAULT</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statPill}>
          <Text style={styles.statPillValue}>{roles.filter((r) => r.isOwned).length}</Text>
          <Text style={styles.statPillLabel}>ROLES</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statPill}>
          <Text style={styles.statPillValue}>LV 7</Text>
          <Text style={styles.statPillLabel}>RANK</Text>
        </View>
      </View>

      {/* ── CENTRAL CHARACTER AREA ── */}
      <View style={styles.centralArea} pointerEvents="none">
        <Spotlight />
        {/* Player name tag */}
        <View style={styles.nameBadge}>
          <Text style={styles.playerName}>{localPlayerName}</Text>
          {equippedRole && (
            <View style={styles.rolePill}>
              <Text style={styles.rolePillIcon}>{equippedRole.icon}</Text>
              <Text style={styles.rolePillText}>{equippedRole.name}</Text>
            </View>
          )}
        </View>
        {/* Character avatar with float */}
        <Animated.Text
          style={[styles.avatarEmoji, { transform: [{ translateY: floatAnim }] }]}
        >
          {localAvatar}
        </Animated.Text>
        {/* Shadow beneath avatar */}
        <View style={styles.avatarShadow} />
      </View>

      {/* ── LEFT CORNER — SHOP + PROFILE + ROLES ── */}
      <View style={styles.leftCorner}>
        <SquareMenuBtn
          emoji="🏴‍☠️"
          label="SHOP"
          onPress={() => navigation.navigate('ShopTab')}
        />
        <SquareMenuBtn
          emoji="👤"
          label="PROFILE"
          onPress={() => navigation.navigate('ProfileTab')}
        />
        <SquareMenuBtn
          emoji="🃏"
          label="ROLES"
          onPress={() => navigation.navigate('RoleTab')}
        />
      </View>

      {/* ── RIGHT CORNER — HEIST ── */}
      <View style={styles.rightCorner}>
        {/* HEIST — main CTA with fire glow */}
        <TouchableOpacity
          style={styles.heistBtn}
          onPress={handleJoinHeist}
          activeOpacity={0.88}
        >
          {/* Outer glow ring */}
          <View style={styles.heistGlowRing} />
          <Text style={styles.heistBtnEmoji}>🎯</Text>
          <Text style={styles.heistBtnText}>HEIST</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const SQUARE_BTN = 72;
const HEIST_BTN = 96;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },

  // ── Top Bar ──────────────────────────────────────────────────────────────────
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  settingsBtn: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(0,0,0,0.30)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsBtnIcon: { fontSize: 20 },
  appTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.black as any,
    color: Colors.textPrimary,
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gold,
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
    shadowColor: Colors.shadowYellow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 6,
  },
  coinIcon: { fontSize: 14 },
  coinAmount: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold as any,
    color: Colors.textOnYellow,
  },

  // ── Central Character ─────────────────────────────────────────────────────────
  centralArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  },
  spotlight: {
    position: 'absolute',
    width: W * 0.72,
    height: W * 0.72,
    borderRadius: W * 0.36,
    backgroundColor: 'rgba(255,210,63,0.13)',
    // radial spotlight effect using shadow
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 60,
    elevation: 0,
  },
  nameBadge: {
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  playerName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.black as any,
    color: Colors.textPrimary,
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.32)',
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
  },
  rolePillIcon: { fontSize: 13 },
  rolePillText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semiBold as any,
    color: Colors.textPrimary,
    letterSpacing: 1,
  },
  avatarEmoji: {
    fontSize: H * 0.18,
    lineHeight: H * 0.22,
    textAlign: 'center',
  },
  avatarShadow: {
    width: 100,
    height: 16,
    borderRadius: 50,
    backgroundColor: 'rgba(0,0,0,0.28)',
    marginTop: -Spacing.md,
    // elliptical blur via shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 0,
  },

  // ── Left Corner: Shop + Profile ───────────────────────────────────────────────
  leftCorner: {
    position: 'absolute',
    left: Spacing.md,
    bottom: 90,
    gap: Spacing.sm,
    zIndex: 10,
  },
  squareBtn: {
    width: SQUARE_BTN,
    height: SQUARE_BTN,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  squareBtnEmoji: { fontSize: 28 },
  squareBtnLabel: {
    fontSize: 9,
    fontWeight: FontWeight.bold as any,
    color: Colors.textPrimary,
    letterSpacing: 1,
  },

  // ── Right Corner: Heist ───────────────────────────────────────────────────────
  rightCorner: {
    position: 'absolute',
    right: Spacing.md,
    bottom: 100,
    alignItems: 'center',
    gap: Spacing.sm,
    zIndex: 10,
  },
  // HEIST — large glowing gold circle
  heistBtn: {
    width: HEIST_BTN,
    height: HEIST_BTN,
    borderRadius: HEIST_BTN / 2,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 16,
    position: 'relative',
  },
  heistGlowRing: {
    position: 'absolute',
    width: HEIST_BTN + 20,
    height: HEIST_BTN + 20,
    borderRadius: (HEIST_BTN + 20) / 2,
    borderWidth: 2,
    borderColor: 'rgba(255,210,63,0.50)',
    // pulsing ring
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 0,
  },
  heistBtnEmoji: { fontSize: 32, marginBottom: 2 },
  heistBtnText: {
    fontSize: 11,
    fontWeight: FontWeight.black as any,
    color: Colors.textOnYellow,
    letterSpacing: 2,
  },

  // ── Stats Strip — below top bar ──────────────────────────────────────────────
  statsStrip: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.xl,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  statPill: { alignItems: 'center', flex: 1 },
  statPillValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.black as any,
    color: Colors.gold,
  },
  statPillLabel: {
    fontSize: 9,
    fontWeight: FontWeight.semiBold as any,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
});
