// ─── ฝากหน่อย — TaskBoardScreen (ผู้รับฝาก/คนหิ้ว) ──────────────────────────
// Card list เรียงตามเวลาล่าสุด + Filter จุดนัดพบ: โทนเย็น (Turquoise)
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState } from 'react';
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

type Props = { navigation: any };

// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_TASKS = [
  {
    id: 'T001',
    meetup: 'หน้าหอ A',
    items: 'ชานมไข่มุก หวาน 50% ไม่ใส่น้ำแข็ง 1 แก้ว',
    estPrice: 65,
    tip: 20,
    nickname: 'มิ้น',
    postedAt: '5 นาทีที่แล้ว',
  },
  {
    id: 'T002',
    meetup: 'ตึกเรียน 5',
    items: 'ข้าวมันไก่ ไม่เผ็ด 1 จาน + น้ำเปล่า 1 ขวด',
    estPrice: 80,
    tip: 15,
    nickname: 'โบ',
    postedAt: '12 นาทีที่แล้ว',
  },
  {
    id: 'T003',
    meetup: 'ประตูเชียงราก',
    items: 'กาแฟอเมริกาโน่เย็น 1 แก้ว + โดนัท 2 ชิ้น',
    estPrice: 120,
    tip: 25,
    nickname: 'ฟิล์ม',
    postedAt: '20 นาทีที่แล้ว',
  },
  {
    id: 'T004',
    meetup: 'โรงอาหารกลาง',
    items: 'ก๋วยเตี๋ยวเส้นใหญ่น้ำใส ไม่ใส่ผัก 1 ชาม',
    estPrice: 55,
    tip: 10,
    nickname: 'บีม',
    postedAt: '35 นาทีที่แล้ว',
  },
  {
    id: 'T005',
    meetup: 'หน้า 7-Eleven',
    items: 'น้ำแดง 1 ขวด + บะหมี่กึ่งสำเร็จรูป 2 ซอง + ไข่ต้ม 2 ฟอง',
    estPrice: 95,
    tip: 20,
    nickname: 'นุ่น',
    postedAt: '1 ชั่วโมงที่แล้ว',
  },
  {
    id: 'T006',
    meetup: 'หน้าหอ B',
    items: 'สมูทตี้มะม่วง 1 แก้ว',
    estPrice: 70,
    tip: 15,
    nickname: 'เอิ้น',
    postedAt: '1 ชั่วโมงที่แล้ว',
  },
];

const ALL_PLACES = ['ทั้งหมด', ...Array.from(new Set(MOCK_TASKS.map((t) => t.meetup)))];

export default function TaskBoardScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [filterPlace, setFilterPlace] = useState('ทั้งหมด');

  const filtered =
    filterPlace === 'ทั้งหมด'
      ? MOCK_TASKS
      : MOCK_TASKS.filter((t) => t.meetup === filterPlace);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>งานที่รอหิ้ว 🛍️</Text>
          <Text style={styles.headerSub}>{filtered.length} รายการ · เรียงตามใหม่สุด</Text>
        </View>
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>ผู้หิ้ว</Text>
        </View>
      </View>

      {/* ── Filter chips ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
        style={styles.filterBar}
      >
        {ALL_PLACES.map((place) => (
          <TouchableOpacity
            key={place}
            style={[styles.filterChip, filterPlace === place && styles.filterChipActive]}
            onPress={() => setFilterPlace(place)}
            activeOpacity={0.75}
          >
            <Text style={[styles.filterChipText, filterPlace === place && styles.filterChipTextActive]}>
              {place === 'ทั้งหมด' ? '🗺️ ทั้งหมด' : `📍 ${place}`}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Task Cards ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🤷</Text>
            <Text style={styles.emptyText}>ไม่มีงานในจุดนี้ตอนนี้</Text>
          </View>
        ) : (
          filtered.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onAccept={() =>
                navigation.navigate('ActiveOrder', {
                  orderId: task.id,
                  role: 'scout',
                  task,
                })
              }
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

// ── Task Card ─────────────────────────────────────────────────────────────────
function TaskCard({
  task,
  onAccept,
}: {
  task: (typeof MOCK_TASKS)[0];
  onAccept: () => void;
}) {
  const cod = task.estPrice + task.tip;
  const shortItems =
    task.items.length > 55 ? task.items.substring(0, 55) + '...' : task.items;

  return (
    <View style={cardStyles.card}>
      {/* Header */}
      <View style={cardStyles.header}>
        <View style={cardStyles.headerLeft}>
          <Text style={cardStyles.meetupIcon}>📍</Text>
          <Text style={cardStyles.meetup}>{task.meetup}</Text>
        </View>
        <View style={cardStyles.tipBadge}>
          <Text style={cardStyles.tipBadgeText}>💛 ค่าเหนื่อย {task.tip} ฿</Text>
        </View>
      </View>

      {/* Body */}
      <View style={cardStyles.body}>
        <Text style={cardStyles.itemsText}>{shortItems}</Text>
        <View style={cardStyles.codRow}>
          <Text style={cardStyles.codLabel}>💰 COD สำรองจ่าย</Text>
          <Text style={cardStyles.codVal}>฿{cod}</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={cardStyles.divider} />

      {/* Footer */}
      <View style={cardStyles.footer}>
        <View style={cardStyles.footerMeta}>
          <Text style={cardStyles.nickname}>👤 {task.nickname}</Text>
          <Text style={cardStyles.postedAt}>🕐 {task.postedAt}</Text>
        </View>
        <TouchableOpacity
          style={cardStyles.acceptBtn}
          onPress={onAccept}
          activeOpacity={0.85}
        >
          <Text style={cardStyles.acceptBtnText}>รับงานนี้</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Card styles ───────────────────────────────────────────────────────────────
