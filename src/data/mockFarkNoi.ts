// ─── ฝากหน่อย (Fark-Noi) — Mock Data ────────────────────────────────────────
import type {
  FarkNoiUser,
  ScoutAnnouncement,
  OrderRequest,
  GroupOrder,
  MeetingPoint,
  TrustBadge,
} from '../types/farkNoi';

// ── Trust Badges ──────────────────────────────────────────────────────────────
export const TRUST_BADGES: Record<string, TrustBadge> = {
  on_time: {
    type: 'on_time',
    label: 'สายเป๊ะ',
    emoji: '⏱️',
    description: 'ส่งตรงเวลาทุกครั้ง ไม่เคยให้รอ',
  },
  pro_carrier: {
    type: 'pro_carrier',
    label: 'นักหิ้วมือโปร',
    emoji: '🛍️',
    description: 'ผ่านออเดอร์มากกว่า 50 ครั้ง',
  },
  photo_verified: {
    type: 'photo_verified',
    label: 'ยืนยันรูปทุกครั้ง',
    emoji: '📸',
    description: 'ส่งรูปใบเสร็จให้ทุกออเดอร์',
  },
  safe_keeper: {
    type: 'safe_keeper',
    label: 'ของครบไม่หาย',
    emoji: '✅',
    description: 'Completion rate 100%',
  },
  group_hero: {
    type: 'group_hero',
    label: 'Group Hero',
    emoji: '🦸',
    description: 'หิ้วกลุ่มมากกว่า 20 ครั้ง',
  },
};

// ── Mock Users ────────────────────────────────────────────────────────────────
export const MOCK_USERS: FarkNoiUser[] = [
  {
    id: 'u1',
    name: 'มิน',
    avatar: '🐱',
    dorm: 'หอ A ตึก 3 ชั้น 5',
    trustScore: 4.9,
    totalOrders: 87,
    completionRate: 99,
    badges: [
      TRUST_BADGES.on_time,
      TRUST_BADGES.pro_carrier,
      TRUST_BADGES.photo_verified,
    ],
    isVerified: true,
    rating: 4.9,
    joinedAt: '2025-09-01',
  },
  {
    id: 'u2',
    name: 'ปลา',
    avatar: '🐠',
    dorm: 'หอ B ตึก 1 ชั้น 2',
    trustScore: 4.7,
    totalOrders: 53,
    completionRate: 97,
    badges: [TRUST_BADGES.pro_carrier, TRUST_BADGES.safe_keeper],
    isVerified: true,
    rating: 4.7,
    joinedAt: '2025-10-15',
  },
  {
    id: 'u3',
    name: 'แพร',
    avatar: '🐰',
    dorm: 'หอ C ตึก 2 ชั้น 7',
    trustScore: 4.5,
    totalOrders: 31,
    completionRate: 96,
    badges: [TRUST_BADGES.on_time, TRUST_BADGES.group_hero],
    isVerified: false,
    rating: 4.5,
    joinedAt: '2025-11-20',
  },
  {
    id: 'u4',
    name: 'ต้น',
    avatar: '🌵',
    dorm: 'หอ A ตึก 1 ชั้น 3',
    trustScore: 4.2,
    totalOrders: 12,
    completionRate: 92,
    badges: [TRUST_BADGES.photo_verified],
    isVerified: false,
    rating: 4.2,
    joinedAt: '2026-01-10',
  },
  {
    id: 'me',
    name: 'คุณ',
    avatar: '😊',
    dorm: 'หอ B ตึก 2 ชั้น 4',
    trustScore: 3.8,
    totalOrders: 5,
    completionRate: 100,
    badges: [],
    isVerified: false,
    rating: 3.8,
    joinedAt: '2026-03-01',
  },
];

