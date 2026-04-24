// ─── SettingsScreen — ฝากหน่อย ────────────────────────────────────────────────
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@theme/index';
import { MOCK_USERS } from '@data/mockFarkNoi';

const ME = MOCK_USERS.find(u => u.id === 'me')!;
const VERSION = '1.0.0 (ฝากหน่อย)';

type Props = { navigation?: any };

export default function SettingsScreen({ navigation }: Props) {
  const [notifOrders, setNotifOrders]   = useState(true);
  const [notifChat, setNotifChat]       = useState(true);
  const [notifSystem, setNotifSystem]   = useState(false);
  const [darkMode, setDarkMode]         = useState(false);

  const handleLogout = () =>
    Alert.alert('ออกจากระบบ', 'ต้องการออกจากระบบใช่ไหม?', [
      { text: 'ยกเลิก' },
      { text: 'ออกจากระบบ', style: 'destructive', onPress: () => navigation?.navigate?.('Login') },
    ]);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack()} activeOpacity={0.8}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>ตั้งค่า</Text>
            <Text style={styles.headerSub}>ฝากหน่อย · {VERSION}</Text>
          </View>
        </View>

        {/* ── Profile card ────────────────────────────────────────────────── */}
        <TouchableOpacity style={styles.profileCard} activeOpacity={0.85} onPress={() => navigation?.navigate?.('Profile')}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>{ME.avatar}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{ME.name}</Text>
            <Text style={styles.profileDorm}>🏢 {ME.dorm}</Text>
            <View style={styles.trustRow}>
              <View style={styles.trustDot} />
              <Text style={styles.trustText}>Trust Score {ME.trustScore.toFixed(1)}</Text>
            </View>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        {/* ── Trust Badges ────────────────────────────────────────────────── */}
        {ME.badges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ตรารับรอง</Text>
            <View style={styles.badgesRow}>
              {ME.badges.map((b, i) => (
                <View key={i} style={styles.badge}>
                  <Text style={styles.badgeIcon}>{b.emoji}</Text>
                  <Text style={styles.badgeLabel}>{b.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Stats ───────────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>สถิติ</Text>
          <View style={styles.statsGrid}>
            <StatBox emoji="📦" label="ฝากทั้งหมด"  value={String(ME.totalOrders)} />
            <StatBox emoji="🏃" label="อัตราสำเร็จ"   value={`${ME.completionRate}%`} />
            <StatBox emoji="⭐" label="คะแนนเฉลี่ย"  value={ME.rating.toFixed(1)} />
            <StatBox emoji="✅" label="Trust Score"  value={ME.trustScore.toFixed(1)} />
          </View>
        </View>

        {/* ── Notifications ───────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>การแจ้งเตือน</Text>
          <SwitchRow label="คำสั่งฝากใหม่"   value={notifOrders} onChange={setNotifOrders} />
          <SwitchRow label="ข้อความในแชท"     value={notifChat}   onChange={setNotifChat}   />
          <SwitchRow label="ประกาศระบบ"       value={notifSystem} onChange={setNotifSystem} />
        </View>

        {/* ── App ─────────────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>แอป</Text>
          <SwitchRow label="โหมดมืด (เร็วๆ นี้)" value={darkMode} onChange={setDarkMode} disabled />
          <MenuRow label="นโยบายความเป็นส่วนตัว" onPress={() => {}} />
          <MenuRow label="ข้อกำหนดการใช้งาน"    onPress={() => {}} />
          <MenuRow label="ติดต่อทีมงาน"           onPress={() => {}} />
        </View>

        {/* ── Logout ──────────────────────────────────────────────────────── */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutText}>ออกจากระบบ</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>ฝากหน่อย v{VERSION.split(' ')[0]}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function StatBox({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function SwitchRow({ label, value, onChange, disabled }: { label: string; value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <View style={styles.switchRow}>
      <Text style={[styles.rowLabel, disabled && { color: Colors.subtle }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        trackColor={{ false: Colors.border, true: Colors.accent }}
        thumbColor="#fff"
      />
    </View>
  );
}

function MenuRow({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.menuRow} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root:        { flex: 1, backgroundColor: Colors.background },
  scroll:      { padding: Spacing.md, paddingBottom: 40 },

  header:      { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  backBtn:     { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', elevation: 1 },
  backBtnText: { fontSize: FontSize.lg, color: Colors.textPrimary },
  headerTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  headerSub:   { fontSize: FontSize.xs, color: Colors.subtle },

  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, elevation: 2 },
  avatarCircle:{ width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.blue + '22', alignItems: 'center', justifyContent: 'center', marginRight: Spacing.sm },
  avatarEmoji: { fontSize: 28 },
  profileInfo: { flex: 1 },
  profileName: { fontSize: FontSize.md, fontWeight: FontWeight.semiBold, color: Colors.textPrimary },
  profileDorm: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  trustRow:    { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
  trustDot:    { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.blue },
  trustText:   { fontSize: FontSize.xs, color: Colors.blue, fontWeight: FontWeight.semiBold },
  chevron:     { fontSize: 22, color: Colors.subtle },

  section:     { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, elevation: 1 },
  sectionTitle:{ fontSize: FontSize.sm, fontWeight: FontWeight.semiBold, color: Colors.subtle, marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },

  badgesRow:   { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  badge:       { backgroundColor: Colors.trustBadgeBg, borderRadius: Radius.sm, paddingHorizontal: 10, paddingVertical: 6, alignItems: 'center' },
  badgeIcon:   { fontSize: 18 },
  badgeLabel:  { fontSize: FontSize.xs, color: Colors.textPrimary, marginTop: 2, fontWeight: FontWeight.semiBold },

  statsGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  statBox:     { flex: 1, minWidth: '40%', backgroundColor: Colors.background, borderRadius: Radius.md, padding: Spacing.sm, alignItems: 'center' },
  statEmoji:   { fontSize: 24 },
  statValue:   { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginTop: 4 },
  statLabel:   { fontSize: FontSize.xs, color: Colors.subtle, marginTop: 2 },

  switchRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  menuRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  rowLabel:    { fontSize: FontSize.md, color: Colors.textPrimary },

  logoutBtn:   { backgroundColor: Colors.accent + '18', borderWidth: 1, borderColor: Colors.accent, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', marginBottom: Spacing.md },
  logoutText:  { fontSize: FontSize.md, fontWeight: FontWeight.semiBold, color: Colors.accent },

  footer:      { textAlign: 'center', fontSize: FontSize.xs, color: Colors.subtle },
});
