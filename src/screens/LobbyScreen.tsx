// ─── Heist — Lobby Screen ────────────────────────────────────────────────────
// Design: Purple bg · White cards · Round avatar · READY pill · Center hub
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, StatusBar,
  Dimensions, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@theme/index';
import { useGameStore } from '../store/gameStore';
import type { HeistPlayer } from '@game/game';

const { width: W } = Dimensions.get('window');
const CARD_W = (W - Spacing.md * 2 - Spacing.sm * 4) / 2;
const CARD_H = CARD_W * 1.25;
const AVATAR_SIZE = CARD_W * 0.52;

type Props = { navigation: any };

// ── Player Slot ───────────────────────────────────────────────────────────────
function PlayerSlot({
  player,
  onTransfer,
}: {
  player: HeistPlayer;
  index?: number;
  onTransfer?: (player: HeistPlayer) => void;
}) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (player.isReady) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.04, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [player.isReady, pulseAnim]);

  return (
    <Animated.View
      style={[
        styles.card,
        player.isReady && styles.cardReady,
        { transform: [{ scale: pulseAnim }] },
      ]}
    >
      {/* Avatar circle */}
      <View style={styles.avatarCircle}>
        <Text style={styles.avatarEmoji}>{player.avatar}</Text>
      </View>

      {/* Name */}
      <Text style={styles.playerName} numberOfLines={1}>{player.name}</Text>

      {/* Role status */}
      <Text style={styles.roleHidden}>Role hidden</Text>

      {/* READY badge */}
      {player.isReady ? (
        <View style={styles.readyPill}>
          <Text style={styles.readyPillText}>READY</Text>
        </View>
      ) : (
        <View style={styles.waitingPill}>
          <Text style={styles.waitingPillText}>Waiting...</Text>
        </View>
      )}

      {/* Transfer button — only for non-local players */}
      {!player.isLocal && onTransfer && (
        <TouchableOpacity
          style={styles.transferBtn}
          onPress={() => onTransfer(player)}
        >
          <Text style={styles.transferBtnText}>💸</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

// ── Empty Slot ────────────────────────────────────────────────────────────────
function EmptySlot() {
  const dotAnim = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(dotAnim, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ]),
    ).start();
  }, [dotAnim]);
  return (
    <Animated.View style={[styles.card, styles.cardEmpty, { opacity: dotAnim }]}>
      <View style={[styles.avatarCircle, styles.avatarCircleEmpty]}>
        <Text style={styles.avatarEmptyIcon}>?</Text>
      </View>
      <Text style={styles.emptySlotText}>Waiting...</Text>
    </Animated.View>
  );
}