const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.blue + '33',
    shadowColor: Colors.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 3,
    gap: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  meetupIcon: { fontSize: 14 },
  meetup: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.black,
    color: Colors.blue,
  },
  tipBadge: {
    backgroundColor: Colors.goldLight,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.gold + '66',
  },
  tipBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textOnYellow,
  },
  body: { gap: 6 },
  itemsText: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  codRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.blueLight,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    marginTop: 4,
  },
  codLabel: { fontSize: FontSize.xs, color: Colors.blue, fontWeight: FontWeight.medium },
  codVal: { fontSize: FontSize.md, fontWeight: FontWeight.black, color: Colors.blue },
  divider: { height: 1, backgroundColor: Colors.border },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerMeta: { gap: 2 },
  nickname: { fontSize: FontSize.xs, color: Colors.subtle },
  postedAt: { fontSize: FontSize.xs, color: Colors.subtle },
  acceptBtn: {
    backgroundColor: Colors.blue,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    shadowColor: Colors.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 10,
    elevation: 6,
  },
  acceptBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.black,
    color: '#fff',
  },
});

// ── Screen styles ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F0FDFB' },    // icy mint bg (ผู้หิ้ว)
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.md, paddingTop: Spacing.sm },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    backgroundColor: '#F0FDFB',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: Radius.full,
    backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.blue, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.10, shadowRadius: 6, elevation: 2,
  },
  backIcon: { fontSize: 24, color: Colors.textPrimary, lineHeight: 28 },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: FontSize.md, fontWeight: FontWeight.black, color: Colors.textPrimary },
  headerSub: { fontSize: FontSize.xs, color: Colors.subtle },
  roleBadge: {
    backgroundColor: Colors.blueLight, borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm, paddingVertical: 3,
    borderWidth: 1, borderColor: Colors.blue + '55',
  },
  roleBadgeText: { fontSize: FontSize.xs, color: Colors.blue, fontWeight: FontWeight.bold },

  filterBar: {
    backgroundColor: '#F0FDFB',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterScroll: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  filterChip: {
    paddingHorizontal: Spacing.md, paddingVertical: 7,
    borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  filterChipActive: {
    borderColor: Colors.blue, backgroundColor: Colors.blueLight,
  },
  filterChipText: { fontSize: FontSize.sm, color: Colors.subtle, fontWeight: FontWeight.medium },
  filterChipTextActive: { color: Colors.blue, fontWeight: FontWeight.bold },

  emptyState: { alignItems: 'center', paddingVertical: 80 },
  emptyEmoji: { fontSize: 52, marginBottom: Spacing.sm },
  emptyText: { fontSize: FontSize.md, color: Colors.subtle },
});
