// ─── ฝากหน่อย — My Orders Screen ────────────────────────────────────────────
// แสดงรายการออเดอร์ที่เกี่ยวกับฉัน:
//   📦 ของที่ฉันฝาก  — ออเดอร์ที่ฉันส่ง (ฉันเป็น sender)
//   🛍️ ของที่ฉันหิ้ว  — ออเดอร์ที่ฉันรับเป็น scout
// เปิดจาก HomeScreen ปุ่ม 📋 กด back กลับ Home ได้ทันที
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
import { MOCK_REQUESTS } from '@data/mockFarkNoi';
import type { OrderRequest, OrderStatus } from '../types/farkNoi';

type Props = { navigation: any };
type Tab = 'sender' | 'scout';

// ── Status helpers ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  pending:         { label: 'รอคนรับ',           color: '#d97706', bg: '#fef3c7' },
  matched:         { label: 'มีคนรับแล้ว!',      color: '#16a34a', bg: '#dcfce7' },
  shopping:        { label: 'กำลังซื้อ 🛒',      color: '#2563eb', bg: '#dbeafe' },
  photo_pending:   { label: 'รอรูปยืนยัน 📸',    color: '#d97706', bg: '#fef3c7' },
  payment_pending: { label: 'รอโอนเงิน 💳',      color: '#dc2626', bg: '#fee2e2' },
  on_the_way:      { label: 'กำลังกลับมา 🚶',    color: '#2563eb', bg: '#dbeafe' },
  at_meetpoint:    { label: 'ถึงจุดนัดแล้ว! 📍', color: '#16a34a', bg: '#dcfce7' },
  completed:       { label: 'สำเร็จ ✅',          color: '#6b7280', bg: '#f3f4f6' },
  cancelled:       { label: 'ยกเลิก',             color: '#6b7280', bg: '#f3f4f6' },
  disputed:        { label: 'มีปัญหา ⚠️',         color: '#dc2626', bg: '#fee2e2' },
};

// ── Item row inside a card ────────────────────────────────────────────────────
function ItemRow({ name, qty, price, desc }: {
  name: string;
  qty: number;
  price: number;
  desc?: string;
}) {
  return (
    <View style={styles.itemRow}>
      <View style={styles.itemLeft}>
        <Text style={styles.itemName}>{name}</Text>
        {!!desc && <Text style={styles.itemDesc}>{desc}</Text>}
      </View>
      <View style={styles.itemRight}>
        <Text style={styles.itemQty}>x{qty}</Text>
        <Text style={styles.itemPrice}>฿{price * qty}</Text>
      </View>
    </View>
  );
}