export default function LobbyScreen({ navigation }: Props) {
  const {
    lobbyPlayers, isSearching, countdown, roomPhase,
    setReady, leaveRoom, inventory, equipItem,
  } = useGameStore();
  const [_transferTarget, setTransferTarget] = useState<HeistPlayer | null>(null);
  const [itemTrayOpen, setItemTrayOpen] = useState(false);
  const hubAnim = useRef(new Animated.Value(0)).current;

  // Hub spin animation
  useEffect(() => {
    Animated.loop(
      Animated.timing(hubAnim, { toValue: 1, duration: 4000, useNativeDriver: true }),
    ).start();
  }, [hubAnim]);

  const hubRotate = hubAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  // Navigate when action phase starts
  useEffect(() => {
    if (roomPhase === 'action') {
      navigation.replace('Game');
    }
  }, [roomPhase, navigation]);

  // Build 4 slots (fill empties)
  const slots = Array.from({ length: 4 }, (_, i) => lobbyPlayers[i] ?? null);

  const allReady = lobbyPlayers.length === 4 && lobbyPlayers.every((p) => p.isReady);
  const localPlayer = lobbyPlayers.find((p) => p.isLocal);
  const localReady = localPlayer?.isReady ?? false;

  // Items that can be used in-match
  const usableItems = inventory.filter((i) =>
    i.type === 'trap' || i.type === 'smoke_bomb' || i.type === 'bug_device' || i.type === 'decoy',
  );
  const equippedItem = usableItems.find((i) => i.isEquipped);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* ── Header ──────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => { leaveRoom(); navigation.goBack(); }}
        >
          <Text style={styles.backBtnText}>{'<'}</Text>
        </TouchableOpacity>

        <Text style={styles.title}>
          {isSearching ? 'Finding Players...' : 'The Vault Room'}
        </Text>

        {/* Lock icon + count */}
        <View style={styles.countBadge}>
          <Text style={styles.countLockIcon}>🔒</Text>
          <Text style={styles.countText}>{lobbyPlayers.length}/4</Text>
        </View>
      </View>

      {/* ── Countdown overlay ──────────────────────────────────── */}
      {countdown !== null && (
        <View style={styles.countdownOverlay}>
          <Text style={styles.countdownText}>{countdown}</Text>
        </View>
      )}

      {/* ── 4-slot grid + center hub ───────────────────────────── */}
      <View style={styles.gridContainer}>
        {/* Row 1 */}
        <View style={styles.row}>
          {slots[0] ? (
            <PlayerSlot
              player={slots[0]}
              index={0}
              onTransfer={(p) => { setTransferTarget(p); navigation.navigate('Transfer', { targetPlayer: p }); }}
            />
          ) : <EmptySlot />}

          {slots[1] ? (
            <PlayerSlot
              player={slots[1]}
              index={1}
              onTransfer={(p) => { setTransferTarget(p); navigation.navigate('Transfer', { targetPlayer: p }); }}
            />
          ) : <EmptySlot />}
        </View>

        {/* Center Hub */}
        <View style={styles.hubRow}>
          <Animated.View style={[styles.hub, { transform: [{ rotate: hubRotate }] }]}>
            <View style={styles.hubInner} />
          </Animated.View>
        </View>

        {/* Row 2 */}
        <View style={styles.row}>
          {slots[2] ? (
            <PlayerSlot
              player={slots[2]}
              index={2}
              onTransfer={(p) => { setTransferTarget(p); navigation.navigate('Transfer', { targetPlayer: p }); }}
            />
          ) : <EmptySlot />}

          {slots[3] ? (
            <PlayerSlot
              player={slots[3]}
              index={3}
              onTransfer={(p) => { setTransferTarget(p); navigation.navigate('Transfer', { targetPlayer: p }); }}
            />
          ) : <EmptySlot />}
        </View>
      </View>

      {/* ── Item Tray ───────────────────────────────────────────── */}
      <View style={styles.itemTray}>
        <TouchableOpacity
          style={styles.itemTrayHeader}
          onPress={() => setItemTrayOpen((v) => !v)}
        >
          <View style={styles.itemTrayLeft}>
            <Text style={styles.itemTrayTitle}>🎒 ITEM FOR MATCH</Text>
            {equippedItem ? (
              <View style={styles.equippedChip}>
                <Text style={styles.equippedChipText}>
                  {equippedItem.icon} {equippedItem.name}
                </Text>
              </View>
            ) : (
              <Text style={styles.noItemLabel}>None equipped</Text>
            )}
          </View>
          <Text style={styles.itemTrayToggle}>{itemTrayOpen ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {itemTrayOpen && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.itemScroll}
          >
            {usableItems.length === 0 ? (
              <Text style={styles.noItemLabel}>No usable items. Buy from Shop!</Text>
            ) : (
              usableItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.itemCard, item.isEquipped && styles.itemCardEquipped]}
                  onPress={() => equipItem(item.id)}
                >
                  <Text style={styles.itemCardIcon}>{item.icon}</Text>
                  <Text style={styles.itemCardName} numberOfLines={2}>{item.name}</Text>
                  {item.isEquipped && (
                    <View style={styles.itemEquippedBadge}>
                      <Text style={styles.itemEquippedBadgeText}>✓ ACTIVE</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        )}
      </View>

      {/* ── Ready Button ────────────────────────────────────────── */}
      <View style={styles.footer}>
        {allReady ? (
          <View style={styles.allReadyBanner}>
            <Text style={styles.allReadyText}>⚡ All players ready! Starting...</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.readyBtn, localReady && styles.readyBtnDone]}
            onPress={setReady}
            disabled={localReady}
          >
            <Text style={[styles.readyBtnText, localReady && styles.readyBtnTextDone]}>
              {localReady ? '✓ READY' : 'TAP TO READY UP'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  // ── Header ──────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold as any,
    lineHeight: 20,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    color: Colors.textPrimary,
    fontWeight: FontWeight.bold as any,
    fontSize: FontSize.md,
    letterSpacing: 0.3,
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  countLockIcon: { fontSize: 13 },
  countText: {
    color: Colors.gold,
    fontWeight: FontWeight.bold as any,
    fontSize: FontSize.sm,
  },

  // ── Countdown ───────────────────────────────────────────────────────────
  countdownOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
    zIndex: 99, backgroundColor: 'rgba(74,53,114,0.80)',
  },
  countdownText: {
    fontSize: 120,
    fontWeight: FontWeight.bold as any,
    color: Colors.gold,
    textShadowColor: Colors.goldGlow,
    textShadowRadius: 30,
    textShadowOffset: { width: 0, height: 0 },
  },

  // ── Grid ────────────────────────────────────────────────────────────────
  gridContainer: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  hubRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: -10,
    zIndex: 10,
  },
  hub: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#5B8DEF',
    borderWidth: 4,
    borderColor: '#7AABFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5B8DEF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 10,
  },
  hubInner: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#A8C8FF',
    opacity: 0.7,
  },

  // ── Player Card ─────────────────────────────────────────────────────────
  card: {
    flex: 1,
    minHeight: CARD_H,
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    shadowColor: 'rgba(74,53,114,0.25)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardReady: {
    borderColor: Colors.shareGreen,
    shadowColor: Colors.shareGreen,
    shadowOpacity: 0.4,
  },
  cardEmpty: {
    borderColor: 'rgba(155,126,213,0.20)',
    backgroundColor: 'rgba(255,255,255,0.45)',
  },

  // ── Avatar ──────────────────────────────────────────────────────────────
  avatarCircle: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    shadowColor: 'rgba(74,53,114,0.30)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarCircleEmpty: {
    backgroundColor: 'rgba(155,126,213,0.30)',
  },
  avatarEmoji: { fontSize: AVATAR_SIZE * 0.52 },
  avatarEmptyIcon: {
    fontSize: AVATAR_SIZE * 0.42,
    color: 'rgba(155,126,213,0.60)',
    fontWeight: FontWeight.bold as any,
  },

  // ── Card text ───────────────────────────────────────────────────────────
  playerName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold as any,
    color: '#2D1B69',
    textAlign: 'center',
    marginBottom: 2,
  },
  roleHidden: {
    fontSize: FontSize.xs,
    color: '#8A7AAF',
    marginBottom: Spacing.sm,
  },
  emptySlotText: {
    fontSize: FontSize.xs,
    color: 'rgba(155,126,213,0.70)',
    fontStyle: 'italic',
  },

  // ── Ready / Waiting pill ────────────────────────────────────────────────
  readyPill: {
    backgroundColor: Colors.shareGreen,
    borderRadius: Radius.full,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  readyPillText: {
    fontSize: 11,
    fontWeight: FontWeight.bold as any,
    color: '#0D2B2B',
    letterSpacing: 0.5,
  },
  waitingPill: {
    backgroundColor: 'rgba(155,126,213,0.18)',
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(155,126,213,0.35)',
  },
  waitingPillText: {
    fontSize: 11,
    color: '#8A7AAF',
    fontStyle: 'italic',
  },

  // ── Transfer button ─────────────────────────────────────────────────────
  transferBtn: {
    marginTop: 8,
    backgroundColor: Colors.goldLight,
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  transferBtnText: { fontSize: 14 },

  // ── Item Tray ───────────────────────────────────────────────────────────
  itemTray: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
  },
  itemTrayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
  },
  itemTrayLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemTrayTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold as any,
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  itemTrayToggle: { fontSize: FontSize.xs, color: Colors.textPrimary },
  equippedChip: {
    backgroundColor: 'rgba(81,229,255,0.20)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Colors.shareGreen,
  },
  equippedChipText: {
    fontSize: 10,
    color: Colors.shareGreen,
    fontWeight: FontWeight.bold as any,
  },
  noItemLabel: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.55)',
    paddingVertical: 2,
  },
  itemScroll: { padding: Spacing.sm, gap: 8 },
  itemCard: {
    width: 80,
    backgroundColor: 'rgba(255,255,255,0.20)',
    borderRadius: Radius.md,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.30)',
  },
  itemCardEquipped: {
    borderColor: Colors.shareGreen,
    backgroundColor: 'rgba(81,229,255,0.12)',
  },
  itemCardIcon: { fontSize: 28, marginBottom: 4 },
  itemCardName: {
    fontSize: 9,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 13,
  },
  itemEquippedBadge: {
    marginTop: 4,
    backgroundColor: Colors.shareGreen,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  itemEquippedBadgeText: {
    fontSize: 8,
    color: '#0D2B2B',
    fontWeight: FontWeight.bold as any,
  },

  // ── Footer ──────────────────────────────────────────────────────────────
  footer: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.lg },
  readyBtn: {
    backgroundColor: Colors.gold,
    borderRadius: Radius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: Colors.goldGlow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  readyBtnDone: {
    backgroundColor: Colors.shareGreen,
    shadowColor: Colors.shareGreen,
  },
  readyBtnText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold as any,
    color: Colors.textOnYellow,
    letterSpacing: 2,
  },
  readyBtnTextDone: { color: '#0D2B2B' },
  allReadyBanner: {
    backgroundColor: 'rgba(81,229,255,0.15)',
    borderRadius: Radius.lg,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.shareGreen,
  },
  allReadyText: {
    fontSize: FontSize.md,
    color: Colors.shareGreen,
    fontWeight: FontWeight.bold as any,
  },
});
