// ─── ฝากหน่อย — OrderCard Component ─────────────────────────────────────────
// Reusable card: item info, yellow tip tag, trust badge, status pill
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@theme/index';
import type { OrderRequest, OrderStatus, ScoutAnnouncement, ScoutStatus } from '../types/farkNoi';

// ── Scout Status Tag Helpers ──────────────────────────────────────────────────
function getScoutStatusTag(status: ScoutStatus): {
  emoji: string;
  label: string;
  color: string;
  bg: string;
} {
  switch (status) {
    case 'heading_out':
      return { emoji: '🟢', label: 'กำลังเปิดรับ', color: '#16a34a', bg: '#dcfce7' };
    case 'at_destination':
      return { emoji: '🟡', label: 'Last call!', color: '#d97706', bg: '#fef3c7' };
    case 'returning':
      return { emoji: '🔴', label: 'ปิดรับแล้ว', color: '#dc2626', bg: '#fee2e2' };
    case 'completed':
      return { emoji: '✅', label: 'เสร็จแล้ว', color: '#6b7280', bg: '#f3f4f6' };
    default:
      return { emoji: '🟢', label: 'กำลังเปิดรับ', color: '#16a34a', bg: '#dcfce7' };
  }
}

// ── Time Helpers ──────────────────────────────────────────────────────────────
function getRelativeMinutes(isoDate: string): number {
  return Math.max(0, Math.round((new Date(isoDate).getTime() - Date.now()) / 60_000));
}

function getRelativeTimeLabel(isoDate: string): string {
  const mins = getRelativeMinutes(isoDate);
  if (mins <= 0) return 'ถึงแล้ว!';
  if (mins < 60) return `อีก ${mins} นาที`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `อีก ${hrs} ชม. ${rem} นาที` : `อีก ${hrs} ชม.`;
}

function getTimeProgress(departAt: string, estimatedReturn: string): number {
  const start = new Date(departAt).getTime();
  const end = new Date(estimatedReturn).getTime();
  const now = Date.now();
  if (now <= start) return 0;
  if (now >= end) return 1;
  return (now - start) / (end - start);
}

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  pending:          { label: 'รอคนรับ', color: Colors.requestPending,     bg: Colors.requestPendingBg },
  matched:          { label: 'มีคนรับแล้ว!', color: Colors.scoutActive,  bg: Colors.scoutActiveBg },
  shopping:         { label: 'กำลังซื้อ 🛒', color: Colors.blue,         bg: Colors.blueLight },
  photo_pending:    { label: 'รอรูปยืนยัน 📸', color: Colors.challengeOrange, bg: Colors.challengeOrangeBg },
  payment_pending:  { label: 'รอโอนเงิน 💳', color: Colors.accent,       bg: Colors.accentLight },
  on_the_way:       { label: 'กำลังกลับมา 🚶', color: Colors.blue,       bg: Colors.blueLight },
  at_meetpoint:     { label: 'ถึงจุดนัดแล้ว! 📍', color: Colors.win,     bg: 'rgba(16,185,129,0.12)' },
  completed:        { label: 'สำเร็จ ✅', color: Colors.win,              bg: 'rgba(16,185,129,0.12)' },
  cancelled:        { label: 'ยกเลิก', color: Colors.subtle,              bg: Colors.subtleLight },
  disputed:         { label: 'มีปัญหา ⚠️', color: Colors.danger,         bg: Colors.dangerBg },
};

// ── Scout Card (for Feed) ─────────────────────────────────────────────────────
interface ScoutCardProps {
  announcement: ScoutAnnouncement;
  onJoin: () => void;
  onViewGroup?: () => void;
}