// ── Mock Meeting Points ────────────────────────────────────────────────────────
export const MOCK_MEETING_POINTS: MeetingPoint[] = [
  {
    id: 'mp1',
    label: 'ใต้หอ A ล็อบบี้',
    description: 'บริเวณหน้าลิฟต์ชั้น 1 ตึก A มีกล้องวงจรปิด',
    location: { lat: 13.9942, lng: 100.5374, label: 'ใต้หอ A' },
    isVerifiedSafe: true,
    emoji: '🏠',
  },
  {
    id: 'mp2',
    label: 'หน้า 7-Eleven ปากซอย',
    description: 'ตรงหน้าร้านสะดวกซื้อ มีแสงสว่าง คนพลุกพล่าน',
    location: { lat: 13.9938, lng: 100.5381, label: '7-Eleven ปากซอย' },
    isVerifiedSafe: true,
    emoji: '🏪',
  },
  {
    id: 'mp3',
    label: 'ลานกิจกรรมคณะ',
    description: 'ลานหน้าตึกอเนกประสงค์ เปิด 24 ชม.',
    location: { lat: 13.9955, lng: 100.5360, label: 'ลานกิจกรรม' },
    isVerifiedSafe: true,
    emoji: '🌳',
  },
];

// ── Mock Scout Announcements ──────────────────────────────────────────────────
export const MOCK_SCOUTS: ScoutAnnouncement[] = [
  {
    id: 'sc1',
    scout: MOCK_USERS[0],
    destination: 'ฟิวเจอร์รังสิต',
    destinationLocation: {
      lat: 14.0092,
      lng: 100.5414,
      label: 'ฟิวเจอร์รังสิต ชั้น 2',
    },
    departAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    maxItems: 3,
    maxWeightKg: 2,
    acceptsHeavy: false,
    currentItemCount: 1,
    estimatedReturn: new Date(Date.now() + 90 * 60 * 1000).toISOString(),
    status: 'heading_out',
    currentLocation: {
      lat: 13.9942,
      lng: 100.5374,
      label: 'ออกจากหอแล้ว กำลังเดินไปหน้าซอย',
    },
    joinedRequests: ['req1'],
    isGroupOrder: true,
    groupOrderId: 'go1',
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: 'sc2',
    scout: MOCK_USERS[1],
    destination: '7-Eleven',
    destinationLocation: {
      lat: 13.9938,
      lng: 100.5381,
      label: '7-Eleven หน้าหอ B',
    },
    departAt: new Date(Date.now() + 2 * 60 * 1000).toISOString(),
    maxItems: 5,
    acceptsHeavy: true,
    currentItemCount: 2,
    estimatedReturn: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    status: 'heading_out',
    joinedRequests: ['req2', 'req3'],
    isGroupOrder: true,
    groupOrderId: 'go2',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: 'sc3',
    scout: MOCK_USERS[2],
    destination: 'ตลาดเจพี',
    destinationLocation: {
      lat: 14.0011,
      lng: 100.5389,
      label: 'ตลาดเจพี ทางเข้าหลัก',
    },
    departAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    maxItems: 4,
    acceptsHeavy: true,
    currentItemCount: 0,
    estimatedReturn: new Date(Date.now() + 75 * 60 * 1000).toISOString(),
    status: 'heading_out',
    joinedRequests: [],
    isGroupOrder: false,
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
];

// ── Mock Order Requests ────────────────────────────────────────────────────────
export const MOCK_REQUESTS: OrderRequest[] = [
  {
    id: 'req1',
    sender: MOCK_USERS[4], // me
    scout: MOCK_USERS[0],
    announcementId: 'sc1',
    destination: 'ฟิวเจอร์รังสิต',
    destinationLocation: MOCK_SCOUTS[0].destinationLocation,
    items: [
      {
        id: 'item1',
        name: 'ชานมไข่มุก',
        description: 'หวานน้อย ไม่ใส่น้ำแข็ง Size L',
        quantity: 1,
        estimatedPrice: 65,
      },
    ],
    totalEstimatedCost: 65,
    feeBreakdown: {
      baseFee: 10,
      itemFee: 5,
      weightFee: 0,
      bonusTip: 5,
      totalFee: 20,
    },
    totalPayable: 85,
    status: 'matched',
    meetingPoint: MOCK_MEETING_POINTS[0],
    isGroupOrder: true,
    groupOrderId: 'go1',
    escrowHeld: true,
    notes: 'ถ้าของหมด เอาชาเขียวแทนได้เลยนะคะ',
    expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
  },
  {
    id: 'req2',
    sender: MOCK_USERS[3],
    scout: MOCK_USERS[1],
    announcementId: 'sc2',
    destination: '7-Eleven',
    destinationLocation: MOCK_SCOUTS[1].destinationLocation,
    items: [
      {
        id: 'item2',
        name: 'น้ำเปล่า 1.5L',
        description: 'ยี่ห้อไหนก็ได้',
        quantity: 2,
        estimatedPrice: 20,
      },
      {
        id: 'item3',
        name: 'ขนมปังไส้ครีม',
        description: '',
        quantity: 1,
        estimatedPrice: 25,
      },
    ],
    totalEstimatedCost: 65,
    feeBreakdown: {
      baseFee: 10,
      itemFee: 15,
      weightFee: 5,
      bonusTip: 0,
      totalFee: 30,
    },
    totalPayable: 95,
    status: 'shopping',
    meetingPoint: MOCK_MEETING_POINTS[1],
    isGroupOrder: true,
    groupOrderId: 'go2',
    escrowHeld: true,
    expiresAt: new Date(Date.now() + 90 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
  },
  {
    id: 'req3',
    sender: MOCK_USERS[4], // me — pending
    destination: 'ตลาดเจพี',
    destinationLocation: MOCK_SCOUTS[2].destinationLocation,
    items: [
      {
        id: 'item4',
        name: 'ข้าวมันไก่',
        description: 'ขอน่องชิ้นใหญ่ ราดน้ำซุปเพิ่มด้วย',
        quantity: 1,
        estimatedPrice: 55,
      },
    ],
    totalEstimatedCost: 55,
    feeBreakdown: {
      baseFee: 10,
      itemFee: 5,
      weightFee: 0,
      bonusTip: 15,
      totalFee: 30,
    },
    totalPayable: 85,
    status: 'pending',
    isGroupOrder: false,
    escrowHeld: false,
    expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
];

// ── Mock Group Orders ──────────────────────────────────────────────────────────
export const MOCK_GROUP_ORDERS: GroupOrder[] = [
  {
    id: 'go1',
    announcementId: 'sc1',
    scout: MOCK_USERS[0],
    destination: 'ฟิวเจอร์รังสิต',
    requests: [MOCK_REQUESTS[0]],
    maxParticipants: 3,
    currentParticipants: 1,
    isOpen: true,
    totalFeePool: 20,
    status: 'open',
    createdAt: MOCK_SCOUTS[0].createdAt,
  },
  {
    id: 'go2',
    announcementId: 'sc2',
    scout: MOCK_USERS[1],
    destination: '7-Eleven',
    requests: [MOCK_REQUESTS[1]],
    maxParticipants: 5,
    currentParticipants: 2,
    isOpen: true,
    totalFeePool: 55,
    status: 'shopping',
    createdAt: MOCK_SCOUTS[1].createdAt,
  },
];

// ── Helper: format relative time ───────────────────────────────────────────────
export function formatRelativeTime(isoDate: string): string {
  const diff = Math.floor((new Date(isoDate).getTime() - Date.now()) / 1000 / 60);
  if (diff <= 0) return 'ไปแล้ว!';
  if (diff < 60) return `อีก ${diff} นาที`;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return `อีก ${h} ชม. ${m > 0 ? m + ' นาที' : ''}`;
}

// ── Helper: fee calculator ─────────────────────────────────────────────────────
export function calculateFee(itemCount: number, totalWeightKg: number, bonusTip: number): {
  baseFee: number; itemFee: number; weightFee: number; bonusTip: number; totalFee: number;
} {
  const baseFee = 10;
  const itemFee = Math.min(itemCount * 5, 25); // max 25 บาทต่อรอบ
  const weightFee = totalWeightKg > 1 ? Math.ceil((totalWeightKg - 1) * 5) : 0;
  const totalFee = baseFee + itemFee + weightFee + bonusTip;
  return { baseFee, itemFee, weightFee, bonusTip, totalFee };
}
