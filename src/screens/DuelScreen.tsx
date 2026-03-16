// ─── DuelScreen — Stamp Duel 3×3 Grid Battle ─────────────────────────────────
// Two-player card placement game. Tap card from hand → tap grid cell to place.
// 4-direction power comparison — capture adjacent enemy cards.
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  StatusBar,
  ScrollView,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@theme/index';
import StampCard from '@components/StampCard';
import {
  loadPlayer,
  savePlayer,
  createDuelState,
  placeCard,
  aiMove,
} from '@services/stampService';
import type { DuelState, OwnedCard, GridPosition } from '@game/stamp';

const CELL_OWNER_COLORS = {
  player: Colors.rarityUncommon,
  opponent: Colors.lose,
  null: Colors.surfaceElevated,
};

type Props = { navigation: any };

export default function DuelScreen({ navigation }: Props) {
  const [duel, setDuel] = useState<DuelState | null>(null);
  const [selectedCard, setSelectedCard] = useState<OwnedCard | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const resultAnim = useRef(new Animated.Value(0)).current;

  // ── Init duel with first 5 player cards ──────────────────────────────────
  useEffect(() => {
    (async () => {
      const player = await loadPlayer();
      const hand = player.collection.slice(0, 5);
      if (hand.length < 3) {
        Alert.alert('Not enough stamps!', 'You need at least 3 stamps to duel. Pull more cards first!', [
          { text: 'Explore', onPress: () => navigation.navigate('Gacha') },
          { text: 'Cancel', onPress: () => navigation.goBack() },
        ]);
        return;
      }
      setDuel(createDuelState(hand));
    })();
  }, [navigation]);

  const showResult = useCallback((state: DuelState) => {
    Animated.spring(resultAnim, { toValue: 1, useNativeDriver: true }).start();
    const msg = state.winner === 'player'
      ? `🎉 You Won! ${state.playerScore} – ${state.opponentScore}`
      : state.winner === 'opponent'
      ? `😔 You Lost. ${state.playerScore} – ${state.opponentScore}`
      : `🤝 Draw! ${state.playerScore} – ${state.opponentScore}`;

    setTimeout(() => {
      Alert.alert('Duel Over', msg, [
        {
          text: 'Play Again', onPress: async () => {
            const player = await loadPlayer();
            if (state.winner === 'player') {
              await savePlayer({ ...player, wins: player.wins + 1 });
            } else if (state.winner === 'opponent') {
              await savePlayer({ ...player, losses: player.losses + 1 });
            }
            const hand = player.collection.slice(0, 5);
            setDuel(createDuelState(hand));
            resultAnim.setValue(0);
          },
        },
        { text: 'Back to Gallery', onPress: () => navigation.goBack() },
      ]);
    }, 400);
  }, [resultAnim, navigation]);

  // ── AI opponent turn ───────────────────────────────────────────────────────
  const runAiTurn = useCallback(async (state: DuelState) => {
    if (state.currentTurn !== 'opponent' || state.phase === 'finished') return;
    setIsAiThinking(true);
    await new Promise<void>((r) => setTimeout(r, 900));
    const newState = aiMove(state);
    setDuel(newState);
    setIsAiThinking(false);

    if (newState.phase === 'finished') {
      showResult(newState);
    } else if (newState.currentTurn === 'opponent') {
      runAiTurn(newState);
    }
  }, [showResult]);

  // ── Handle grid cell tap ───────────────────────────────────────────────────
  const handleCellPress = useCallback((position: GridPosition) => {
    if (!duel || !selectedCard || duel.currentTurn !== 'player') return;
    const cell = duel.grid[position];
    if (cell.card !== null) return; // already placed

    Vibration.vibrate(30);
    const newState = placeCard(duel, selectedCard.card, position, 'player');
    setSelectedCard(null);
    setDuel(newState);

    if (newState.phase === 'finished') {
      showResult(newState);
    } else {
      runAiTurn(newState);
    }
  }, [duel, selectedCard, runAiTurn, showResult]);

  if (!duel) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingEmoji}>⚔️</Text>
          <Text style={styles.loadingText}>Preparing duel board…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} hidden={true} />

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.scoreBox}>
          <ScorePill label="You" score={duel.playerScore} color={CELL_OWNER_COLORS.player} />
          <Text style={styles.scoreSep}>–</Text>
          <ScorePill label="AI" score={duel.opponentScore} color={CELL_OWNER_COLORS.opponent} />
        </View>
        <View style={styles.turnIndicator}>
          {isAiThinking ? (
            <Text style={styles.turnText}>🤔 AI…</Text>
          ) : duel.currentTurn === 'player' ? (
            <Text style={[styles.turnText, { color: Colors.accent }]}>Your Turn</Text>
          ) : (
            <Text style={styles.turnText}>Waiting…</Text>
          )}
        </View>
      </View>

      {/* ── Selected card preview ────────────────────────────────────────── */}
      <View style={styles.selectedPreview}>
        {selectedCard ? (
          <View style={styles.selectedRow}>
            <Text style={styles.selectedLabel}>Placing: </Text>
            <Text style={styles.selectedName}>{selectedCard.card.name}</Text>
            <TouchableOpacity onPress={() => setSelectedCard(null)} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>✕ Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.hintText}>
            {duel.currentTurn === 'player' && duel.phase !== 'finished'
              ? '👇 Select a card from your hand below'
              : duel.phase === 'finished' ? '✅ Duel complete!' : '⏳ Opponent is thinking…'}
          </Text>
        )}
      </View>

      {/* ── 3×3 Grid ────────────────────────────────────────────────────── */}
      <View style={styles.grid}>
        {duel.grid.map((cell) => {
          const ownerColor = cell.ownedBy ? CELL_OWNER_COLORS[cell.ownedBy] : CELL_OWNER_COLORS.null;
          const isDropTarget = selectedCard && cell.card === null && duel.currentTurn === 'player';
          return (
            <TouchableOpacity
              key={cell.position}
              style={[
                styles.cell,
                { borderColor: ownerColor },
                cell.ownedBy ? styles.cellOwned : null,
                isDropTarget && styles.cellDropTarget,
              ]}
              onPress={() => handleCellPress(cell.position as GridPosition)}
              activeOpacity={isDropTarget ? 0.7 : 1}
              disabled={!isDropTarget}
            >
              {cell.card ? (
                <StampCard card={cell.card} size="small" />
              ) : (
                <Text style={styles.cellEmpty}>{isDropTarget ? '+' : ''}</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Player hand ─────────────────────────────────────────────────── */}
      <View style={styles.handSection}>
        <Text style={styles.handLabel}>Your Hand ({duel.playerHand.length})</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.handScroll}
        >
          {duel.playerHand.map((oc) => (
            <View key={oc.instanceId} style={styles.handCardWrapper}>
              <StampCard
                card={oc.card}
                size="medium"
                isSelected={selectedCard?.instanceId === oc.instanceId}
                onPress={() => {
                  if (duel.currentTurn !== 'player') return;
                  setSelectedCard(
                    selectedCard?.instanceId === oc.instanceId ? null : oc,
                  );
                }}
                disabled={duel.currentTurn !== 'player'}
              />
            </View>
          ))}
          {duel.playerHand.length === 0 && (
            <Text style={styles.handEmpty}>No cards left</Text>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// ─── ScorePill ────────────────────────────────────────────────────────────────
function ScorePill({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <View style={[scorePillStyles.pill, { borderColor: color }]}>
      <Text style={[scorePillStyles.score, { color }]}>{score}</Text>
      <Text style={scorePillStyles.label}>{label}</Text>
    </View>
  );
}
const scorePillStyles = StyleSheet.create({
  pill: {
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.md,
    borderWidth: 2,
    minWidth: 44,
  },
  score: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  label: { fontSize: FontSize.xs, color: Colors.textSecondary },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingEmoji: { fontSize: 56, marginBottom: Spacing.md },
  loadingText: { fontSize: FontSize.md, color: Colors.textSecondary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  backBtn: { padding: 4 },
  backIcon: { fontSize: 22, color: Colors.textPrimary },
  scoreBox: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  scoreSep: { fontSize: FontSize.lg, color: Colors.textSecondary, fontWeight: FontWeight.bold },
  turnIndicator: { minWidth: 80, alignItems: 'flex-end' },
  turnText: { fontSize: FontSize.sm, fontWeight: FontWeight.semiBold, color: Colors.textSecondary },
  selectedPreview: {
    height: 36,
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surfaceElevated,
  },
  selectedRow: { flexDirection: 'row', alignItems: 'center' },
  selectedLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  selectedName: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.accent, flex: 1 },
  cancelBtn: { paddingHorizontal: Spacing.sm, paddingVertical: 2 },
  cancelText: { fontSize: FontSize.xs, color: Colors.lose },
  hintText: { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: Spacing.md,
    gap: Spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  cell: {
    width: '30%',
    aspectRatio: 0.75,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: Colors.border,
    borderWidth: 1,
  },
  cellOwned: { borderWidth: 2 },
  cellDropTarget: {
    borderColor: Colors.accent,
    borderWidth: 2,
    backgroundColor: Colors.accentLight,
  },
  cellEmpty: { fontSize: 24, color: Colors.accent, opacity: 0.5 },
  handSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  handLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeight.semiBold,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  handScroll: { paddingHorizontal: Spacing.md, gap: Spacing.sm },
  handCardWrapper: {},
  handEmpty: { fontSize: FontSize.sm, color: Colors.textDisabled, alignSelf: 'center', marginLeft: Spacing.md },
});
