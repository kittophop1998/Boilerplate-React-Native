// ─── TradeScreen — Stamp Duel P2P Trade Room ─────────────────────────────────
// Create Room → Share Code → Select Card → Confirm Trade
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  StatusBar,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@theme/index';
import StampCard from '@components/StampCard';
import { loadPlayer, generateRoomCode } from '@services/stampService';
import type { PlayerProfile, OwnedCard, TradeRoom } from '@game/stamp';

type TradeStep = 'menu' | 'create' | 'join' | 'offer' | 'waiting' | 'confirm';

type Props = { navigation: any };

export default function TradeScreen({ navigation }: Props) {
  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const [step, setStep] = useState<TradeStep>('menu');
  const [room, setRoom] = useState<TradeRoom | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const [selectedCard, setSelectedCard] = useState<OwnedCard | null>(null);

  useEffect(() => { loadPlayer().then(setPlayer); }, []);

  // ── Create room ────────────────────────────────────────────────────────────
  const handleCreateRoom = useCallback(() => {
    const code = generateRoomCode();
    const newRoom: TradeRoom = {
      roomCode: code,
      creatorId: player?.id ?? 'player-local',
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 10 * 60_000).toISOString(), // 10 min
    };
    setRoom(newRoom);
    setStep('create');
  }, [player]);

  // ── Share room code ────────────────────────────────────────────────────────
  const handleShare = useCallback(async () => {
    if (!room) return;
    try {
      await Share.share({
        message: `Join my Stamp Duel trade room! Code: ${room.roomCode}`,
      });
    } catch {}
  }, [room]);

  // ── Join room ──────────────────────────────────────────────────────────────
  const handleJoinRoom = useCallback(() => {
    const code = joinCode.trim().toUpperCase();
    if (code.length !== 6) {
      Alert.alert('Invalid Code', 'Room code must be 6 characters.');
      return;
    }
    // Mock: simulate joining
    const joinedRoom: TradeRoom = {
      roomCode: code,
      creatorId: 'other-player',
      joinerId: player?.id,
      status: 'active',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 10 * 60_000).toISOString(),
    };
    setRoom(joinedRoom);
    setStep('offer');
  }, [joinCode, player]);

  // ── Confirm offer ──────────────────────────────────────────────────────────
  const handleConfirmOffer = useCallback(() => {
    if (!selectedCard) {
      Alert.alert('Select a card', 'Please choose a card to offer for trade.');
      return;
    }
    setStep('waiting');
    // Mock: simulate partner confirming after 2s
    setTimeout(() => setStep('confirm'), 2000);
  }, [selectedCard]);

  // ── Complete trade ─────────────────────────────────────────────────────────
  const handleCompleteTrade = useCallback(() => {
    Alert.alert(
      '✅ Trade Complete!',
      `You traded "${selectedCard?.card.name}". Check your gallery for the new stamp!`,
      [{ text: 'Back to Gallery', onPress: () => { setStep('menu'); navigation.goBack(); } }],
    );
  }, [selectedCard, navigation]);

  const handleCancel = useCallback(() => {
    setStep('menu');
    setRoom(null);
    setSelectedCard(null);
    setJoinCode('');
  }, []);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* ── Nav header ─────────────────────────────────────────────────────── */}
      <View style={styles.navHeader}>
        <TouchableOpacity
          onPress={step === 'menu' ? () => navigation.goBack() : handleCancel}
          style={styles.backBtn}
        >
          <Text style={styles.backIcon}>{step === 'menu' ? '←' : '✕'}</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Trade Room</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* ══ STEP: MENU ══════════════════════════════════════════════════════ */}
        {step === 'menu' && (
          <View style={styles.menuContainer}>
            <Text style={styles.menuEmoji}>🤝</Text>
            <Text style={styles.menuTitle}>Trade Stamps</Text>
            <Text style={styles.menuSub}>Exchange stamps directly with a friend — fair and transparent.</Text>

            <TouchableOpacity style={styles.menuBtn} onPress={handleCreateRoom} activeOpacity={0.85}>
              <Text style={styles.menuBtnEmoji}>🏠</Text>
              <View style={styles.menuBtnInfo}>
                <Text style={styles.menuBtnLabel}>Create Room</Text>
                <Text style={styles.menuBtnSub}>Get a code & share with a friend</Text>
              </View>
              <Text style={styles.menuBtnArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuBtn} onPress={() => setStep('join')} activeOpacity={0.85}>
              <Text style={styles.menuBtnEmoji}>🚪</Text>
              <View style={styles.menuBtnInfo}>
                <Text style={styles.menuBtnLabel}>Join Room</Text>
                <Text style={styles.menuBtnSub}>Enter a 6-letter room code</Text>
              </View>
              <Text style={styles.menuBtnArrow}>›</Text>
            </TouchableOpacity>

            <View style={styles.rulesCard}>
              <Text style={styles.rulesTitle}>📜 Trade Rules</Text>
              <Text style={styles.ruleItem}>• Both players must confirm the trade</Text>
              <Text style={styles.ruleItem}>• Only one card can be traded per session</Text>
              <Text style={styles.ruleItem}>• Room expires after 10 minutes</Text>
              <Text style={styles.ruleItem}>• Trades are final — choose carefully!</Text>
            </View>
          </View>
        )}

        {/* ══ STEP: JOIN ══════════════════════════════════════════════════════ */}
        {step === 'join' && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepEmoji}>🔑</Text>
            <Text style={styles.stepTitle}>Enter Room Code</Text>
            <Text style={styles.stepSub}>Ask your friend for their 6-character room code.</Text>
            <TextInput
              style={styles.codeInput}
              value={joinCode}
              onChangeText={(t) => setJoinCode(t.toUpperCase().slice(0, 6))}
              placeholder="ABCDE1"
              placeholderTextColor={Colors.textDisabled}
              maxLength={6}
              autoCapitalize="characters"
              autoCorrect={false}
              textAlign="center"
            />
            <TouchableOpacity
              style={[styles.actionBtn, joinCode.length !== 6 && styles.actionBtnDisabled]}
              onPress={handleJoinRoom}
              disabled={joinCode.length !== 6}
              activeOpacity={0.85}
            >
              <Text style={styles.actionBtnText}>Join Room</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ══ STEP: CREATE (show code) ════════════════════════════════════════ */}
        {step === 'create' && room && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepEmoji}>📤</Text>
            <Text style={styles.stepTitle}>Share This Code</Text>
            <Text style={styles.stepSub}>Send this code to your friend so they can join.</Text>

            <View style={styles.roomCodeBox}>
              <Text style={styles.roomCode}>{room.roomCode}</Text>
            </View>

            <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.85}>
              <Text style={styles.shareBtnText}>📤 Share Code</Text>
            </TouchableOpacity>

            <Text style={styles.waitingHint}>Once your friend joins, you can select your card to offer.</Text>

            <TouchableOpacity style={styles.actionBtn} onPress={() => setStep('offer')} activeOpacity={0.85}>
              <Text style={styles.actionBtnText}>Friend Joined → Select Card</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ══ STEP: OFFER (select a card) ═════════════════════════════════════ */}
        {step === 'offer' && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepEmoji}>🃏</Text>
            <Text style={styles.stepTitle}>Choose Your Offer</Text>
            <Text style={styles.stepSub}>Select one stamp from your collection to offer.</Text>

            {selectedCard && (
              <View style={styles.selectedOffer}>
                <StampCard card={selectedCard.card} size="large" isSelected />
                <TouchableOpacity onPress={() => setSelectedCard(null)} style={styles.clearSelection}>
                  <Text style={styles.clearSelectionText}>Clear selection</Text>
                </TouchableOpacity>
              </View>
            )}

            {!selectedCard && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardPicker}>
                {(player?.collection ?? []).map((oc) => (
                  <TouchableOpacity key={oc.instanceId} onPress={() => setSelectedCard(oc)} activeOpacity={0.85}>
                    <StampCard card={oc.card} size="medium" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <TouchableOpacity
              style={[styles.actionBtn, !selectedCard && styles.actionBtnDisabled]}
              onPress={handleConfirmOffer}
              disabled={!selectedCard}
              activeOpacity={0.85}
            >
              <Text style={styles.actionBtnText}>Confirm Offer</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ══ STEP: WAITING ══════════════════════════════════════════════════ */}
        {step === 'waiting' && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepEmoji}>⏳</Text>
            <Text style={styles.stepTitle}>Waiting for Partner…</Text>
            <Text style={styles.stepSub}>Your friend is reviewing your offer. Please wait.</Text>
            {selectedCard && (
              <View style={styles.offerPreview}>
                <Text style={styles.offerLabel}>Your offer:</Text>
                <StampCard card={selectedCard.card} size="medium" />
              </View>
            )}
          </View>
        )}

        {/* ══ STEP: CONFIRM ══════════════════════════════════════════════════ */}
        {step === 'confirm' && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepEmoji}>✅</Text>
            <Text style={styles.stepTitle}>Both Sides Ready!</Text>
            <Text style={styles.stepSub}>Review the trade and confirm to complete.</Text>

            <View style={styles.tradePreviewRow}>
              <View style={styles.tradeSide}>
                <Text style={styles.tradeSideLabel}>You give</Text>
                {selectedCard && <StampCard card={selectedCard.card} size="medium" />}
              </View>
              <Text style={styles.tradeArrow}>⇄</Text>
              <View style={styles.tradeSide}>
                <Text style={styles.tradeSideLabel}>You receive</Text>
                {/* Mock opponent card */}
                <StampCard card={{ id: 'u002', name: 'Neon Alley', artist: 'T. Yoshida', artworkEmoji: '🎆', artworkColor: '#F9EBEA', rarity: 'uncommon', series: 'Street Art', power: { top: 6, bottom: 3, left: 4, right: 5 }, dropRate: 0.25, flavorText: 'Light dances on wet asphalt.' }} size="medium" />
              </View>
            </View>

            <TouchableOpacity style={styles.actionBtn} onPress={handleCompleteTrade} activeOpacity={0.85}>
              <Text style={styles.actionBtnText}>✅ Complete Trade</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelTradeBtn} onPress={handleCancel} activeOpacity={0.8}>
              <Text style={styles.cancelTradeBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  backBtn: { padding: 4 },
  backIcon: { fontSize: 22, color: Colors.textPrimary },
  navTitle: { flex: 1, fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, textAlign: 'center' },
  content: { paddingBottom: 48 },
  menuContainer: { alignItems: 'center', paddingHorizontal: Spacing.md, paddingTop: Spacing.xl },
  menuEmoji: { fontSize: 56, marginBottom: Spacing.md },
  menuTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.xs },
  menuSub: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.xl, lineHeight: 20 },
  menuBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    width: '100%',
    gap: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  menuBtnEmoji: { fontSize: 28 },
  menuBtnInfo: { flex: 1 },
  menuBtnLabel: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  menuBtnSub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  menuBtnArrow: { fontSize: 22, color: Colors.textSecondary },
  rulesCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    width: '100%',
    marginTop: Spacing.lg,
  },
  rulesTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  ruleItem: { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: 4, lineHeight: 18 },
  stepContainer: { alignItems: 'center', paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, gap: Spacing.md },
  stepEmoji: { fontSize: 56 },
  stepTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  stepSub: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  codeInput: {
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: 8,
    backgroundColor: Colors.surface,
    width: '100%',
  },
  roomCodeBox: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xxl,
  },
  roomCode: {
    fontSize: FontSize.display,
    fontWeight: FontWeight.bold,
    color: Colors.textOnDark,
    letterSpacing: 10,
  },
  shareBtn: {
    backgroundColor: Colors.accentLight,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
  },
  shareBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.semiBold, color: Colors.accent },
  waitingHint: { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center' },
  actionBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    width: '100%',
    alignItems: 'center',
  },
  actionBtnDisabled: { opacity: 0.4 },
  actionBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textOnDark },
  selectedOffer: { alignItems: 'center', gap: Spacing.xs },
  clearSelection: { padding: Spacing.xs },
  clearSelectionText: { fontSize: FontSize.xs, color: Colors.lose },
  cardPicker: { gap: Spacing.sm, paddingVertical: Spacing.sm },
  offerPreview: { alignItems: 'center', gap: Spacing.xs },
  offerLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  tradePreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    width: '100%',
    justifyContent: 'center',
  },
  tradeSide: { alignItems: 'center', gap: Spacing.xs, flex: 1 },
  tradeSideLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semiBold, color: Colors.textSecondary, textTransform: 'uppercase' },
  tradeArrow: { fontSize: FontSize.xxl, color: Colors.accent },
  cancelTradeBtn: { paddingVertical: Spacing.sm },
  cancelTradeBtnText: { fontSize: FontSize.sm, color: Colors.lose },
  headerSpacer: { width: 32 },
});
