// ─── ฝากหน่อย (Fark-Noi) — Domain Types ──────────────────────────────────────
// Peer-to-Peer Errand App: "คนฝาก (Sender)" ↔ "คนหิ้ว (Scout)"
// ─────────────────────────────────────────────────────────────────────────────

// ── Trust Badge Types ─────────────────────────────────────────────────────────
export type TrustBadgeType =
  | 'on_time'        // สายเป๊ะ — ส่งตรงเวลาเสมอ
  | 'pro_carrier'    // นักหิ้วมือโปร — ครบ 50+ ออเดอร์
  | 'photo_verified' // ยืนยันรูป — ส่งหลักฐานทุกครั้ง
  | 'safe_keeper'    // ของครบ ไม่สูญหาย — 100% completion
  | 'group_hero'     // Group Order Champion
  | 'newbie';        // New User

export interface TrustBadge {
  type: TrustBadgeType;
  label: string;       // e.g. "สายเป๊ะ ⏱️"
  emoji: string;
  description: string;
}

// ── User / Profile ─────────────────────────────────────────────────────────────
export interface FarkNoiUser {
  id: string;
  name: string;
  avatar: string;        // URL or emoji
  dorm: string;          // e.g. "หอ A มธ. รังสิต"
  trustScore: number;    // 0–5.0
  totalOrders: number;
  completionRate: number; // 0–100 %
  badges: TrustBadge[];
  isVerified: boolean;
  rating: number;        // 0–5.0
  joinedAt: string;      // ISO date
}

// ── Location ──────────────────────────────────────────────────────────────────
export interface Location {
  lat: number;
  lng: number;
  label: string;         // e.g. "7-Eleven หน้าหอ"
  placeId?: string;
}

// ── Popular Destinations ──────────────────────────────────────────────────────
export type PopularDestination =
  | '7-Eleven'
  | 'Family Mart'
  | 'ฟิวเจอร์รังสิต'
  | 'ตลาดเจพี'
  | 'Lotus Go'
  | 'โรงอาหารกลาง'
  | 'ร้านกาแฟหน้าหอ'
  | 'มินิมาร์ท'
  | string;

// ── Scout Status ──────────────────────────────────────────────────────────────
export type ScoutStatus =
  | 'heading_out'    // กำลังออกเดิน
  | 'at_destination' // ถึงที่หมายแล้ว
  | 'returning'      // กำลังกลับ
  | 'completed'      // กลับแล้ว
  | 'cancelled';     // ยกเลิก

// ── Scout Announcement (คนหิ้วประกาศ) ─────────────────────────────────────────
export interface ScoutAnnouncement {
  id: string;
  scout: FarkNoiUser;
  destination: PopularDestination;
  destinationLocation: Location;
  departAt: string;      // ISO datetime — "กำลังไป" / scheduled
  maxItems: number;       // รับฝากได้กี่ชิ้น
  maxWeightKg?: number;   // รับของหนักไหม (optional)
  acceptsHeavy: boolean;
  currentItemCount: number; // จำนวนที่รับฝากแล้ว
  estimatedReturn: string;  // ISO datetime
  status: ScoutStatus;
  currentLocation?: Location; // Real-time location share
  joinedRequests: string[];   // Request IDs ที่รับแล้ว
  isGroupOrder: boolean;
  groupOrderId?: string;
  createdAt: string;
}

// ── Order Request Status ───────────────────────────────────────────────────────
export type OrderStatus =
  | 'pending'       // รอคนรับ
  | 'matched'       // มีคนรับแล้ว
  | 'shopping'      // คนหิ้วกำลังซื้อ
  | 'photo_pending' // รอรูปยืนยัน
  | 'payment_pending' // รอโอนเงิน
  | 'on_the_way'    // กำลังเดินกลับ
  | 'at_meetpoint'  // ถึงจุดนัดแล้ว
  | 'completed'     // สำเร็จ
  | 'cancelled'     // ยกเลิก
  | 'disputed';     // มีปัญหา

// ── Order Item ────────────────────────────────────────────────────────────────
export interface OrderItem {
  id: string;
  name: string;           // e.g. "ชานมไข่มุก"
  description?: string;   // e.g. "หวานน้อย ไม่ใส่น้ำแข็ง"
  quantity: number;
  estimatedPrice: number; // ราคาโดยประมาณ (บาท)
  imageUrl?: string;      // รูปที่อยากได้
}

