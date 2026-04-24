// ─── ฝากหน่อย — PostRequestScreen (ผู้ฝาก) ──────────────────────────────────
// Single-page form สำหรับผู้ฝาก: โทนอบอุ่น (Coral/Orange)
// Fields: จุดนัดพบ | รายการของ | ราคาประมาณ | ค่าเหนื่อย | ชื่อเล่น
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

// ── จุดนัดพบในรังสิต ─────────────────────────────────────────────────────────
const MEETUP_PLACES = [
  { label: 'หน้าหอ A', emoji: '🏠' },
  { label: 'หน้าหอ B', emoji: '🏠' },
  { label: 'หน้าหอ C', emoji: '🏠' },
  { label: 'ตึกเรียน 5', emoji: '🏫' },
  { label: 'ประตูเชียงราก', emoji: '🚧' },
  { label: 'โรงอาหารกลาง', emoji: '🍜' },
  { label: 'หน้า 7-Eleven', emoji: '🏪' },
  { label: 'ลานจอดรถหอ', emoji: '🚗' },
];

const TIP_PRESETS = [10, 15, 20, 25, 30];

export default function PostRequestScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const [meetupPlace, setMeetupPlace] = useState('');
  const [items, setItems] = useState('');
  const [estPrice, setEstPrice] = useState('');
  const [tip, setTip] = useState<number | null>(null);
  const [customTip, setCustomTip] = useState('');
  const [nickname, setNickname] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [orderId] = useState(
    'FN-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
  );

  const effectiveTip = tip !== null ? tip : parseInt(customTip || '0', 10);
  const estTotal = (parseFloat(estPrice) || 0) + effectiveTip;
  const canSubmit = meetupPlace !== '' && items.trim() !== '' && nickname.trim() !== '';

  const handleSubmit = () => {
    if (!canSubmit) {
      Alert.alert('กรอกไม่ครบ', 'กรุณาเลือกจุดนัดพบ, ใส่รายการของ และชื่อเล่น');
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <ScrollView contentContainerStyle={styles.successWrap} showsVerticalScrollIndicator={false}>
          <Text style={styles.successEmoji}>🎉</Text>
          <Text style={styles.successTitle}>ประกาศฝากแล้ว!</Text>
          <Text style={styles.successSub}>รอเพื่อนบ้านรับงานสักครู่นะ 🛍️</Text>

          <View style={styles.linkBox}>
            <Text style={styles.linkLabel}>ลิงก์ติดตามออเดอร์</Text>
            <View style={styles.linkRow}>
              <Text style={styles.linkText}>farknoi.com/order/{orderId.toLowerCase()}</Text>
            </View>
            <Text style={styles.linkHint}>Bookmark ไว้ดูสถานะ ไม่ต้องสมัครสมาชิก</Text>
          </View>

          <View style={styles.summaryBox}>
            <SummaryRow label="จุดนัดพบ" value={meetupPlace} />
            <SummaryRow label="รายการ" value={items} />
            <SummaryRow label="ราคาประมาณ" value={estPrice ? `฿${estPrice}` : '—'} />
            <SummaryRow label="ค่าเหนื่อย" value={`฿${effectiveTip}`} highlight />
            <SummaryRow label="ชื่อเล่น" value={nickname} />
          </View>

          <TouchableOpacity
            style={styles.goTaskBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('ActiveOrder', { orderId })}
          >
            <Text style={styles.goTaskBtnText}>📋 ติดตามออเดอร์</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.homeBtn} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.homeBtnText}>← กลับหน้าหลัก</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>ฝากซื้อของหน่อย 📦</Text>
          <Text style={styles.headerSub}>กรอกรายละเอียดแล้วรอคนหิ้วมาเลย</Text>
        </View>
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>ผู้ฝาก</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Field 1: จุดนัดพบ */}
        <View style={styles.fieldCard}>
          <View style={styles.fieldHeader}>
            <Text style={styles.fieldIcon}>📍</Text>
            <View>
              <Text style={styles.fieldLabel}>จุดนัดพบ</Text>
              <Text style={styles.fieldHint}>เลือกสถานที่ที่จะมานัดรับของ</Text>
            </View>
          </View>
          <View style={styles.placeGrid}>
            {MEETUP_PLACES.map((place) => (
              <TouchableOpacity
                key={place.label}
                style={[styles.placeChip, meetupPlace === place.label && styles.placeChipActive]}
                onPress={() => setMeetupPlace(place.label)}
                activeOpacity={0.75}
              >
                <Text style={styles.placeEmoji}>{place.emoji}</Text>
                <Text style={[styles.placeChipText, meetupPlace === place.label && styles.placeChipTextActive]}>
                  {place.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {meetupPlace !== '' && (
            <View style={styles.selectedBanner}>
              <Text style={styles.selectedBannerText}>✅ {meetupPlace}</Text>
            </View>
          )}
        </View>

        {/* Field 2: รายการของ */}
        <View style={styles.fieldCard}>
          <View style={styles.fieldHeader}>
            <Text style={styles.fieldIcon}>🛒</Text>
            <View>
              <Text style={styles.fieldLabel}>รายการของที่จะฝาก</Text>
              <Text style={styles.fieldHint}>พิมพ์รายละเอียดให้ชัด เช่น ไซส์ รสชาติ</Text>
            </View>
          </View>
          <TextInput
            style={styles.textArea}
            placeholder={'เช่น ชานมไข่มุกหวาน 50% 1 แก้ว\nข้าวมันไก่ ไม่เผ็ด 1 จาน\nน้ำเปล่า 600ml 1 ขวด'}
            placeholderTextColor={Colors.subtle}
            value={items}
            onChangeText={setItems}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{items.length} ตัวอักษร</Text>
        </View>

        {/* Field 3: ราคาประมาณ */}
        <View style={styles.fieldCard}>
          <View style={styles.fieldHeader}>
            <Text style={styles.fieldIcon}>💵</Text>
            <View>
              <Text style={styles.fieldLabel}>ราคาประมาณ (บาท)</Text>
              <Text style={styles.fieldHint}>ผู้หิ้วจะได้เตรียมเงินถูก</Text>
            </View>
          </View>
          <View style={styles.numInputRow}>
            <Text style={styles.currencySymbol}>฿</Text>
            <TextInput
              style={styles.numInput}
              placeholder="เช่น 65"
              placeholderTextColor={Colors.subtle}
              value={estPrice}
              onChangeText={setEstPrice}
              keyboardType="numeric"
            />
            <Text style={styles.unitLabel}>บาท</Text>
          </View>
        </View>

        {/* Field 4: ค่าเหนื่อย */}
        <View style={styles.fieldCard}>
          <View style={styles.fieldHeader}>
            <Text style={styles.fieldIcon}>💛</Text>
            <View>
              <Text style={styles.fieldLabel}>ค่าเหนื่อย/ค่าฝาก (บาท)</Text>
              <Text style={styles.fieldHint}>ยิ่งให้เยอะ ยิ่งมีคนรับไว</Text>
            </View>
          </View>
          <View style={styles.tipChips}>
            {TIP_PRESETS.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.tipChip, tip === t && styles.tipChipActive]}
                onPress={() => { setTip(t); setCustomTip(''); }}
                activeOpacity={0.75}
              >
                <Text style={[styles.tipChipText, tip === t && styles.tipChipTextActive]}>
                  {t} ฿
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.orLabel}>หรือพิมพ์เอง</Text>
          <View style={styles.numInputRow}>
            <Text style={styles.currencySymbol}>฿</Text>
            <TextInput
              style={styles.numInput}
              placeholder="ระบุจำนวน"
              placeholderTextColor={Colors.subtle}
              value={customTip}
              onChangeText={(v) => { setCustomTip(v); setTip(null); }}
              keyboardType="numeric"
            />
            <Text style={styles.unitLabel}>บาท</Text>
          </View>
          {(estPrice || effectiveTip > 0) && (
            <View style={styles.miniTotal}>
              <Text style={styles.miniTotalLabel}>ยอดที่ผู้หิ้วต้องสำรองจ่าย</Text>
              <Text style={styles.miniTotalVal}>฿{estTotal}</Text>
            </View>
          )}
        </View>

        {/* Field 5: ชื่อเล่น */}
        <View style={styles.fieldCard}>
          <View style={styles.fieldHeader}>
            <Text style={styles.fieldIcon}>👤</Text>
            <View>
              <Text style={styles.fieldLabel}>ชื่อเล่น</Text>
              <Text style={styles.fieldHint}>ไว้ทักกันตอนนัดพบ ไม่ต้องใช้ชื่อจริง</Text>
            </View>
          </View>
          <TextInput
            style={styles.lineInput}
            placeholder="เช่น มิ้น, โบ, ฟิล์ม"
            placeholderTextColor={Colors.subtle}
            value={nickname}
            onChangeText={setNickname}
            maxLength={20}
          />
        </View>

        {/* Preview */}
        {canSubmit && (
          <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>📋 สรุปก่อนประกาศ</Text>
            <SummaryRow label="จุดนัดพบ" value={meetupPlace} />
            <SummaryRow label="รายการ" value={items} />
            {estPrice !== '' && <SummaryRow label="ราคาประมาณ" value={`฿${estPrice}`} />}
            <SummaryRow label="ค่าเหนื่อย" value={`฿${effectiveTip}`} highlight />
            <SummaryRow label="ชื่อเล่น" value={nickname} />
          </View>
        )}
      </ScrollView>

      <View style={[styles.submitWrap, { paddingBottom: insets.bottom + Spacing.md }]}>
        <TouchableOpacity
          style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
          activeOpacity={0.85}
          onPress={handleSubmit}
          disabled={!canSubmit}
        >
          <Text style={styles.submitBtnText}>🚀 ยืนยันประกาศฝาก</Text>
        </TouchableOpacity>
        {!canSubmit && (
          <Text style={styles.submitHint}>
            {!meetupPlace ? 'เลือกจุดนัดพบก่อน' : !items.trim() ? 'บอกรายการของด้วยนะ' : 'ใส่ชื่อเล่นหน่อยนะ'}
          </Text>
        )}
      </View>
    </View>
  );
}

function SummaryRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={srStyles.row}>
      <Text style={srStyles.label}>{label}</Text>
      <Text style={[srStyles.value, highlight && srStyles.highlight]}>{value}</Text>
    </View>
  );
}
const srStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: Colors.border },
  label: { fontSize: FontSize.sm, color: Colors.subtle },
  value: { fontSize: FontSize.sm, fontWeight: FontWeight.semiBold, color: Colors.textPrimary, flex: 1, textAlign: 'right', marginLeft: Spacing.sm },
  highlight: { color: Colors.accent, fontWeight: FontWeight.black },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFF7F5' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, gap: Spacing.md },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: Spacing.sm,
    backgroundColor: '#FFF7F5',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: Radius.full,
    backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.accent, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.10, shadowRadius: 6, elevation: 2,
  },
  backIcon: { fontSize: 24, color: Colors.textPrimary, lineHeight: 28 },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: FontSize.md, fontWeight: FontWeight.black, color: Colors.textPrimary },
  headerSub: { fontSize: FontSize.xs, color: Colors.subtle },
  roleBadge: {
    backgroundColor: Colors.accentLight, borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm, paddingVertical: 3,
    borderWidth: 1, borderColor: Colors.accent + '55',
  },
  roleBadgeText: { fontSize: FontSize.xs, color: Colors.accent, fontWeight: FontWeight.bold },

  fieldCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.lg + 2,
    borderWidth: 1, borderColor: Colors.borderCard, gap: Spacing.sm,
    shadowColor: Colors.shadowCard, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 1,
  },
  fieldHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  fieldIcon: { fontSize: 22, marginTop: 2 },
  fieldLabel: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  fieldHint: { fontSize: FontSize.xs, color: Colors.subtle, marginTop: 1 },

  placeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  placeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: Spacing.sm, paddingVertical: 6,
    borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface,
  },
  placeChipActive: { borderColor: Colors.accent, backgroundColor: Colors.accentLight },
  placeEmoji: { fontSize: 11 },
  placeChipText: { fontSize: FontSize.sm, color: Colors.subtle, fontWeight: FontWeight.medium },
  placeChipTextActive: { color: Colors.accent, fontWeight: FontWeight.bold },
  selectedBanner: {
    backgroundColor: Colors.accentLight, borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    borderWidth: 1, borderColor: Colors.accent + '44',
  },
  selectedBannerText: { fontSize: FontSize.sm, color: Colors.accent, fontWeight: FontWeight.semiBold },

  textArea: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    borderWidth: 1.5,
    borderColor: Colors.border,
    minHeight: 100,
  },
  charCount: { fontSize: 10, color: Colors.inactive, textAlign: 'right' },

  numInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  currencySymbol: { fontSize: FontSize.lg, color: Colors.accent, fontWeight: FontWeight.bold },
  numInput: { flex: 1, fontSize: FontSize.lg, color: Colors.textPrimary, fontWeight: FontWeight.bold },
  unitLabel: { fontSize: FontSize.sm, color: Colors.subtle },

  lineInput: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },

  tipChips: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  tipChip: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface,
  },
  tipChipActive: { borderColor: Colors.gold, backgroundColor: Colors.goldLight },
  tipChipText: { fontSize: FontSize.sm, color: Colors.subtle, fontWeight: FontWeight.semiBold },
  tipChipTextActive: { color: Colors.textOnYellow, fontWeight: FontWeight.black },
  orLabel: { fontSize: FontSize.xs, color: Colors.subtle, fontWeight: FontWeight.medium },

  miniTotal: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.goldLight, borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderWidth: 1, borderColor: Colors.gold + '55', marginTop: Spacing.xs,
  },
  miniTotalLabel: { fontSize: FontSize.sm, color: Colors.textOnYellow, fontWeight: FontWeight.medium },
  miniTotalVal: { fontSize: FontSize.xl, fontWeight: FontWeight.black, color: Colors.textOnYellow },

  previewCard: {
    backgroundColor: Colors.surfaceElevated, borderRadius: Radius.xl, padding: Spacing.lg,
    borderWidth: 1.5, borderColor: Colors.accent + '33', gap: 2,
  },
  previewTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.sm },

  submitWrap: {
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm,
    backgroundColor: '#FFF7F5', borderTopWidth: 1, borderTopColor: Colors.border,
  },
  submitBtn: {
    backgroundColor: Colors.accent, borderRadius: Radius.full,
    paddingVertical: Spacing.md + 2, alignItems: 'center',
    shadowColor: Colors.accent, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.40, shadowRadius: 20, elevation: 10,
  },
  submitBtnDisabled: { backgroundColor: Colors.inactive, shadowOpacity: 0, elevation: 0 },
  submitBtnText: { fontSize: FontSize.lg, fontWeight: FontWeight.black, color: '#fff', letterSpacing: 0.5 },
  submitHint: { fontSize: FontSize.xs, color: Colors.subtle, textAlign: 'center', marginTop: Spacing.xs },

  successWrap: {
    flexGrow: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.xxl, gap: Spacing.md,
  },
  successEmoji: { fontSize: 72 },
  successTitle: { fontSize: FontSize.display, fontWeight: FontWeight.black, color: Colors.textPrimary },
  successSub: { fontSize: FontSize.md, color: Colors.subtle },
  linkBox: {
    width: '100%', backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.lg,
    borderWidth: 2, borderColor: Colors.accent + '44', gap: Spacing.xs,
  },
  linkLabel: { fontSize: FontSize.xs, color: Colors.subtle, fontWeight: FontWeight.medium, textTransform: 'uppercase', letterSpacing: 1 },
  linkRow: { backgroundColor: Colors.accentLight, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  linkText: { fontSize: FontSize.sm, color: Colors.accent, fontWeight: FontWeight.bold },
  linkHint: { fontSize: FontSize.xs, color: Colors.subtle },
  summaryBox: {
    width: '100%', backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.lg,
    borderWidth: 1, borderColor: Colors.border, gap: 2,
  },
  goTaskBtn: {
    width: '100%', backgroundColor: Colors.accent, borderRadius: Radius.full,
    paddingVertical: Spacing.md, alignItems: 'center',
    shadowColor: Colors.accent, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.30, shadowRadius: 16, elevation: 8,
  },
  goTaskBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#fff' },
  homeBtn: { paddingVertical: Spacing.sm },
  homeBtnText: { fontSize: FontSize.sm, color: Colors.subtle },
});
