// ─── Heist — Transfer Screen ──────────────────────────────────────────────────
// Briefcase UI · Slider for amount · Message box · Hold-to-send
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, StatusBar,
  Animated, PanResponder, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@theme/index';
import { useGameStore } from '../store/gameStore';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

const { width: W } = Dimensions.get('window');
const SLIDER_W = W - Spacing.md * 2;
const HOLD_DURATION = 1400; // ms to fully fill bar

type RootStackParamList = {
  Transfer: { targetId: string; targetName: string; targetAvatar: string };
};
type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Transfer'>;
  route: RouteProp<RootStackParamList, 'Transfer'>;
};

// ── Slider ────────────────────────────────────────────────────────────────────
function GoldSlider({
  value,
  max,
  onChange,
}: {
  value: number;
  max: number;
  onChange: (v: number) => void;
}) {
  const thumbX = useRef(new Animated.Value((value / Math.max(max, 1)) * SLIDER_W)).current;
  const currentX = useRef((value / Math.max(max, 1)) * SLIDER_W);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (_, _gs) => {
        currentX.current = (value / Math.max(max, 1)) * SLIDER_W;
        thumbX.setOffset(currentX.current);
        thumbX.setValue(0);
      },
      onPanResponderMove: (_, gs) => {
        const raw = Math.min(Math.max(0, gs.dx), SLIDER_W);
        thumbX.setValue(raw - currentX.current);
        const fraction = (currentX.current + (raw - currentX.current)) / SLIDER_W;
        const next = Math.round(fraction * max);
        onChange(Math.min(Math.max(0, next), max));
      },
      onPanResponderRelease: () => {
        thumbX.flattenOffset();
      },
    })
  ).current;

  const fraction = max > 0 ? value / max : 0;
  const fillWidth = fraction * SLIDER_W;

  return (
    <View style={sliderStyles.track}>
      <View style={[sliderStyles.fill, { width: fillWidth }]} />
      <View
        style={[sliderStyles.thumb, { left: fillWidth - 12 }]}
        {...panResponder.panHandlers}
      />
    </View>
  );
}

