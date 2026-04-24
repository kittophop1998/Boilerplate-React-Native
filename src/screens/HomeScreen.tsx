// ─── ฝากหน่อย (Fark-Noi) — Home Screen ──────────────────────────────────────
// Clean feed: header with quick-action buttons + scout list
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@theme/index';
import { MOCK_SCOUTS } from '@data/mockFarkNoi';
import { ScoutCard } from '@components/OrderCard';

type Props = { navigation: any };

// ── Empty State ───────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyBlobOuter}>
        <View style={styles.emptyBlobInner}>
          <Text style={styles.emptyEmoji}>🚶</Text>
        </View>
      </View>
      <Text style={styles.emptyTitle}>ยังไม่มีใครออกเดินทาง</Text>
      <Text style={styles.emptyText}>{'รอสักครู่ หรือกดปุ่ม "ฉันจะไป" เพื่อประกาศเส้นทางของคุณ'}</Text>
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function HomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const activeScouts = MOCK_SCOUTS.filter(
    (s) => s.status === 'heading_out' || s.status === 'at_destination',
  );

  return (
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* ══ HEADER (fixed) ══════════════════════════════════════════ */}
      <View style={styles.header}>
        {/* App title */}
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.appName}>ฝากหน่อย 🛍️</Text>
            <Text style={styles.appSub}>คนใกล้คุณกำลังจะออกไป — ฝากเลย!</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => navigation.navigate('AppDetail')}
            >
              <Text style={styles.iconBtnText}>📋</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => navigation.navigate('Settings')}
            >
              <Text style={styles.iconBtnText}>🔔</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ══ SCOUT LIST ══════════════════════════════════════════════ */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Section label + FAB inline */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🚶 กำลังเดินทาง</Text>
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>{activeScouts.length} คน</Text>
          </View>
        </View>

        {/* ── ประกาศว่าจะไป ── */}
        <TouchableOpacity
          style={styles.announceBtn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('ScoutAnnounce')}
        >
          <Text style={styles.announceBtnIcon}>🚶</Text>
          <Text style={styles.announceBtnText}>ฉันจะไป... กดเพื่อประกาศ</Text>
          <Text style={styles.announceBtnArrow}>›</Text>
        </TouchableOpacity>

        {activeScouts.length === 0 ? (
          <EmptyState />
        ) : (
          activeScouts.map((scout) => (
            <ScoutCard
              key={scout.id}
              announcement={scout}
              onJoin={() => navigation.navigate('PostRequest', { announcementId: scout.id })}
              onViewGroup={() => navigation.navigate('PostRequest', { announcementId: scout.id })}
            />
          ))
        )}
      </ScrollView>

      {/* ══ FAB — ประกาศว่าจะไป ═════════════════════════════════════ */}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderCard,
    gap: Spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  appName: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.black,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  appSub: { fontSize: FontSize.sm, color: Colors.subtle, marginTop: 2 },
  notifBtn: {
    width: 42,
    height: 42,
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
  notifIcon: { fontSize: 20 },

  // ── Header icon buttons ───────────────────────────────────────────────────
  headerIcons: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  iconBtn: {
    width: 42,
    height: 42,
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
  iconBtnText: { fontSize: 20 },

  // ── Scout list ────────────────────────────────────────────────────────────
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.md, paddingTop: Spacing.sm },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  sectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  sectionBadge: {
    backgroundColor: Colors.blueLight,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Colors.blueBorder,
  },
  sectionBadgeText: {
    fontSize: 11,
    fontWeight: FontWeight.semiBold,
    color: Colors.blue,
  },

  // ── Empty state ───────────────────────────────────────────────────────────
  emptyState: { alignItems: 'center', paddingVertical: Spacing.xl, gap: Spacing.sm },
  emptyBlobOuter: {
    width: 110,
    height: 110,
    borderRadius: Radius.full,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  emptyBlobInner: {
    width: 80,
    height: 80,
    borderRadius: Radius.full,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyEmoji: { fontSize: 42 },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.black,
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
  },
  emptyText: { fontSize: FontSize.sm, color: Colors.subtle, textAlign: 'center', lineHeight: 20 },

  // ── Announce button (inline in scroll) ──────────────────────────────────
  announceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: Colors.shadowAccent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
    gap: Spacing.sm,
  },
  announceBtnIcon: { fontSize: 22 },
  announceBtnText: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textOnAccent,
  },
  announceBtnArrow: {
    fontSize: 24,
    color: Colors.textOnAccent,
    fontWeight: FontWeight.bold,
    lineHeight: 28,
  },
});
