// ─── Heist — Chat Screen (Pre-Round Lobby) ────────────────────────────────────
// Players negotiate, bluff, and plan before the next round starts.
// 2-minute countdown. When timer reaches 0 → navigate to Game.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@theme/index';
import { useGameStore } from '../store/gameStore';
import type { ChatMessage } from '@game/game';

const CHAT_DURATION = 120; // 2 minutes in seconds

// ── Mock bot messages that simulate other players chatting ────────────────────
const BOT_MESSAGES: { delay: number; playerId: string; playerName: string; text: string }[] = [
  { delay: 3000,  playerId: 'p2', playerName: 'ShadowFox 🦊',  text: 'Trust me this round, I\'ll share 🤝' },
  { delay: 7000,  playerId: 'p3', playerName: 'IronMask 🎭',   text: 'Last round someone stole from me... 👀' },
  { delay: 12000, playerId: 'p4', playerName: 'GhostRider 👻', text: 'Pool is almost gone, let\'s all share' },
  { delay: 18000, playerId: 'p2', playerName: 'ShadowFox 🦊',  text: 'I\'m going Share, I promise 😇' },
  { delay: 28000, playerId: 'p3', playerName: 'IronMask 🎭',   text: 'Sure sure... we\'ll see 😏' },
  { delay: 40000, playerId: 'p4', playerName: 'GhostRider 👻', text: 'Anyone want to trade info? 🕵️' },
  { delay: 55000, playerId: 'p2', playerName: 'ShadowFox 🦊',  text: '1 minute left! Don\'t betray me!' },
  { delay: 75000, playerId: 'p3', playerName: 'IronMask 🎭',   text: 'Final warning... share or suffer 💀' },
  { delay: 95000, playerId: 'p4', playerName: 'GhostRider 👻', text: '⚔️ May the best heist win!' },
];

type Props = { navigation: any };