export function ScoutCard({ announcement, onJoin, onViewGroup }: ScoutCardProps) {
  const spotsLeft = announcement.maxItems - announcement.currentItemCount;
  const isFull = spotsLeft <= 0;
  const isClosed = announcement.status === 'returning' || announcement.status === 'completed';
  const statusTag = getScoutStatusTag(announcement.status);
  const relativeTime = getRelativeTimeLabel(announcement.estimatedReturn);
  const exactTime = formatETA(announcement.estimatedReturn);
  const progress = getTimeProgress(announcement.departAt, announcement.estimatedReturn);
  const countdownMins = getRelativeMinutes(announcement.estimatedReturn);

  const countdownColor =
    countdownMins <= 10 ? '#ef4444' : countdownMins <= 20 ? '#f97316' : '#6b7280';

  const progressFillColor =
    progress > 0.8 ? '#ef4444' : progress > 0.5 ? '#f97316' : Colors.blue;

  return (
    <TouchableOpacity
      style={styles.scoutCard}
      activeOpacity={0.88}
      onPress={onViewGroup}
    >
      {/* ── Row 1: Avatar + Name + Countdown ────────────────────── */}
      <View style={styles.scoutTop}>
        <View style={styles.avatarWrap}>
          <Text style={styles.avatarText}>{announcement.scout.avatar}</Text>
        </View>
        <View style={styles.scoutInfo}>
          <View style={styles.scoutNameRow}>
            <Text style={styles.scoutName}>{announcement.scout.name}</Text>
            {announcement.scout.isVerified && (
              <Text style={styles.verifiedBadge}>✓</Text>
            )}
          </View>
          <Text style={styles.scoutDorm}>{announcement.scout.dorm}</Text>
        </View>

        {/* Countdown Timer — top-right */}
        <View style={styles.countdownWrap}>
          <Text style={[styles.countdownNum, { color: countdownColor }]}>
            {countdownMins <= 0 ? 'ถึงแล้ว' : `${countdownMins}m`}
          </Text>
          <Text style={[styles.countdownLabel, { color: countdownColor }]}>left</Text>
        </View>
      </View>

      {/* ── Status Tag ──────────────────────────────────────────── */}
      <View style={[styles.statusTagRow, { backgroundColor: statusTag.bg }]}>
        <Text style={[styles.statusTagText, { color: statusTag.color }]}>
          {statusTag.emoji}  {statusTag.label}
        </Text>
        <View style={styles.trustPill}>
          <Text style={styles.trustScore}>⭐ {announcement.scout.trustScore}</Text>
        </View>
      </View>

      {/* ── Destination ─────────────────────────────────────────── */}
      <View style={styles.destRow}>
        <Text style={styles.destIcon}>📍</Text>
        <Text style={styles.destText}>กำลังไป {announcement.destination}</Text>
        {announcement.isGroupOrder && (
          <View style={styles.groupTag}>
            <Text style={styles.groupTagText}>กลุ่ม 👥</Text>
          </View>
        )}
      </View>

      {/* ── Time Progress Bar ────────────────────────────────────── */}
      <View style={styles.progressWrap}>
        <View style={styles.progressBg}>
          <View
            style={[
              styles.progressFill,
              {
                flex: Math.min(progress, 1),
                backgroundColor: progressFillColor,
              },
            ]}
          />
          <View style={{ flex: Math.max(1 - progress, 0) }} />
        </View>
        <Text style={styles.progressLabel}>
          {relativeTime}  •  กลับ {exactTime}
        </Text>
      </View>

      {/* ── Slots Row ───────────────────────────────────────────── */}
      <View style={styles.scoutMeta}>
        <View style={styles.slotRow}>
          {Array.from({ length: announcement.maxItems }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.slotDot,
                i < announcement.currentItemCount && styles.slotDotFilled,
              ]}
            />
          ))}
          <Text style={styles.slotText}>
            {isFull ? 'เต็มแล้ว' : `ว่าง ${spotsLeft} ช่อง`}
          </Text>
        </View>
      </View>

      {/* ── Join / Closed Button ────────────────────────────────── */}
      {isClosed ? (
        <View style={styles.closedBtn}>
          <Text style={styles.closedBtnText}>🔴 ปิดรับแล้ว • รอรับของได้เลย</Text>
        </View>
      ) : !isFull ? (
        <TouchableOpacity style={styles.joinBtn} onPress={onJoin} activeOpacity={0.82}>
          <Text style={styles.joinBtnText}>
            {announcement.status === 'at_destination'
              ? `⚡ ฝากเลย — ด่วน! (ปิด ${exactTime})`
              : `ฝากเลย (ทันรอบ ${exactTime}) 🙋`}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={[styles.joinBtn, { backgroundColor: Colors.border }]}>
          <Text style={[styles.joinBtnText, { color: Colors.subtle }]}>ที่นั่งเต็มแล้ว</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ── Order Request Card ─────────────────────────────────────────────────────────
interface OrderCardProps {
  order: OrderRequest;
  viewMode?: 'sender' | 'scout'; // sender = คนฝาก, scout = คนหิ้ว
  onPress: () => void;
  onAccept?: () => void; // scout side
}

export function OrderCard({ order, viewMode = 'sender', onPress, onAccept }: OrderCardProps) {
  const statusCfg = STATUS_CONFIG[order.status];
  const firstItem = order.items[0];
  const extraCount = order.items.length - 1;

  return (
    <TouchableOpacity style={styles.orderCard} onPress={onPress} activeOpacity={0.86}>
      {/* Emoji thumbnail */}
      <View style={styles.orderThumb}>
        <Text style={styles.orderThumbEmoji}>🛍️</Text>
      </View>

      <View style={styles.orderBody}>
        {/* Header row */}
        <View style={styles.orderHeaderRow}>
          <Text style={styles.orderItemName} numberOfLines={1}>
            {firstItem.name}
            {extraCount > 0 ? ` +${extraCount}` : ''}
          </Text>
          {/* Status pill */}
          <View style={[styles.statusPill, { backgroundColor: statusCfg.bg }]}>
            <Text style={[styles.statusText, { color: statusCfg.color }]}>
              {statusCfg.label}
            </Text>
          </View>
        </View>

        {/* Location */}
        <Text style={styles.orderDest} numberOfLines={1}>
          📍 {order.destination}
        </Text>

        {/* Bottom row: tip + user */}
        <View style={styles.orderBottomRow}>
          {/* Tip tag (Yellow!) */}
          <View style={styles.tipTag}>
            <Text style={styles.tipTagText}>💛 ค่าขนม {order.feeBreakdown.totalFee} บาท</Text>
          </View>

          {viewMode === 'scout' && (
            <Text style={styles.senderName}>
              จาก {order.sender.avatar} {order.sender.name}
            </Text>
          )}
          {viewMode === 'sender' && order.scout && (
            <Text style={styles.senderName}>
              หิ้วโดย {order.scout.avatar} {order.scout.name}
            </Text>
          )}
        </View>
      </View>

      {/* Accept button (scout view, pending) */}
      {viewMode === 'scout' && order.status === 'pending' && onAccept && (
        <TouchableOpacity style={styles.acceptBtn} onPress={onAccept} activeOpacity={0.82}>
          <Text style={styles.acceptBtnText}>รับ</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatETA(isoDate: string): string {
  const d = new Date(isoDate);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')} น.`;
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Scout Card
  scoutCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    shadowColor: Colors.shadowBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.75,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1.5,
    borderColor: Colors.blueBorder,
  },
  scoutTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  avatarWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.blueLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  avatarText: {
    fontSize: 20,
  },
  scoutInfo: {
    flex: 1,
  },
  scoutNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scoutName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  verifiedBadge: {
    fontSize: 11,
    backgroundColor: Colors.blueLight,
    color: Colors.blue,
    borderRadius: Radius.full,
    paddingHorizontal: 5,
    paddingVertical: 1,
    overflow: 'hidden',
  },
  scoutDorm: {
    fontSize: FontSize.xs,
    color: Colors.subtle,
    marginTop: 2,
  },
  // Countdown
  countdownWrap: {
    alignItems: 'center',
    minWidth: 44,
  },
  countdownNum: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.black,
    lineHeight: 20,
  },
  countdownLabel: {
    fontSize: 10,
    fontWeight: FontWeight.medium,
  },
  // Status Tag Row
  statusTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    marginBottom: Spacing.sm,
  },
  statusTagText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  trustPill: {
    backgroundColor: Colors.blueLight,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  trustScore: {
    fontSize: FontSize.xs,
    color: Colors.blue,
    fontWeight: FontWeight.bold,
  },
  destRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: 4,
  },
  destIcon: {
    fontSize: 13,
  },
  destText: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    fontWeight: FontWeight.medium,
    flex: 1,
  },
  groupTag: {
    backgroundColor: Colors.blueLight,
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  groupTagText: {
    fontSize: FontSize.xs,
    color: Colors.blue,
    fontWeight: FontWeight.medium,
  },
  // Progress Bar
  progressWrap: {
    marginBottom: Spacing.sm,
    gap: 4,
  },
  progressBg: {
    height: 5,
    backgroundColor: Colors.border,
    borderRadius: Radius.full,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  progressLabel: {
    fontSize: 11,
    color: Colors.subtle,
  },
  scoutMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  slotDot: {
    width: 7,
    height: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.border,
    borderWidth: 1,
    borderColor: Colors.inactive,
  },
  slotDotFilled: {
    backgroundColor: Colors.blue,
    borderColor: Colors.blue,
  },
  slotText: {
    fontSize: FontSize.xs,
    color: Colors.subtle,
    marginLeft: 4,
  },
  joinBtn: {
    backgroundColor: Colors.blue,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    marginTop: 4,
  },
  joinBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textOnBlue,
  },
  closedBtn: {
    backgroundColor: '#fee2e2',
    borderRadius: Radius.lg,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    marginTop: 4,
  },
  closedBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    color: '#dc2626',
  },

  // Order Card
  orderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    shadowColor: Colors.shadowCard,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.borderCard,
  },
  orderThumb: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  orderThumbEmoji: {
    fontSize: 26,
  },
  orderBody: {
    flex: 1,
  },
  orderHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  orderItemName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Spacing.xs,
  },
  statusPill: {
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: FontWeight.semiBold,
  },
  orderDest: {
    fontSize: FontSize.xs,
    color: Colors.subtle,
    marginBottom: 6,
  },
  orderBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tipTag: {
    backgroundColor: Colors.tipBg,
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Colors.tipBorder,
  },
  tipTagText: {
    fontSize: 11,
    fontWeight: FontWeight.semiBold,
    color: Colors.textOnYellow,
  },
  senderName: {
    fontSize: FontSize.xs,
    color: Colors.subtle,
  },
  acceptBtn: {
    backgroundColor: Colors.blue,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  acceptBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textOnBlue,
  },
});