// ── Order Card ────────────────────────────────────────────────────────────────
function MyOrderCard({
  order,
  role,
  onPress,
}: {
  order: OrderRequest;
  role: Tab;
  onPress: () => void;
}) {
  const cfg = STATUS_CONFIG[order.status];
  const otherParty = role === 'sender' ? order.scout : order.sender;

  return (
    <TouchableOpacity style={styles.orderCard} activeOpacity={0.88} onPress={onPress}>
      {/* Top row: destination + status */}
      <View style={styles.cardTopRow}>
        <View style={styles.cardDest}>
          <Text style={styles.cardDestIcon}>📍</Text>
          <Text style={styles.cardDestText} numberOfLines={1}>{order.destination}</Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: cfg.bg }]}>
          <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
      </View>

      {/* Items list */}
      <View style={styles.itemsBlock}>
        {order.items.map((item) => (
          <ItemRow
            key={item.id}
            name={item.name}
            qty={item.quantity}
            price={item.estimatedPrice}
            desc={item.description}
          />
        ))}
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Bottom row: other party + total */}
      <View style={styles.cardBottomRow}>
        <View style={styles.partyRow}>
          <Text style={styles.partyAvatar}>
            {otherParty ? otherParty.avatar : '❓'}
          </Text>
          <View>
            <Text style={styles.partyLabel}>
              {role === 'sender' ? 'Scout ที่รับ' : 'คนฝาก'}
            </Text>
            <Text style={styles.partyName}>
              {otherParty ? otherParty.name : 'ยังไม่มีคนรับ'}
            </Text>
          </View>
        </View>
        <View style={styles.totalBlock}>
          <Text style={styles.totalLabel}>รวม</Text>
          <Text style={styles.totalAmount}>฿{order.totalPayable}</Text>
        </View>
      </View>

      {/* Meeting point */}
      {order.meetingPoint && (
        <View style={styles.meetRow}>
          <Text style={styles.meetIcon}>{order.meetingPoint.emoji}</Text>
          <Text style={styles.meetLabel}>{order.meetingPoint.label}</Text>
        </View>
      )}

      {/* Notes */}
      {!!order.notes && (
        <View style={styles.noteRow}>
          <Text style={styles.noteIcon}>📝</Text>
          <Text style={styles.noteText}>{order.notes}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────
function EmptyState({ tab }: { tab: Tab }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>{tab === 'sender' ? '📦' : '🛍️'}</Text>
      <Text style={styles.emptyTitle}>
        {tab === 'sender' ? 'ยังไม่มีออเดอร์ที่ฝาก' : 'ยังไม่มีออเดอร์ที่รับหิ้ว'}
      </Text>
      <Text style={styles.emptyText}>
        {tab === 'sender'
          ? 'กลับหน้าหลักแล้วกด Scout ที่จะไปเพื่อฝากของ'
          : 'กลับหน้าหลักแล้วกดปุ่ม "ฉันจะไป..." เพื่อประกาศ'}
      </Text>
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function AppDetailScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<Tab>('sender');

  const myFarkedOrders = MOCK_REQUESTS.filter((r) => r.sender.id === 'me');
  const myCarryOrders = MOCK_REQUESTS.filter((r) => r.scout?.id === 'me');

  const displayed = activeTab === 'sender' ? myFarkedOrders : myCarryOrders;

  return (
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* ══ HEADER ══════════════════════════════════════════════════ */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ออเดอร์ของฉัน</Text>
        <View style={styles.headerRight} />
      </View>

      {/* ══ TABS ════════════════════════════════════════════════════ */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sender' && styles.tabActive]}
          onPress={() => setActiveTab('sender')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'sender' && styles.tabTextActive]}>
            📦 ของที่ฉันฝาก
          </Text>
          {myFarkedOrders.length > 0 && (
            <View style={[styles.tabBadge, activeTab === 'sender' && styles.tabBadgeActive]}>
              <Text style={[styles.tabBadgeText, activeTab === 'sender' && styles.tabBadgeTextActive]}>
                {myFarkedOrders.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'scout' && styles.tabActiveBlue]}
          onPress={() => setActiveTab('scout')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'scout' && styles.tabTextActiveBlue]}>
            🛍️ ของที่ฉันหิ้ว
          </Text>
          {myCarryOrders.length > 0 && (
            <View style={[styles.tabBadge, activeTab === 'scout' && styles.tabBadgeBlueActive]}>
              <Text style={[styles.tabBadgeText, activeTab === 'scout' && styles.tabBadgeTextActive]}>
                {myCarryOrders.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ══ LIST ════════════════════════════════════════════════════ */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {displayed.length === 0 ? (
          <EmptyState tab={activeTab} />
        ) : (
          displayed.map((order) => (
            <MyOrderCard
              key={order.id}
              order={order}
              role={activeTab}
              onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderCard,
    backgroundColor: Colors.background,
  },
  backBtn: {
    width: 38,
    height: 38,
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
  backIcon: { fontSize: 20, color: Colors.textPrimary, lineHeight: 24 },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  headerRight: { width: 38 },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    margin: Spacing.md,
    padding: 4,
    gap: 4,
    shadowColor: Colors.shadowCard,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    gap: 6,
  },
  tabActive: { backgroundColor: Colors.accent },
  tabActiveBlue: { backgroundColor: Colors.blue },
  tabText: { fontSize: FontSize.sm, fontWeight: FontWeight.semiBold, color: Colors.subtle },
  tabTextActive: { color: '#fff' },
  tabTextActiveBlue: { color: '#fff' },
  tabBadge: {
    backgroundColor: Colors.accentLight,
    borderRadius: Radius.full,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  tabBadgeActive: { backgroundColor: 'rgba(255,255,255,0.30)' },
  tabBadgeBlueActive: { backgroundColor: 'rgba(255,255,255,0.30)' },
  tabBadgeText: { fontSize: 10, fontWeight: FontWeight.bold, color: Colors.accent },
  tabBadgeTextActive: { color: '#fff' },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.md, gap: Spacing.sm },

  orderCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderCard,
    shadowColor: Colors.shadowCard,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
    gap: Spacing.sm,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardDest: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  cardDestIcon: { fontSize: 14 },
  cardDestText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    flex: 1,
  },
  statusPill: {
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginLeft: Spacing.xs,
  },
  statusText: { fontSize: 11, fontWeight: FontWeight.bold },

  itemsBlock: {
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    gap: 6,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  itemLeft: { flex: 1, paddingRight: Spacing.sm },
  itemName: { fontSize: FontSize.sm, fontWeight: FontWeight.semiBold, color: Colors.textPrimary },
  itemDesc: { fontSize: FontSize.xs, color: Colors.subtle, marginTop: 2 },
  itemRight: { alignItems: 'flex-end' },
  itemQty: { fontSize: FontSize.xs, color: Colors.subtle },
  itemPrice: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary },

  divider: { height: 1, backgroundColor: Colors.borderCard },

  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  partyRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  partyAvatar: { fontSize: 26 },
  partyLabel: { fontSize: 10, color: Colors.subtle },
  partyName: { fontSize: FontSize.sm, fontWeight: FontWeight.semiBold, color: Colors.textPrimary },
  totalBlock: { alignItems: 'flex-end' },
  totalLabel: { fontSize: 10, color: Colors.subtle },
  totalAmount: { fontSize: FontSize.lg, fontWeight: FontWeight.black, color: Colors.accent },

  meetRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  meetIcon: { fontSize: 14 },
  meetLabel: { fontSize: FontSize.xs, color: Colors.subtle },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: Colors.tipBg,
    borderRadius: Radius.sm,
    padding: Spacing.xs + 2,
  },
  noteIcon: { fontSize: 12 },
  noteText: { fontSize: FontSize.xs, color: Colors.textOnYellow, flex: 1, lineHeight: 16 },

  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl * 2,
    gap: Spacing.sm,
  },
  emptyEmoji: { fontSize: 52 },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.black,
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
  },
  emptyText: {
    fontSize: FontSize.sm,
    color: Colors.subtle,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: Spacing.lg,
  },
});
