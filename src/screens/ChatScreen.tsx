// ─── ฝากหน่อย — ChatScreen (ระบบแชทในออเดอร์) ────────────────────────────────
// Special action buttons: ส่งรูปใบเสร็จ, ขอเก็บเงิน, ถึงจุดนัดรับแล้ว
// Escrow status banner at top
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useRef } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@theme/index';
import { MOCK_REQUESTS } from '@data/mockFarkNoi';
import type { FarkNoiChatMessage, ChatMessageType } from '../types/farkNoi';

type Props = { navigation: any; route: any };

const MY_ID = 'me';

function makeMsg(
  type: ChatMessageType,
  text: string,
  senderId = MY_ID,
  senderName = 'คุณ',
  senderAvatar = '😊',
  amount?: number,
): FarkNoiChatMessage {
  return {
    id: `msg_${Date.now()}_${Math.random()}`,
    orderId: 'req1',
    senderId,
    senderName,
    senderAvatar,
    type,
    text,
    amount,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
}

const INITIAL_MESSAGES: FarkNoiChatMessage[] = [
  {
    id: 'm1', orderId: 'req1',
    senderId: 'u1', senderName: 'มิน', senderAvatar: '🐱',
    type: 'system',
    text: '🔗 ออเดอร์เชื่อมกันแล้ว! เริ่มคุยกันได้เลยค่ะ',
    isRead: true, createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
  },
  {
    id: 'm2', orderId: 'req1',
    senderId: 'u1', senderName: 'มิน', senderAvatar: '🐱',
    type: 'text',
    text: 'สวัสดีค่ะ! รับออเดอร์แล้วนะคะ กำลังเดินไปฟิวเจอร์แล้ว',
    isRead: true, createdAt: new Date(Date.now() - 9 * 60000).toISOString(),
  },
  {
    id: 'm3', orderId: 'req1',
    senderId: MY_ID, senderName: 'คุณ', senderAvatar: '😊',
    type: 'text',
    text: 'ขอบคุณมากเลยค่ะ ถ้าชานมหมด เอาชาเขียวไข่มุกแทนได้เลยนะคะ',
    isRead: true, createdAt: new Date(Date.now() - 8 * 60000).toISOString(),
  },
];

// ── Chat bubble ───────────────────────────────────────────────────────────────
function ChatBubble({ msg }: { msg: FarkNoiChatMessage }) {
  const isMe = msg.senderId === MY_ID;
  const isSystem = msg.type === 'system';

  if (isSystem) {
    return (
      <View style={styles.systemMsgWrap}>
        <Text style={styles.systemMsg}>{msg.text}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.bubbleWrap, isMe && styles.bubbleWrapMe]}>
      {!isMe && (
        <View style={styles.avatarSmall}>
          <Text style={styles.avatarSmallText}>{msg.senderAvatar}</Text>
        </View>
      )}
      <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
        {!isMe && <Text style={styles.bubbleSender}>{msg.senderName}</Text>}

        {msg.type === 'receipt_photo' && (
          <View style={styles.photoBubble}>
            <Text style={styles.photoBubbleIcon}>📸</Text>
            <Text style={styles.photoBubbleText}>รูปใบเสร็จ</Text>
          </View>
        )}
        {msg.type === 'product_photo' && (
          <View style={styles.photoBubble}>
            <Text style={styles.photoBubbleIcon}>📷</Text>
            <Text style={styles.photoBubbleText}>รูปสินค้า</Text>
          </View>
        )}
        {msg.type === 'payment_request' && (
          <View style={styles.paymentBubble}>
            <Text style={styles.paymentTitle}>💳 ขอเก็บเงิน</Text>
            <Text style={styles.paymentAmount}>{msg.amount} บาท</Text>
            <TouchableOpacity style={styles.payNowBtn}>
              <Text style={styles.payNowText}>โอนเงินเดี๋ยวนี้</Text>
            </TouchableOpacity>
          </View>
        )}
        {msg.type === 'arrived_meetpoint' && (
          <View style={styles.arrivedBubble}>
            <Text style={styles.arrivedIcon}>📍</Text>
            <Text style={styles.arrivedText}>ถึงจุดนัดรับแล้ว!</Text>
            <Text style={styles.arrivedSub}>มารับของได้เลยนะคะ</Text>
          </View>
        )}
        {msg.type === 'location_share' && (
          <View style={styles.locationBubble}>
            <Text style={styles.locationIcon}>🗺️</Text>
            <Text style={styles.locationText}>
              {msg.text || 'แชร์ตำแหน่งปัจจุบัน'}
            </Text>
          </View>
        )}
        {(msg.type === 'text' || msg.type === 'payment_slip') && msg.text && (
          <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>{msg.text}</Text>
        )}
        <Text style={[styles.bubbleTime, isMe && styles.bubbleTimeMe]}>
          {new Date(msg.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ChatScreen({ navigation, route }: Props) {
  const orderId = route?.params?.orderId ?? 'req1';
  const otherUserName = route?.params?.otherUserName ?? 'มิน';

  const order = MOCK_REQUESTS.find((r) => r.id === orderId);
  const [messages, setMessages] = useState<FarkNoiChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [showActions, setShowActions] = useState(false);
  const flatRef = useRef<FlatList>(null);

  const sendMsg = (msg: FarkNoiChatMessage) => {
    setMessages((prev) => [...prev, msg]);
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const sendText = () => {
    if (!inputText.trim()) return;
    sendMsg(makeMsg('text', inputText.trim()));
    setInputText('');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{otherUserName}</Text>
          <Text style={styles.headerOrder}>
            📦 {order?.items[0].name ?? 'ออเดอร์'}
            {(order?.items.length ?? 0) > 1 ? ` +${(order?.items.length ?? 1) - 1}` : ''}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.orderDetailBtn}
          onPress={() => navigation.navigate('OrderDetail', { orderId })}
        >
          <Text style={styles.orderDetailText}>ออเดอร์</Text>
        </TouchableOpacity>
      </View>

      {/* ── Escrow banner ── */}
      {order?.escrowHeld && (
        <View style={styles.escrowBanner}>
          <Text style={styles.escrowBannerText}>
            🔒 เงินอยู่ในระบบ Escrow — จะโอนให้คนหิ้วเมื่อยืนยันรับของแล้ว
          </Text>
        </View>
      )}

      {/* ── Status pills ── */}
      <View style={styles.statusRow}>
        <View style={[styles.statusPill, { backgroundColor: Colors.scoutActiveBg }]}>
          <Text style={[styles.statusPillText, { color: Colors.blue }]}>
            🟢 มีคนรับแล้ว
          </Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: Colors.tipBg }]}>
          <Text style={[styles.statusPillText, { color: Colors.textOnYellow }]}>
            💛 ค่าขนม {order?.feeBreakdown.totalFee ?? 0} บาท
          </Text>
        </View>
      </View>

      {/* ── Messages ── */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => <ChatBubble msg={item} />}
          contentContainerStyle={styles.msgList}
          onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: false })}
          showsVerticalScrollIndicator={false}
        />

        {/* ── Action panel ── */}
        {showActions && (
          <View style={styles.actionPanel}>
            <Text style={styles.actionPanelTitle}>เครื่องมือพิเศษ</Text>
            <View style={styles.actionGrid}>
              <TouchableOpacity
                style={styles.actionItem}
                onPress={() => {
                  sendMsg(makeMsg('receipt_photo', 'ส่งรูปใบเสร็จ'));
                  setShowActions(false);
                }}
              >
                <Text style={styles.actionItemIcon}>📸</Text>
                <Text style={styles.actionItemLabel}>ส่งรูปใบเสร็จ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionItem}
                onPress={() => {
                  sendMsg(makeMsg('product_photo', 'ส่งรูปสินค้า'));
                  setShowActions(false);
                }}
              >
                <Text style={styles.actionItemIcon}>📷</Text>
                <Text style={styles.actionItemLabel}>ส่งรูปสินค้า</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionItem, styles.actionItemAccent]}
                onPress={() => {
                  sendMsg(makeMsg('payment_request', 'ขอเก็บเงิน', MY_ID, 'คุณ', '😊', order?.totalPayable ?? 85));
                  setShowActions(false);
                }}
              >
                <Text style={styles.actionItemIcon}>💳</Text>
                <Text style={styles.actionItemLabel}>ขอเก็บเงิน</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionItem, styles.actionItemBlue]}
                onPress={() => {
                  sendMsg(makeMsg('arrived_meetpoint', 'ถึงจุดนัดรับแล้ว!'));
                  setShowActions(false);
                }}
              >
                <Text style={styles.actionItemIcon}>📍</Text>
                <Text style={styles.actionItemLabel}>ถึงจุดนัดแล้ว</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionItem}
                onPress={() => {
                  sendMsg(makeMsg('location_share', 'แชร์ตำแหน่งปัจจุบัน'));
                  setShowActions(false);
                }}
              >
                <Text style={styles.actionItemIcon}>🗺️</Text>
                <Text style={styles.actionItemLabel}>แชร์ตำแหน่ง</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionItem, { backgroundColor: 'rgba(16,185,129,0.10)' }]}
                onPress={() => {
                  sendMsg(makeMsg('system', '✅ ยืนยันรับของเรียบร้อยแล้ว! ออเดอร์สำเร็จ'));
                  setShowActions(false);
                }}
              >
                <Text style={styles.actionItemIcon}>✅</Text>
                <Text style={styles.actionItemLabel}>ยืนยันรับของ</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── Input bar ── */}
        <View style={styles.inputBar}>
          <TouchableOpacity
            style={[styles.actionToggle, showActions && styles.actionToggleActive]}
            onPress={() => setShowActions(!showActions)}
          >
            <Text style={styles.actionToggleText}>{showActions ? '✕' : '+'}</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.textInput}
            placeholder="พิมพ์ข้อความ..."
            placeholderTextColor={Colors.subtle}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={sendText}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            onPress={sendText}
            disabled={!inputText.trim()}
          >
            <Text style={styles.sendBtnText}>ส่ง</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  backBtn: {
    width: 36, height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { fontSize: 22, color: Colors.textPrimary, lineHeight: 26 },
  headerInfo: { flex: 1 },
  headerName: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  headerOrder: { fontSize: FontSize.xs, color: Colors.subtle },
  orderDetailBtn: {
    backgroundColor: Colors.accentLight,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
  },
  orderDetailText: { fontSize: 11, color: Colors.accent, fontWeight: FontWeight.semiBold },

  escrowBanner: {
    backgroundColor: Colors.escrowBg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.escrowBorder,
  },
  escrowBannerText: { fontSize: FontSize.xs, color: Colors.blue, textAlign: 'center' },

  statusRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statusPill: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  statusPillText: { fontSize: 11, fontWeight: FontWeight.semiBold },

  msgList: { padding: Spacing.md, gap: Spacing.sm },

  // System message
  systemMsgWrap: { alignItems: 'center', marginVertical: Spacing.xs },
  systemMsg: {
    fontSize: FontSize.xs,
    color: Colors.subtle,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    textAlign: 'center',
  },

  // Bubble
  bubbleWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: Spacing.xs,
    gap: Spacing.xs,
  },
  bubbleWrapMe: { flexDirection: 'row-reverse' },
  avatarSmall: {
    width: 30, height: 30,
    borderRadius: Radius.full,
    backgroundColor: Colors.blueLight,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarSmallText: { fontSize: 16 },
  bubble: {
    maxWidth: '75%',
    borderRadius: Radius.lg,
    padding: Spacing.sm,
    gap: 4,
  },
  bubbleThem: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderCard,
    borderBottomLeftRadius: 4,
  },
  bubbleMe: {
    backgroundColor: Colors.accent,
    borderBottomRightRadius: 4,
  },
  bubbleSender: { fontSize: 11, fontWeight: FontWeight.bold, color: Colors.blue },
  bubbleText: { fontSize: FontSize.sm, color: Colors.textPrimary, lineHeight: 20 },
  bubbleTextMe: { color: Colors.textOnAccent },
  bubbleTime: { fontSize: 10, color: Colors.subtle, alignSelf: 'flex-end' },
  bubbleTimeMe: { color: 'rgba(255,255,255,0.70)' },

  // Special bubbles
  photoBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    padding: Spacing.sm,
  },
  photoBubbleIcon: { fontSize: 24 },
  photoBubbleText: { fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: FontWeight.medium },

  paymentBubble: {
    alignItems: 'center',
    backgroundColor: Colors.accentLight,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
  },
  paymentTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.accent },
  paymentAmount: { fontSize: FontSize.xl, fontWeight: FontWeight.black, color: Colors.accent },
  payNowBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    marginTop: 4,
  },
  payNowText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textOnAccent },

  arrivedBubble: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,201,177,0.10)',
    borderRadius: Radius.md,
    padding: Spacing.sm,
    gap: 2,
    borderWidth: 1,
    borderColor: Colors.escrowBorder,
  },
  arrivedIcon: { fontSize: 28 },
  arrivedText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.blue },
  arrivedSub: { fontSize: FontSize.xs, color: Colors.subtle },

  locationBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    padding: Spacing.sm,
  },
  locationIcon: { fontSize: 20 },
  locationText: { fontSize: FontSize.sm, color: Colors.textPrimary },

  // Action panel
  actionPanel: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    padding: Spacing.md,
  },
  actionPanelTitle: {
    fontSize: FontSize.xs,
    color: Colors.subtle,
    fontWeight: FontWeight.semiBold,
    marginBottom: Spacing.sm,
  },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  actionItem: {
    flex: 1,
    minWidth: '28%',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionItemAccent: {
    backgroundColor: Colors.accentLight,
    borderColor: Colors.accentBorder,
  },
  actionItemBlue: {
    backgroundColor: Colors.blueLight,
    borderColor: Colors.blueBorder,
  },
  actionItemIcon: { fontSize: 24 },
  actionItemLabel: { fontSize: 10, color: Colors.textPrimary, fontWeight: FontWeight.medium, textAlign: 'center' },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.xs,
  },
  actionToggle: {
    width: 38, height: 38,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  actionToggleActive: {
    backgroundColor: Colors.accentLight,
    borderColor: Colors.accent,
  },
  actionToggleText: { fontSize: 20, color: Colors.accent, fontWeight: FontWeight.bold, lineHeight: 24 },
  textInput: {
    flex: 1,
    backgroundColor: Colors.inputFill,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
    maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    shadowColor: Colors.shadowAccent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  sendBtnDisabled: { backgroundColor: Colors.inactive, shadowOpacity: 0 },
  sendBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textOnAccent },
});