// ── Timer helper ──────────────────────────────────────────────────────────────
function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function ChatScreen({ navigation }: Props) {
  const { localPlayerId, localPlayerName, localAvatar, currentRound } = useGameStore();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [timeLeft, setTimeLeft] = useState(CHAT_DURATION);
  const [goingToGame, setGoingToGame] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // ── Timer countdown ──────────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ── Navigate to game when timer ends ─────────────────────────────────────────
  useEffect(() => {
    if (timeLeft === 0 && !goingToGame) {
      setGoingToGame(true);
      // Small delay so player sees "0:00"
      setTimeout(() => {
        navigation.replace('Game');
      }, 800);
    }
  }, [timeLeft, goingToGame, navigation]);

  // ── Pulse animation on timer when < 30s ──────────────────────────────────────
  useEffect(() => {
    if (timeLeft <= 30) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ]),
      ).start();
    }
  }, [timeLeft <= 30, pulseAnim]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Schedule bot messages ─────────────────────────────────────────────────────
  useEffect(() => {
    const timers = BOT_MESSAGES.map(({ delay, playerId, playerName, text }) =>
      setTimeout(() => {
        const msg: ChatMessage = {
          playerId,
          playerName,
          text,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, msg]);
      }, delay),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  // ── Auto-scroll to bottom on new messages ────────────────────────────────────
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);
    }
  }, [messages]);

  // ── Send message ─────────────────────────────────────────────────────────────
  const sendMessage = useCallback(() => {
    const trimmed = inputText.trim();
    if (!trimmed) { return; }
    const msg: ChatMessage = {
      playerId: localPlayerId,
      playerName: `${localAvatar} ${localPlayerName}`,
      text: trimmed,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, msg]);
    setInputText('');
  }, [inputText, localAvatar, localPlayerId, localPlayerName]);

  // ── Skip to game ──────────────────────────────────────────────────────────────
  const handleSkip = useCallback(() => {
    if (goingToGame) { return; }
    setGoingToGame(true);
    navigation.replace('Game');
  }, [goingToGame, navigation]);

  const isLocal = (playerId: string) => playerId === localPlayerId;
  const isUrgent = timeLeft <= 30;

  // ── Render message bubble ─────────────────────────────────────────────────────
  const renderItem = ({ item }: { item: ChatMessage }) => {
    const mine = isLocal(item.playerId);
    return (
      <View style={[styles.msgRow, mine ? styles.msgRowMine : styles.msgRowOther]}>
        {!mine && (
          <View style={styles.avatarBubble}>
            <Text style={styles.avatarText}>
              {item.playerName.split(' ')[0]}
            </Text>
          </View>
        )}
        <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleOther]}>
          {!mine && (
            <Text style={styles.bubbleName}>{item.playerName}</Text>
          )}
          <Text style={[styles.bubbleText, mine && styles.bubbleTextMine]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} hidden={true} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>💬 PRE-ROUND CHAT</Text>
          <Text style={styles.subtitle}>ROUND {currentRound} → {currentRound + 1} · Negotiate before next action</Text>
        </View>
        {/* Countdown */}
        <Animated.View
          style={[
            styles.timerBox,
            isUrgent && styles.timerBoxUrgent,
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <Text style={[styles.timerText, isUrgent && styles.timerTextUrgent]}>
            {formatTime(timeLeft)}
          </Text>
        </Animated.View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${(timeLeft / CHAT_DURATION) * 100}%` as any,
              backgroundColor: isUrgent ? Colors.stealRed : Colors.shieldBlue,
            },
          ]}
        />
      </View>

      {/* Messages list */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(_, i) => String(i)}
          renderItem={renderItem}
          contentContainerStyle={styles.messageList}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>💭 Be the first to say something...</Text>
            </View>
          }
        />

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Say something..."
            placeholderTextColor={Colors.textSecondary}
            returnKeyType="send"
            onSubmitEditing={sendMessage}
            maxLength={120}
            editable={!goingToGame}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            onPress={sendMessage}
            disabled={!inputText.trim() || goingToGame}
          >
            <Text style={styles.sendBtnText}>Send</Text>
          </TouchableOpacity>
        </View>

        {/* Skip / Start game early */}
        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip} disabled={goingToGame}>
          <Text style={styles.skipBtnText}>
            {goingToGame ? '⏳ Starting...' : '▶ Start Round Now'}
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 } as const,

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold as any,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
    maxWidth: 220,
  },

  // Timer
  timerBox: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: Colors.shieldBlue,
    alignItems: 'center',
    minWidth: 72,
  },
  timerBoxUrgent: {
    borderColor: Colors.stealRed,
    backgroundColor: 'rgba(255,107,107,0.18)',
  },
  timerText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold as any,
    color: Colors.shieldBlue,
    fontVariant: ['tabular-nums'],
  },
  timerTextUrgent: { color: Colors.stealRed },

  // Progress bar
  progressTrack: {
    height: 3,
    backgroundColor: Colors.divider,
  },
  progressFill: {
    height: 3,
  },

  // Messages
  messageList: { padding: Spacing.md, paddingBottom: Spacing.sm, gap: 10 },
  emptyState: { flex: 1, alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: FontSize.sm, color: Colors.textSecondary },

  msgRow: { flexDirection: 'row', alignItems: 'flex-end', marginVertical: 2 },
  msgRowMine: { justifyContent: 'flex-end' },
  msgRowOther: { justifyContent: 'flex-start' },

  avatarBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    marginBottom: 2,
  },
  avatarText: { fontSize: 18 },

  bubble: {
    maxWidth: '72%',
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bubbleMine: {
    backgroundColor: Colors.shieldBlue,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: Colors.surfaceElevated,
    borderBottomLeftRadius: 4,
  },
  bubbleName: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: FontWeight.bold as any,
    marginBottom: 2,
  },
  bubbleText: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  bubbleTextMine: { color: Colors.background },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendBtn: {
    backgroundColor: Colors.shieldBlue,
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sendBtnDisabled: { opacity: 0.45 },
  sendBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold as any,
    color: Colors.background,
  },

  // Skip button
  skipBtn: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    marginTop: 4,
    backgroundColor: Colors.gold,
    borderRadius: Radius.md,
    padding: 13,
    alignItems: 'center',
  },
  skipBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold as any,
    color: Colors.textOnYellow,
  },
});