// ── Safe Meeting Point ────────────────────────────────────────────────────────
export interface MeetingPoint {
  id: string;
  label: string;    // e.g. "ใต้หอ A ตึกหน้า"
  description: string;
  location: Location;
  isVerifiedSafe: boolean;
  emoji: string;
}

// ── Fee Calculation ───────────────────────────────────────────────────────────
export interface FeeBreakdown {
  baseFee: number;        // ค่าเหนื่อยพื้นฐาน (บาท) — 10 บาท
  itemFee: number;        // ค่าต่อชิ้น (ชิ้นละ 3-5 บาท)
  weightFee: number;      // ค่าของหนัก (ถ้ามี)
  bonusTip: number;       // ค่าขนมที่ Sender เสนอเพิ่ม
  totalFee: number;       // รวมทั้งหมด
}

// ── Order Request (คนฝากสั่ง) ────────────────────────────────────────────────
export interface OrderRequest {
  id: string;
  sender: FarkNoiUser;
  scout?: FarkNoiUser;    // ถ้ายัง pending จะไม่มี
  announcementId?: string;
  destination: PopularDestination;
  destinationLocation: Location;
  items: OrderItem[];
  totalEstimatedCost: number;   // ราคาของทั้งหมด
  feeBreakdown: FeeBreakdown;
  totalPayable: number;         // ราคาของ + ค่าหิ้ว
  status: OrderStatus;
  meetingPoint?: MeetingPoint;
  isGroupOrder: boolean;
  groupOrderId?: string;
  escrowHeld: boolean;          // เงินอยู่ในระบบ escrow หรือยัง
  paymentSlipUrl?: string;      // สลิปโอนเงิน
  receiptPhotoUrl?: string;     // รูปใบเสร็จจาก scout
  productPhotoUrl?: string;     // รูปสินค้า
  notes?: string;               // หมายเหตุ
  expiresAt: string;            // ออเดอร์หมดอายุ
  createdAt: string;
  updatedAt: string;
}

// ── Group Order ───────────────────────────────────────────────────────────────
export interface GroupOrder {
  id: string;
  announcementId: string;
  scout: FarkNoiUser;
  destination: PopularDestination;
  requests: OrderRequest[];
  maxParticipants: number;
  currentParticipants: number;
  isOpen: boolean;
  totalFeePool: number;  // ค่าขนมรวม
  status: 'open' | 'closed' | 'shopping' | 'completed';
  createdAt: string;
}

// ── Chat Message ──────────────────────────────────────────────────────────────
export type ChatMessageType =
  | 'text'
  | 'receipt_photo'    // รูปใบเสร็จ
  | 'product_photo'    // รูปสินค้า
  | 'payment_request'  // ขอเก็บเงิน (ยอด + QR)
  | 'location_share'   // แชร์ตำแหน่ง
  | 'arrived_meetpoint'// ถึงจุดนัดแล้ว
  | 'payment_slip'     // สลิปโอนเงิน
  | 'system';          // ข้อความระบบ

export interface FarkNoiChatMessage {
  id: string;
  orderId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  type: ChatMessageType;
  text?: string;
  imageUrl?: string;
  amount?: number;       // สำหรับ payment_request
  location?: Location;   // สำหรับ location_share
  isRead: boolean;
  createdAt: string;
}

// ── Notification ──────────────────────────────────────────────────────────────
export type FarkNoiNotificationType =
  | 'order_matched'       // มีคนรับฝากแล้ว!
  | 'scout_at_destination'// คนหิ้วถึงที่หมายแล้ว
  | 'receipt_received'    // ได้รับรูปใบเสร็จ
  | 'payment_requested'   // ขอเก็บเงิน
  | 'at_meetpoint'        // ถึงจุดนัดรับแล้ว!
  | 'order_completed'     // ออเดอร์สำเร็จ
  | 'group_order_joined'; // มีคนเข้าร่วม Group Order

// ── Screen Params (Navigation) ────────────────────────────────────────────────
export type FarkNoiStackParams = {
  Home: undefined;
  ScoutAnnounce: undefined;
  PostRequest: { announcementId?: string };
  OrderDetail: { orderId: string };
  Chat: { orderId: string; otherUserId: string; otherUserName: string };
  Profile: { userId?: string };
  Settings: undefined;
  GroupOrder: { groupOrderId: string };
};