// ── Hold-to-Send Button ────────────────────────────────────────────────────────
function HoldToSend({ onSend, disabled }: { onSend: () => void; disabled: boolean }) {
  const progress = useRef(new Animated.Value(0)).current;
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animRef = useRef<Animated.CompositeAnimation | null>(null);
  const [holding, setHolding] = useState(false);

  const startHold = useCallback(() => {
    if (disabled) return;
    setHolding(true);
    animRef.current = Animated.timing(progress, {
      toValue: 1,
      duration: HOLD_DURATION,
      useNativeDriver: false,
    });
    animRef.current.start(({ finished }) => {
      if (finished) {
        onSend();
        progress.setValue(0);
        setHolding(false);
      }
    });
    holdTimer.current = setTimeout(() => {}, HOLD_DURATION);
  }, [disabled, onSend, progress]);

  const cancelHold = useCallback(() => {
    animRef.current?.stop();
    if (holdTimer.current) clearTimeout(holdTimer.current);
    Animated.timing(progress, { toValue: 0, duration: 200, useNativeDriver: false }).start();
    setHolding(false);
  }, [progress]);

  const fillW = progress.interpolate({ inputRange: [0, 1], outputRange: [0, W - Spacing.md * 2] });

  return (
    <TouchableOpacity
      style={[holdStyles.btn, disabled && holdStyles.btnDisabled]}
      onPressIn={startHold}
      onPressOut={cancelHold}
      activeOpacity={1}
      disabled={disabled}
    >
      <Animated.View style={[holdStyles.fill, { width: fillW }]} />
      <Text style={holdStyles.text}>
        {holding ? '📤 SENDING...' : disabled ? '✋ Enter an amount' : '📨 HOLD TO SEND'}
      </Text>
    </TouchableOpacity>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function TransferScreen({ navigation, route }: Props) {
  const { targetId, targetName, targetAvatar } = route.params;
  const { vaultGold, sendGold, localPlayerId } = useGameStore();

  const [amount, setAmount] = useState(0);
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = useCallback(() => {
    if (amount <= 0 || amount > vaultGold) return;
    sendGold({
      fromPlayerId: localPlayerId,
      toPlayerId: targetId,
      toPlayerName: targetName,
      amount,
      message: message.trim() || '🤫 No message',
      timestamp: Date.now(),
    });
    setSent(true);
    setTimeout(() => navigation.goBack(), 1600);
  }, [amount, vaultGold, sendGold, localPlayerId, targetId, targetName, message, navigation]);

  if (sent) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.sentContainer}>
          <Text style={styles.sentEmoji}>💼</Text>
          <Text style={styles.sentTitle}>BRIEFCASE DELIVERED</Text>
          <Text style={styles.sentSub}>
            🏦 {amount.toLocaleString()} Gold → {targetName}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} hidden={true} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>💼 TRANSFER</Text>
        <View style={styles.backBtn} />
      </View>

      {/* Briefcase card */}
      <View style={styles.briefcase}>
        <View style={styles.briefcaseHandle} />
        <View style={styles.briefcaseBody}>

          {/* Target player */}
          <View style={styles.targetRow}>
            <Text style={styles.targetAvatar}>{targetAvatar}</Text>
            <View>
              <Text style={styles.targetLabel}>SENDING TO</Text>
              <Text style={styles.targetName}>{targetName}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Amount display */}
          <Text style={styles.amountLabel}>AMOUNT</Text>
          <Text style={styles.amountValue}>
            🏦 {amount.toLocaleString()} <Text style={styles.amountMax}>/ {vaultGold.toLocaleString()}</Text>
          </Text>

          {/* Slider */}
          <GoldSlider value={amount} max={vaultGold} onChange={setAmount} />

          {/* Quick amounts */}
          <View style={styles.quickRow}>
            {[25, 50, 75, 100].map((pct) => (
              <TouchableOpacity
                key={pct}
                style={styles.quickBtn}
                onPress={() => setAmount(Math.floor(vaultGold * pct / 100))}
              >
                <Text style={styles.quickBtnText}>{pct}%</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.divider} />

          {/* Message box */}
          <Text style={styles.msgLabel}>MESSAGE (optional)</Text>
          <TextInput
            style={styles.msgInput}
            value={message}
            onChangeText={setMessage}
            placeholder="นี่ค่าจ้าง ห้ามหักหลังนะ..."
            placeholderTextColor={Colors.textDisabled}
            maxLength={80}
            multiline
          />
          <Text style={styles.msgCount}>{message.length}/80</Text>

        </View>
      </View>

      {/* Hold-to-Send */}
      <View style={styles.sendArea}>
        <HoldToSend onSend={handleSend} disabled={amount <= 0 || amount > vaultGold} />
        <Text style={styles.sendHint}>Hold button to confirm transfer</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, paddingBottom: Spacing.sm },
  backBtn: { minWidth: 60 },
  backText: { fontSize: FontSize.sm, color: Colors.gold },
  headerTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold as any, color: Colors.textPrimary },

  // Briefcase
  briefcase: { marginHorizontal: Spacing.md, marginTop: Spacing.sm, borderRadius: Radius.xl, overflow: 'hidden' },
  briefcaseHandle: { alignSelf: 'center', width: 60, height: 16, borderTopLeftRadius: 8, borderTopRightRadius: 8, backgroundColor: '#5C3A1E', borderBottomWidth: 0 },
  briefcaseBody: { backgroundColor: '#2A1F14', borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 2, borderColor: '#5C3A1E' },

  // Target
  targetRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  targetAvatar: { fontSize: 44, marginRight: Spacing.md },
  targetLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, letterSpacing: 1 },
  targetName: { fontSize: FontSize.lg, fontWeight: FontWeight.bold as any, color: Colors.textPrimary },

  divider: { height: 1, backgroundColor: '#5C3A1E', marginVertical: Spacing.md },

  // Amount
  amountLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, letterSpacing: 1, marginBottom: 4 },
  amountValue: { fontSize: 32, fontWeight: FontWeight.bold as any, color: Colors.gold, marginBottom: Spacing.md },
  amountMax: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.regular as any },

  // Quick pct
  quickRow: { flexDirection: 'row', gap: 8, marginTop: Spacing.md },
  quickBtn: { flex: 1, backgroundColor: '#3D2B18', borderRadius: Radius.sm, paddingVertical: 6, alignItems: 'center', borderWidth: 1, borderColor: '#5C3A1E' },
  quickBtnText: { fontSize: FontSize.xs, color: Colors.gold, fontWeight: FontWeight.bold as any },

  // Message
  msgLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, letterSpacing: 1, marginBottom: 6 },
  msgInput: { backgroundColor: '#1E1505', borderRadius: Radius.md, padding: Spacing.sm, color: Colors.textPrimary, fontSize: FontSize.sm, minHeight: 60, borderWidth: 1, borderColor: '#5C3A1E', textAlignVertical: 'top' },
  msgCount: { fontSize: 10, color: Colors.textDisabled, textAlign: 'right', marginTop: 4 },

  // Send
  sendArea: { margin: Spacing.md, marginTop: Spacing.lg },
  sendHint: { fontSize: FontSize.xs, color: Colors.textDisabled, textAlign: 'center', marginTop: 8 },

  // Sent state
  sentContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  sentEmoji: { fontSize: 80 },
  sentTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.black as any, color: Colors.gold, letterSpacing: 2 },
  sentSub: { fontSize: FontSize.sm, color: Colors.textSecondary },
});

const sliderStyles = StyleSheet.create({
  track: { height: 6, backgroundColor: '#3D2B18', borderRadius: 3, marginTop: 4, position: 'relative' },
  fill: { position: 'absolute', left: 0, top: 0, height: 6, backgroundColor: Colors.gold, borderRadius: 3 },
  thumb: { position: 'absolute', top: -9, width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.gold, shadowColor: Colors.gold, shadowOpacity: 0.5, shadowRadius: 6, elevation: 4 },
});

const holdStyles = StyleSheet.create({
  btn: { height: 56, backgroundColor: Colors.surface, borderRadius: Radius.lg, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.gold },
  btnDisabled: { borderColor: Colors.divider, opacity: 0.5 },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: Colors.gold, opacity: 0.25 },
  text: { fontSize: FontSize.sm, fontWeight: FontWeight.bold as any, color: Colors.textPrimary, letterSpacing: 1, zIndex: 1 },
});
