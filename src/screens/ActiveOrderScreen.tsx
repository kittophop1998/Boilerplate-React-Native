// ─── ฝากหน่อย — ActiveOrderScreen (ติดตามงาน) ────────────────────────────────
// เห็นได้ทั้ง ผู้ฝาก (warm) และ ผู้หิ้ว (cool)
// Status timeline · COD Summary · ส่งรูปใบเสร็จ · ยืนยันจบงาน
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
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@theme/index';

type Props = { navigation: any; route: any };

type OrderStatus = 'accepted' | 'shopping' | 'at_meetpoint' | 'done';

const STATUS_STEPS: { key: OrderStatus; label: string; icon: string }[] = [
  { key: 'accepted', label: 'รับงานแล้ว', icon: '✅' },
  { key: 'shopping', label: 'ซื้อของเสร็จแล้ว', icon: '🛒' },
  { key: 'at_meetpoint', label: 'ถึงจุดนัดพบแล้ว', icon: '📍' },
];

export default function ActiveOrderScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { role = 'sender', task } = route?.params ?? {};

  // ── State ──────────────────────────────────────────────────────────────────
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>('accepted');
  const [actualPrice, setActualPrice] = useState('');
  const [senderConfirmed, setSenderConfirmed] = useState(false);
  const [scoutConfirmed, setScoutConfirmed] = useState(false);
  const [receiptSent, setReceiptSent] = useState(false);

  const isScout = role === 'scout';
  const tipAmount = task?.tip ?? 20;
  const estPrice = task?.estPrice ?? 65;
  const actualPriceNum = parseFloat(actualPrice) || 0;
  const totalToPay = actualPriceNum + tipAmount;
  const isDone = senderConfirmed && scoutConfirmed;

  const canAdvanceStatus =
    isScout && currentStatus !== 'at_meetpoint' && currentStatus !== 'done';

  const advanceStatus = () => {
    if (currentStatus === 'accepted') setCurrentStatus('shopping');
    else if (currentStatus === 'shopping') setCurrentStatus('at_meetpoint');
  };

  const handleFinalConfirm = () => {
    if (isScout) {
      setScoutConfirmed(true);
    } else {
      setSenderConfirmed(true);
    }
    if ((isScout && senderConfirmed) || (!isScout && scoutConfirmed)) {
      Alert.alert('🎉 เรียบร้อย!', 'ปิดงานสำเร็จ ขอบคุณทั้งคู่นะ!', [
        { text: 'กลับหน้าหลัก', onPress: () => navigation.navigate('Home') },
      ]);
    }
  };

  // ── Accent colors per role ─────────────────────────────────────────────────
  const roleColor = isScout ? Colors.blue : Colors.accent;
  const roleBg = isScout ? '#F0FDFB' : '#FFF7F5';
  const roleLight = isScout ? Colors.blueLight : Colors.accentLight;
  const roleName = isScout ? 'ผู้หิ้ว' : 'ผู้ฝาก';

  return (
    <View style={[styles.root, { paddingTop: insets.top, backgroundColor: roleBg }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* ── Header ── */}
      <View style={[styles.header, { backgroundColor: roleBg }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>ติดตามออเดอร์ 📋</Text>
          <Text style={styles.headerSub}>{task?.meetup ?? 'หน้าหอ A'} · {task?.nickname ?? 'คุณ'}</Text>
        </View>
        <View style={[styles.roleBadge, { backgroundColor: roleLight, borderColor: roleColor + '55' }]}>
          <Text style={[styles.roleBadgeText, { color: roleColor }]}>{roleName}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ══ Status Timeline ══════════════════════════════════════════ */}
        <View style={styles.timelineCard}>
          <Text style={styles.sectionTitle}>สถานะออเดอร์</Text>
          <View style={styles.timeline}>
            {STATUS_STEPS.map((step, i) => {
              const stepIndex = STATUS_STEPS.findIndex((s) => s.key === currentStatus);
              const isPast = i < stepIndex;
              const isCurrent = step.key === currentStatus;
              const isFuture = i > stepIndex;
              return (
                <React.Fragment key={step.key}>
                  <View style={styles.timelineRow}>
                    <View
                      style={[
                        styles.timelineDot,
                        isCurrent && [styles.timelineDotCurrent, { borderColor: roleColor }],
                        isPast && [styles.timelineDotDone, { backgroundColor: roleColor }],
                        isFuture && styles.timelineDotFuture,
                      ]}
                    >
                      {isPast && <Text style={styles.timelineDotCheck}>✓</Text>}
                      {isCurrent && (
                        <View style={[styles.timelineDotInner, { backgroundColor: roleColor }]} />
                      )}
                    </View>
                    <View style={styles.timelineText}>
                      <Text
                        style={[
                          styles.timelineLabel,
                          isCurrent && { color: roleColor, fontWeight: FontWeight.bold },
                          isPast && styles.timelineLabelDone,
                          isFuture && styles.timelineLabelFuture,
                        ]}
                      >
                        {step.icon} {step.label}
                      </Text>
                    </View>
                  </View>
                  {i < STATUS_STEPS.length - 1 && (
                    <View style={[styles.timelineLine, isPast && { backgroundColor: roleColor }]} />
                  )}
                </React.Fragment>
              );
            })}
          </View>

          {/* Advance status button (scout only) */}
          {canAdvanceStatus && (
            <TouchableOpacity
              style={[styles.advanceBtn, { backgroundColor: roleColor }]}
              onPress={advanceStatus}
              activeOpacity={0.85}
            >
              <Text style={styles.advanceBtnText}>
                {currentStatus === 'accepted'
                  ? '🛒 อัปเดต: ซื้อของเสร็จแล้ว'
                  : '📍 อัปเดต: ถึงจุดนัดพบแล้ว'}
              </Text>
            </TouchableOpacity>
          )}
          {currentStatus === 'at_meetpoint' && (
            <View style={[styles.arrivedBanner, { backgroundColor: roleLight, borderColor: roleColor + '44' }]}>
              <Text style={[styles.arrivedText, { color: roleColor }]}>
                🔔 ผู้หิ้วถึงจุดนัดพบแล้ว! ไปรับของได้เลย
              </Text>
            </View>
          )}
        </View>

        {/* ══ COD Summary ══════════════════════════════════════════════ */}
        <View style={styles.codCard}>
          <Text style={styles.sectionTitle}>💰 สรุปยอดที่ต้องจ่าย</Text>

          {/* ราคาสินค้า */}
          <View style={styles.codRow}>
            <Text style={styles.codLabel}>ราคาสินค้า (ตามใบเสร็จจริง)</Text>
            {isScout ? (
              <View style={styles.priceInputWrap}>
                <Text style={styles.priceBaht}>฿</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder={String(estPrice)}
                  placeholderTextColor={Colors.subtle}
                  value={actualPrice}
                  onChangeText={setActualPrice}
                  keyboardType="numeric"
                />
              </View>
            ) : (
              <Text style={styles.codVal}>
                {actualPriceNum > 0 ? `฿${actualPriceNum}` : `฿${estPrice} (ประมาณ)`}
              </Text>
            )}
          </View>

          <View style={styles.codRow}>
            <Text style={styles.codLabel}>ค่าเหนื่อย</Text>
            <Text style={[styles.codVal, { color: Colors.gold, fontWeight: FontWeight.black }]}>
              ฿{tipAmount}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={[styles.codRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>ยอดรวมที่ต้องจ่ายหน้างาน</Text>
            <Text style={styles.totalVal}>฿{actualPriceNum > 0 ? totalToPay : estPrice + tipAmount}</Text>
          </View>
        </View>

        {/* ══ ส่งรูปใบเสร็จ ════════════════════════════════════════════ */}
        <View style={styles.receiptCard}>
          <Text style={styles.sectionTitle}>📷 หลักฐานใบเสร็จ</Text>
          <Text style={styles.receiptHint}>
            {isScout
              ? 'ส่งรูปใบเสร็จเพื่อยืนยันราคาสินค้าให้ผู้ฝาก'
              : 'รอผู้หิ้วส่งรูปใบเสร็จ'}
          </Text>

          {receiptSent ? (
            <View style={styles.receiptSentBox}>
              <Text style={styles.receiptSentText}>✅ ส่งใบเสร็จแล้ว</Text>
            </View>
          ) : isScout ? (
            <TouchableOpacity
              style={[styles.receiptBtn, { borderColor: roleColor }]}
              onPress={() => {
                setReceiptSent(true);
                Alert.alert('ส่งแล้ว!', 'ส่งรูปใบเสร็จให้ผู้ฝากเรียบร้อย');
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.receiptBtnIcon}>📷</Text>
              <Text style={[styles.receiptBtnText, { color: roleColor }]}>
                กดส่งรูปภาพใบเสร็จ
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.receiptPending}>
              <Text style={styles.receiptPendingText}>⏳ รอผู้หิ้วส่งรูป...</Text>
            </View>
          )}
        </View>

        {/* ══ Order Info ═══════════════════════════════════════════════ */}
        {task && (
          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>📦 รายละเอียดออเดอร์</Text>
            <InfoRow label="จุดนัดพบ" value={task.meetup} />
            <InfoRow label="รายการ" value={task.items} />
            <InfoRow label="ชื่อเล่น" value={task.nickname} />
          </View>
        )}
      </ScrollView>

      {/* ══ Final Action Buttons ═════════════════════════════════════════ */}
      {!isDone && (
        <View style={[styles.finalWrap, { paddingBottom: insets.bottom + Spacing.sm, backgroundColor: roleBg }]}>
          {currentStatus === 'at_meetpoint' || !isScout ? (
            <>
              <Text style={styles.finalHint}>
                {isScout
                  ? senderConfirmed
                    ? '✅ ผู้ฝากยืนยันแล้ว รอคุณกด'
                    : 'รอผู้ฝากกดยืนยันรับของด้วย'
                  : scoutConfirmed
                  ? '✅ ผู้หิ้วยืนยันแล้ว รอคุณกด'
                  : 'กดเมื่อได้รับของและจ่ายเงินเรียบร้อย'}
              </Text>
              <TouchableOpacity
                style={[
                  styles.finalBtn,
                  { backgroundColor: roleColor },
                  (isScout ? scoutConfirmed : senderConfirmed) && styles.finalBtnDone,
                ]}
                activeOpacity={0.85}
                onPress={handleFinalConfirm}
                disabled={isScout ? scoutConfirmed : senderConfirmed}
              >
                <Text style={styles.finalBtnText}>
                  {isScout
                    ? scoutConfirmed
                      ? '✅ ยืนยันแล้ว'
                      : '💰 ยืนยันส่งของแล้ว'
                    : senderConfirmed
                    ? '✅ ยืนยันแล้ว'
                    : '🤝 ได้รับของและจ่ายเงินเรียบร้อย'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.finalHint}>
              รอผู้หิ้วอัปเดตสถานะก่อนนะ...
            </Text>
          )}
        </View>
      )}

      {isDone && (
        <View style={[styles.finalWrap, { paddingBottom: insets.bottom + Spacing.sm, backgroundColor: roleBg }]}>
          <View style={styles.doneBox}>
            <Text style={styles.doneText}>🎉 ปิดงานสำเร็จ! ขอบคุณทั้งคู่</Text>
          </View>
        </View>
      )}
    </View>
  );
}

// ── Info row ──────────────────────────────────────────────────────────────────
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={infoStyles.row}>
      <Text style={infoStyles.label}>{label}</Text>
      <Text style={infoStyles.value}>{value}</Text>
    </View>
  );
}
const infoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  label: { fontSize: FontSize.sm, color: Colors.subtle },
  value: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    color: Colors.textPrimary,
    flex: 1,
    textAlign: 'right',
    marginLeft: Spacing.sm,
  },
});

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, gap: Spacing.md },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: Spacing.sm,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: Radius.full,
    backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2,
  },
  backIcon: { fontSize: 24, color: Colors.textPrimary, lineHeight: 28 },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: FontSize.md, fontWeight: FontWeight.black, color: Colors.textPrimary },
  headerSub: { fontSize: FontSize.xs, color: Colors.subtle },
  roleBadge: {
    borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 3, borderWidth: 1,
  },
  roleBadgeText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },

  sectionTitle: {
    fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.sm,
  },

  // Timeline
  timelineCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.lg,
    borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm,
  },
  timeline: { gap: 0 },
  timelineRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: 4,
  },
  timelineDot: {
    width: 28, height: 28, borderRadius: Radius.full,
    borderWidth: 2, borderColor: Colors.inactive,
    backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center',
  },
  timelineDotCurrent: { borderWidth: 2.5 },
  timelineDotInner: { width: 10, height: 10, borderRadius: Radius.full },
  timelineDotDone: { borderWidth: 0 },
  timelineDotFuture: { borderColor: Colors.border },
  timelineDotCheck: { fontSize: 14, color: '#fff', fontWeight: FontWeight.bold },
  timelineLine: {
    width: 2, height: 20, backgroundColor: Colors.border, marginLeft: 13, marginVertical: 2,
  },
  timelineText: { flex: 1 },
  timelineLabel: { fontSize: FontSize.sm, color: Colors.textPrimary },
  timelineLabelDone: { color: Colors.subtle },
  timelineLabelFuture: { color: Colors.inactive },

  advanceBtn: {
    borderRadius: Radius.full, paddingVertical: Spacing.sm + 2, alignItems: 'center',
    marginTop: Spacing.sm,
    shadowColor: Colors.blue,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 6,
  },
  advanceBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: '#fff' },

  arrivedBanner: {
    borderRadius: Radius.md, padding: Spacing.sm, borderWidth: 1, marginTop: Spacing.xs,
  },
  arrivedText: { fontSize: FontSize.sm, fontWeight: FontWeight.semiBold, textAlign: 'center' },

  // COD
  codCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.lg,
    borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm,
  },
  codRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  codLabel: { fontSize: FontSize.sm, color: Colors.subtle, flex: 1 },
  codVal: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  priceInputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.background, borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm, paddingVertical: 4,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  priceBaht: { fontSize: FontSize.md, color: Colors.accent, fontWeight: FontWeight.bold },
  priceInput: { width: 80, fontSize: FontSize.md, color: Colors.textPrimary, fontWeight: FontWeight.bold },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.xs },
  totalRow: { alignItems: 'center' },
  totalLabel: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary, flex: 1 },
  totalVal: { fontSize: 28, fontWeight: FontWeight.black, color: Colors.textPrimary },

  // Receipt
  receiptCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.lg,
    borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm,
  },
  receiptHint: { fontSize: FontSize.xs, color: Colors.subtle },
  receiptBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    borderRadius: Radius.full, borderWidth: 2,
    paddingVertical: Spacing.md,
  },
  receiptBtnIcon: { fontSize: 20 },
  receiptBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  receiptSentBox: {
    backgroundColor: Colors.win + '1A', borderRadius: Radius.md,
    paddingVertical: Spacing.sm, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.win + '44',
  },
  receiptSentText: { fontSize: FontSize.sm, color: Colors.win, fontWeight: FontWeight.bold },
  receiptPending: {
    backgroundColor: Colors.surfaceElevated, borderRadius: Radius.md,
    paddingVertical: Spacing.sm, alignItems: 'center',
  },
  receiptPendingText: { fontSize: FontSize.sm, color: Colors.subtle },

  // Info
  infoCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.lg,
    borderWidth: 1, borderColor: Colors.border, gap: 2,
  },

  // Final
  finalWrap: {
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm,
    borderTopWidth: 1, borderTopColor: Colors.border, gap: Spacing.xs,
  },
  finalHint: { fontSize: FontSize.xs, color: Colors.subtle, textAlign: 'center' },
  finalBtn: {
    borderRadius: Radius.full, paddingVertical: Spacing.md + 2, alignItems: 'center',
    shadowColor: Colors.accent, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.30, shadowRadius: 16, elevation: 8,
  },
  finalBtnDone: { backgroundColor: Colors.win, shadowColor: Colors.win },
  finalBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.black, color: '#fff' },

  doneBox: {
    backgroundColor: Colors.win + '1A', borderRadius: Radius.xl,
    paddingVertical: Spacing.md, alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.win + '44',
  },
  doneText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.win },
});
