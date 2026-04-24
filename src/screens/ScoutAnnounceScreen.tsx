// ─── ฝากหน่อย — ScoutAnnounceScreen (คนหิ้วประกาศ) ──────────────────────────
// Scout announces where they're going, sets capacity limits
// View & accept incoming requests from other users
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@theme/index';
import { MOCK_REQUESTS } from '@data/mockFarkNoi';
import { OrderCard } from '@components/OrderCard';
import type { PopularDestination } from '../types/farkNoi';

type Props = { navigation: any };

const POPULAR_PLACES: { label: PopularDestination; emoji: string }[] = [
  { label: '7-Eleven', emoji: '🏪' },
  { label: 'Family Mart', emoji: '🏬' },
  { label: 'ฟิวเจอร์รังสิต', emoji: '🛒' },
  { label: 'ตลาดเจพี', emoji: '🥘' },
  { label: 'Lotus Go', emoji: '🛍️' },
  { label: 'โรงอาหารกลาง', emoji: '🍜' },
  { label: 'ร้านกาแฟหน้าหอ', emoji: '☕' },
  { label: 'มินิมาร์ท', emoji: '🏪' },
];

export default function ScoutAnnounceScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [selectedPlace, setSelectedPlace] = useState<PopularDestination | null>(null);
  const [maxItems, setMaxItems] = useState(3);
  const [acceptsHeavy, setAcceptsHeavy] = useState(false);
  const [customPlace, setCustomPlace] = useState('');
  const [step, setStep] = useState<'select' | 'limits' | 'active'>('select');

  const pendingForMe = MOCK_REQUESTS.filter((r) => r.status === 'pending');

  const handleAnnounce = () => {
    if (!selectedPlace && !customPlace) return;
    setStep('active');
  };

  return (
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>ฉันกำลังจะไป... 🚶</Text>
          <Text style={styles.headerSub}>ประกาศตัวเพื่อรับฝากของไปด้วย</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {step === 'select' && (
          <>
            {/* ── Select destination ── */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>📍 จะไปที่ไหน?</Text>
              <View style={styles.placeGrid}>
                {POPULAR_PLACES.map((place) => (
                  <TouchableOpacity
                    key={place.label}
                    style={[
                      styles.placeChip,
                      selectedPlace === place.label && styles.placeChipActive,
                    ]}
                    onPress={() => setSelectedPlace(place.label)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.placeEmoji}>{place.emoji}</Text>
                    <Text
                      style={[
                        styles.placeLabel,
                        selectedPlace === place.label && styles.placeLabelActive,
                      ]}
                    >
                      {place.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Custom place */}
              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>หรือพิมพ์เอง</Text>
                <TextInput
                  style={styles.input}
                  placeholder="เช่น ร้านข้าวแกงหน้าหอ..."
                  placeholderTextColor={Colors.subtle}
                  value={customPlace}
                  onChangeText={(t) => {
                    setCustomPlace(t);
                    if (t) setSelectedPlace(null);
                  }}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.nextBtn,
                !(selectedPlace || customPlace) && styles.nextBtnDisabled,
              ]}
              onPress={() => setStep('limits')}
              disabled={!selectedPlace && !customPlace}
              activeOpacity={0.85}
            >
              <Text style={styles.nextBtnText}>ถัดไป →</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 'limits' && (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                🛍️ จะไป {selectedPlace || customPlace}
              </Text>

              {/* Max items slider */}
              <Text style={styles.inputLabel}>รับฝากได้กี่ชิ้น?</Text>
              <View style={styles.counterRow}>
                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() => setMaxItems(Math.max(1, maxItems - 1))}
                >
                  <Text style={styles.counterBtnText}>−</Text>
                </TouchableOpacity>
                <View style={styles.counterVal}>
                  <Text style={styles.counterNum}>{maxItems}</Text>
                  <Text style={styles.counterUnit}>ชิ้น</Text>
                </View>
                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() => setMaxItems(Math.min(10, maxItems + 1))}
                >
                  <Text style={styles.counterBtnText}>+</Text>
                </TouchableOpacity>
              </View>

              {/* Accepts heavy? */}
              <TouchableOpacity
                style={styles.toggleRow}
                onPress={() => setAcceptsHeavy(!acceptsHeavy)}
                activeOpacity={0.8}
              >
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleTitle}>🏋️ รับของหนัก</Text>
                  <Text style={styles.toggleSub}>รับของน้ำหนักเกิน 1 กก.</Text>
                </View>
                <View style={[styles.toggle, acceptsHeavy && styles.toggleOn]}>
                  <View style={[styles.toggleThumb, acceptsHeavy && styles.toggleThumbOn]} />
                </View>
              </TouchableOpacity>

              {/* Fee estimate */}
              <View style={styles.feeEstimate}>
                <Text style={styles.feeEstTitle}>💰 ค่าขนมที่คาดว่าจะได้</Text>
                <Text style={styles.feeEstVal}>
                  {10 + maxItems * 5} – {10 + maxItems * 5 + 15} บาท
                </Text>
              </View>
            </View>

            <View style={styles.btnRow}>
              <TouchableOpacity
                style={styles.backBtnSmall}
                onPress={() => setStep('select')}
              >
                <Text style={styles.backBtnSmallText}>← ย้อนกลับ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.announceBtn}
                onPress={handleAnnounce}
                activeOpacity={0.85}
              >
                <Text style={styles.announceBtnText}>🚀 ประกาศเลย!</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {step === 'active' && (
          <>
            {/* Active status card */}
            <View style={styles.activeCard}>
              <View style={styles.activePulse}>
                <View style={styles.activeDot} />
              </View>
              <View style={styles.activeInfo}>
                <Text style={styles.activeTitle}>กำลังรับฝากอยู่ 🟢</Text>
                <Text style={styles.activeDest}>📍 {selectedPlace || customPlace}</Text>
                <Text style={styles.activeSub}>รับได้อีก {maxItems} ชิ้น</Text>
              </View>
              <TouchableOpacity
                style={styles.stopBtn}
                onPress={() => setStep('select')}
              >
                <Text style={styles.stopBtnText}>หยุด</Text>
              </TouchableOpacity>
            </View>

            {/* Incoming requests */}
            <Text style={styles.sectionTitle}>📣 คนอยากฝากของ ({pendingForMe.length})</Text>

            {pendingForMe.length > 0 ? (
              pendingForMe.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  viewMode="scout"
                  onPress={() =>
                    navigation.navigate('OrderDetail', { orderId: order.id })
                  }
                  onAccept={() =>
                    navigation.navigate('Chat', {
                      orderId: order.id,
                      otherUserId: order.sender.id,
                      otherUserName: order.sender.name,
                    })
                  }
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>⏳</Text>
                <Text style={styles.emptyText}>รอคนฝากของ กำลังแจ้งเพื่อนบ้าน...</Text>
              </View>
            )}

            {/* Tips for scout */}
            <View style={styles.tipsCard}>
              <Text style={styles.tipsTitle}>💡 เคล็ดลับการหิ้วของ</Text>
              <Text style={styles.tipItem}>📸 อย่าลืมถ่ายรูปใบเสร็จก่อนส่งในแชท</Text>
              <Text style={styles.tipItem}>📍 แชร์ตำแหน่งเมื่อถึงที่หมาย ลดความกังวล</Text>
              <Text style={styles.tipItem}>✅ กด "สำเร็จ" ทันทีเมื่อส่งของเรียบร้อย</Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.md, paddingTop: Spacing.sm },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadowCard,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  backIcon: { fontSize: 24, color: Colors.textPrimary, lineHeight: 28 },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  headerSub: { fontSize: FontSize.xs, color: Colors.subtle },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: Colors.shadowCard,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.borderCard,
  },
  cardTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },

  placeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  placeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  placeChipActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentLight,
  },
  placeEmoji: { fontSize: 16 },
  placeLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  placeLabelActive: { color: Colors.accent, fontWeight: FontWeight.bold },

  inputRow: { marginTop: Spacing.sm },
  inputLabel: {
    fontSize: FontSize.sm,
    color: Colors.subtle,
    fontWeight: FontWeight.medium,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.inputFill,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  nextBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.full,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
    shadowColor: Colors.shadowAccent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 6,
  },
  nextBtnDisabled: { backgroundColor: Colors.inactive, shadowOpacity: 0 },
  nextBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textOnAccent },

  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
    marginBottom: Spacing.md,
  },
  counterBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.accentBorder,
  },
  counterBtnText: { fontSize: 22, color: Colors.accent, fontWeight: FontWeight.bold, lineHeight: 26 },
  counterVal: { alignItems: 'center' },
  counterNum: { fontSize: 42, fontWeight: FontWeight.black, color: Colors.textPrimary, lineHeight: 48 },
  counterUnit: { fontSize: FontSize.sm, color: Colors.subtle },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    marginBottom: Spacing.md,
  },
  toggleInfo: { flex: 1 },
  toggleTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.semiBold, color: Colors.textPrimary },
  toggleSub: { fontSize: FontSize.xs, color: Colors.subtle },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: Radius.full,
    backgroundColor: Colors.inactive,
    padding: 3,
  },
  toggleOn: { backgroundColor: Colors.blue },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
  },
  toggleThumbOn: { transform: [{ translateX: 22 }] },

  feeEstimate: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.tipBg,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.tipBorder,
  },
  feeEstTitle: { fontSize: FontSize.sm, color: Colors.textOnYellow, fontWeight: FontWeight.medium },
  feeEstVal: { fontSize: FontSize.md, fontWeight: FontWeight.black, color: Colors.textOnYellow },

  btnRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  backBtnSmall: {
    flex: 1,
    borderRadius: Radius.full,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  backBtnSmallText: { fontSize: FontSize.sm, fontWeight: FontWeight.semiBold, color: Colors.subtle },
  announceBtn: {
    flex: 2,
    backgroundColor: Colors.accent,
    borderRadius: Radius.full,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    shadowColor: Colors.shadowAccent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 6,
  },
  announceBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textOnAccent },

  // Active state
  activeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.scoutActiveBg,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.escrowBorder,
    gap: Spacing.sm,
  },
  activePulse: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    backgroundColor: Colors.blueLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDot: {
    width: 16,
    height: 16,
    borderRadius: Radius.full,
    backgroundColor: Colors.blue,
  },
  activeInfo: { flex: 1 },
  activeTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.blue },
  activeDest: { fontSize: FontSize.xs, color: Colors.textPrimary, marginTop: 2 },
  activeSub: { fontSize: FontSize.xs, color: Colors.subtle },
  stopBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.danger,
  },
  stopBtnText: { fontSize: FontSize.sm, color: Colors.danger, fontWeight: FontWeight.semiBold },

  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },

  emptyState: { alignItems: 'center', paddingVertical: Spacing.xl },
  emptyEmoji: { fontSize: 40, marginBottom: Spacing.sm },
  emptyText: { fontSize: FontSize.sm, color: Colors.subtle, textAlign: 'center' },

  tipsCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderCard,
    gap: 6,
  },
  tipsTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  tipItem: { fontSize: FontSize.sm, color: Colors.subtle },
});
