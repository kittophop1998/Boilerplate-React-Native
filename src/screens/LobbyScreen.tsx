// ─── Heist — Lobby Screen ────────────────────────────────────────────────────
// 4-slot grid · Role hidden until game ends · Item equip tray before match
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
const SLOT_SIZE = W * 0.38;

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
  const readyAnim = useRef(new Animated.Value(0)).current;
  const flipAnim = useRef(new Animated.Value(0)).current;
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    if (player.isReady) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(readyAnim, { toValue: 1, duration: 700, useNativeDriver: false }),
          Animated.timing(readyAnim, { toValue: 0.3, duration: 700, useNativeDriver: false }),
        ]),
      ).start();
    } else {
      readyAnim.setValue(0);
    }
  }, [player.isReady, readyAnim]);

  // Only local player can flip to see their own role
  const canFlip = player.isLocal;

  const handleFlip = () => {
    if (!canFlip) return;
    Animated.spring(flipAnim, {
      toValue: flipped ? 0 : 1,
      useNativeDriver: false,
    }).start();
    setFlipped(!flipped);
  };

  const frontRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });
  const readyBorder = readyAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(0,230,118,0)', 'rgba(0,230,118,1)'],
  });

  return (
    <View style={styles.slotWrapper}>
      {/* Role Card — flip only for local player */}
      <TouchableOpacity onPress={handleFlip} activeOpacity={canFlip ? 0.9 : 1}>
        {/* Front — avatar */}
        <Animated.View
          style={[
            styles.slot,
            styles.cardFront,
            { borderColor: player.isReady ? readyBorder : Colors.divider },
            { transform: [{ perspective: 800 }, { rotateY: frontRotate }] },
          ]}
        >
          <Text style={styles.slotAvatar}>{player.avatar}</Text>
          <Text style={styles.slotName} numberOfLines={1}>{player.name}</Text>
          {/* Hint — only local player can tap */}
          {canFlip ? (
            <Text style={styles.slotRoleHint}>👁 Tap to see your role</Text>
          ) : (
            <Text style={styles.slotRoleHiddenHint}>🔒 Role hidden</Text>
          )}
          {player.isReady && (
            <View style={styles.readyBadge}>
              <Text style={styles.readyBadgeText}>✓ READY</Text>
            </View>
          )}
        </Animated.View>

        {/* Back — role (local player only sees real role; others see ❓) */}
        <Animated.View
          style={[
            styles.slot,
            styles.slotBack,
            styles.cardBack,
            !canFlip && styles.slotBackHidden,
            { transform: [{ perspective: 800 }, { rotateY: backRotate }] },
          ]}
        >
          {canFlip ? (
            <>
              <Text style={styles.slotRoleIcon}>{player.roleIcon}</Text>
              <Text style={styles.slotRoleName}>{player.roleName}</Text>
              <Text style={styles.youLabel}>YOUR ROLE</Text>
              <Text style={styles.roleSecretNote}>🔒 Hidden from others</Text>
            </>
          ) : (
            <>
              <Text style={styles.slotRoleIcon}>❓</Text>
              <Text style={styles.slotRoleName}>???</Text>
              <Text style={styles.roleRevealNote}>Revealed after match</Text>
            </>
          )}
        </Animated.View>
      </TouchableOpacity>

      {/* Transfer button — only for non-local players */}
      {!player.isLocal && onTransfer && (
        <TouchableOpacity
          style={styles.transferBtn}
          onPress={() => onTransfer(player)}
        >
          <Text style={styles.transferBtnText}>💸</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function LobbyScreen({ navigation }: Props) {
  const {
    lobbyPlayers, isSearching, countdown, roomPhase,
    setReady, leaveRoom, inventory, equipItem,
  } = useGameStore();
  const [_transferTarget, setTransferTarget] = useState<HeistPlayer | null>(null);
  const [itemTrayOpen, setItemTrayOpen] = useState(false);

  // Navigate when action phase starts
  useEffect(() => {
    if (roomPhase === 'action') {
      navigation.replace('Game');
    }
  }, [roomPhase, navigation]);

  // Only show players who have actually joined
  const slots = lobbyPlayers.slice(0, 4);

  const allReady = lobbyPlayers.length === 4 && lobbyPlayers.every((p) => p.isReady);
  const localPlayer = lobbyPlayers.find((p) => p.isLocal);
  const localReady = localPlayer?.isReady ?? false;

  // Items that can be used in-match (in-match item types)
  const usableItems = inventory.filter((i) =>
    i.type === 'trap' || i.type === 'smoke_bomb' || i.type === 'bug_device' || i.type === 'decoy',
  );
  const equippedItem = usableItems.find((i) => i.isEquipped);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { leaveRoom(); navigation.goBack(); }}>
          <Text style={styles.backBtn}>← Leave</Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          {isSearching ? '🔍 Finding Players...' : '🔒 The Vault Room'}
        </Text>
        <Text style={styles.playerCount}>{lobbyPlayers.length}/4</Text>
      </View>

      {/* Countdown overlay */}
      {countdown !== null && (
        <View style={styles.countdownOverlay}>
          <Text style={styles.countdownText}>{countdown}</Text>
        </View>
      )}

      {/* 4-slot grid */}
      <View style={styles.slotsGrid}>
        {slots.map((player, i) => (
          <PlayerSlot
            key={player.id}
            player={player}
            index={i}
            onTransfer={(p) => {
              setTransferTarget(p);
              navigation.navigate('Transfer', { targetPlayer: p });
            }}
          />
        ))}
      </View>

      {/* Info banner */}
      <View style={styles.roleCardBanner}>
        <Text style={styles.roleCardBannerText}>
          👁 Tap YOUR card to peek your role &nbsp;·&nbsp; � Others stay hidden until reveal
        </Text>
      </View>

      {/* ── Item Tray ────────────────────────────────────────────── */}
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
              <Text style={styles.noItemText}>None equipped</Text>
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
              <Text style={styles.noItemText}>No usable items. Buy from Shop!</Text>
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

      {/* Ready Button */}
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
            <Text style={styles.readyBtnText}>
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

  // Header
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  backBtn: { color: Colors.textSecondary, fontSize: FontSize.sm, minWidth: 60 },
  title: { flex: 1, textAlign: 'center', color: Colors.textPrimary, fontWeight: FontWeight.bold as any, fontSize: FontSize.md },
  playerCount: { color: Colors.gold, fontWeight: FontWeight.bold as any, fontSize: FontSize.md, minWidth: 60, textAlign: 'right' },

  // Countdown
  countdownOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', zIndex: 99, backgroundColor: 'rgba(0,0,0,0.7)' },
  countdownText: { fontSize: 120, fontWeight: FontWeight.bold as any, color: Colors.gold, textShadowColor: Colors.gold, textShadowRadius: 30, textShadowOffset: { width: 0, height: 0 } },

  // Slots
  slotsGrid: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', padding: Spacing.md, alignContent: 'center' },
  slotWrapper: { width: '50%', padding: 8, alignItems: 'center' },
  slot: {
    width: SLOT_SIZE,
    height: SLOT_SIZE * 1.35,
    borderRadius: Radius.lg,
    backgroundColor: Colors.cardBg,
    borderWidth: 2,
    borderColor: Colors.divider,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.sm,
  },
  slotBack: { backgroundColor: '#1a1200', borderColor: Colors.gold, position: 'absolute', top: 0, left: 0 },
  cardFront: { backfaceVisibility: 'hidden' } as any,
  cardBack: { backfaceVisibility: 'hidden' } as any,

  slotAvatar: { fontSize: 40, marginBottom: 6 },
  slotName: { fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: FontWeight.semiBold as any, textAlign: 'center' },
  slotRoleHint: { fontSize: 9, color: Colors.textDisabled, marginTop: 4 },
  slotRoleHiddenHint: { fontSize: 9, color: Colors.stealRed, marginTop: 4, letterSpacing: 0.5 },
  readyBadge: { position: 'absolute', bottom: 8, backgroundColor: 'rgba(0,230,118,0.2)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1, borderColor: Colors.shareGreen },
  readyBadgeText: { fontSize: 9, color: Colors.shareGreen, fontWeight: FontWeight.bold as any },

  slotRoleIcon: { fontSize: 36, marginBottom: 6 },
  slotRoleName: { fontSize: FontSize.sm, color: Colors.gold, fontWeight: FontWeight.bold as any, textAlign: 'center' },
  slotBackHidden: { backgroundColor: '#1a0a0a', borderColor: Colors.stealRed },
  youLabel: { marginTop: 6, fontSize: 10, color: Colors.shieldBlue, fontWeight: FontWeight.bold as any, letterSpacing: 1 },
  roleSecretNote: { fontSize: 9, color: Colors.stealRed, marginTop: 4 },
  roleRevealNote: { fontSize: 9, color: Colors.textDisabled, marginTop: 4 },

  transferBtn: { marginTop: 6, backgroundColor: 'rgba(255,215,0,0.15)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5, borderWidth: 1, borderColor: Colors.gold },
  transferBtnText: { fontSize: 16 },

  // Banner
  roleCardBanner: { marginHorizontal: Spacing.md, marginBottom: Spacing.sm, backgroundColor: Colors.surfaceElevated, borderRadius: Radius.sm, padding: 8, alignItems: 'center' },
  roleCardBannerText: { fontSize: 11, color: Colors.textSecondary },

  // Item Tray
  itemTray: { marginHorizontal: Spacing.md, marginBottom: Spacing.sm, backgroundColor: Colors.surface, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.divider, overflow: 'hidden' },
  itemTrayHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: 10 },
  itemTrayLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemTrayTitle: { fontSize: FontSize.xs, fontWeight: FontWeight.bold as any, color: Colors.textPrimary, letterSpacing: 0.5 },
  itemTrayToggle: { fontSize: FontSize.xs, color: Colors.textSecondary },
  equippedChip: { backgroundColor: 'rgba(0,230,118,0.15)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1, borderColor: Colors.shareGreen },
  equippedChipText: { fontSize: 10, color: Colors.shareGreen, fontWeight: FontWeight.bold as any },
  noItemText: { fontSize: FontSize.xs, color: Colors.textDisabled, paddingHorizontal: Spacing.md, paddingVertical: 8 },
  itemScroll: { padding: Spacing.sm, gap: 8 },
  itemCard: { width: 80, backgroundColor: Colors.cardBg, borderRadius: Radius.md, padding: 8, alignItems: 'center', borderWidth: 1, borderColor: Colors.divider },
  itemCardEquipped: { borderColor: Colors.shareGreen, backgroundColor: 'rgba(0,230,118,0.08)' },
  itemCardIcon: { fontSize: 28, marginBottom: 4 },
  itemCardName: { fontSize: 9, color: Colors.textSecondary, textAlign: 'center', lineHeight: 13 },
  itemEquippedBadge: { marginTop: 4, backgroundColor: Colors.shareGreen, borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1 },
  itemEquippedBadgeText: { fontSize: 8, color: Colors.background, fontWeight: FontWeight.bold as any },

  // Footer
  footer: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xl },
  readyBtn: { backgroundColor: Colors.gold, borderRadius: Radius.md, paddingVertical: 16, alignItems: 'center', shadowColor: Colors.gold, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 8 },
  readyBtnDone: { backgroundColor: Colors.shareGreen, shadowColor: Colors.shareGreen },
  readyBtnText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold as any, color: Colors.background, letterSpacing: 2 },
  allReadyBanner: { backgroundColor: 'rgba(0,230,118,0.15)', borderRadius: Radius.md, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: Colors.shareGreen },
  allReadyText: { fontSize: FontSize.md, color: Colors.shareGreen, fontWeight: FontWeight.bold as any },
});
