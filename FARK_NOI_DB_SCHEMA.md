# ฝากหน่อย (Fark-Noi) — Database Schema Design

## Overview
ระบบ Peer-to-Peer Errand App เชื่อมต่อ **คนหิ้ว (Scout)** ↔ **คนฝาก (Sender)**

---

## Tables

### 1. `users`
เก็บโปรไฟล์ผู้ใช้ทุกคน

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, default gen_random_uuid() | User ID |
| `name` | VARCHAR(100) | NOT NULL | ชื่อแสดง |
| `avatar_url` | TEXT | | รูปโปรไฟล์ |
| `avatar_emoji` | VARCHAR(8) | | อีโมจิแทนตัว |
| `phone` | VARCHAR(20) | UNIQUE | เบอร์โทร (ยืนยัน OTP) |
| `dorm_name` | VARCHAR(200) | | ชื่อหอ/ที่อยู่ |
| `lat` | DECIMAL(10,8) | | ละติจูดหอพัก |
| `lng` | DECIMAL(11,8) | | ลองจิจูดหอพัก |
| `trust_score` | DECIMAL(3,2) | DEFAULT 5.0 | คะแนนความน่าเชื่อถือ |
| `total_orders_as_scout` | INT | DEFAULT 0 | จำนวนออเดอร์ที่หิ้วสำเร็จ |
| `total_orders_as_sender` | INT | DEFAULT 0 | จำนวนออเดอร์ที่ฝากสำเร็จ |
| `completion_rate` | DECIMAL(5,2) | DEFAULT 100.0 | % ออเดอร์สำเร็จ |
| `is_verified` | BOOLEAN | DEFAULT FALSE | ยืนยันตัวตนแล้ว |
| `fcm_token` | TEXT | | Firebase Cloud Messaging token |
| `is_active` | BOOLEAN | DEFAULT TRUE | บัญชียังใช้งานอยู่ |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | |

---

### 2. `trust_badges`
เก็บ Badge ที่ผู้ใช้ได้รับ

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | |
| `user_id` | UUID | FK → users.id | |
| `badge_type` | ENUM | NOT NULL | 'on_time', 'pro_carrier', 'photo_verified', 'safe_keeper', 'group_hero', 'newbie' |
| `earned_at` | TIMESTAMPTZ | DEFAULT NOW() | วันที่ได้รับ |

**Index:** `user_id`

---

### 3. `scout_announcements`
ประกาศของคนหิ้ว "ฉันกำลังจะไป..."

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | |
| `scout_id` | UUID | FK → users.id | คนหิ้ว |
| `destination_name` | VARCHAR(200) | NOT NULL | ชื่อร้าน/สถานที่ |
| `destination_lat` | DECIMAL(10,8) | NOT NULL | |
| `destination_lng` | DECIMAL(11,8) | NOT NULL | |
| `max_items` | SMALLINT | DEFAULT 3 | รับฝากได้สูงสุด |
| `current_item_count` | SMALLINT | DEFAULT 0 | รับฝากแล้วกี่ชิ้น |
| `accepts_heavy` | BOOLEAN | DEFAULT FALSE | รับของหนักได้ไหม |
| `max_weight_kg` | DECIMAL(4,2) | | น้ำหนักสูงสุดที่รับ |
| `depart_at` | TIMESTAMPTZ | NOT NULL | เวลาออกเดิน |
| `estimated_return_at` | TIMESTAMPTZ | | เวลากลับประมาณ |
| `status` | ENUM | NOT NULL | 'heading_out', 'at_destination', 'returning', 'completed', 'cancelled' |
| `current_lat` | DECIMAL(10,8) | | ตำแหน่งปัจจุบัน (real-time) |
| `current_lng` | DECIMAL(11,8) | | |
| `location_updated_at` | TIMESTAMPTZ | | เวลาอัปเดตตำแหน่งล่าสุด |
| `is_group_order` | BOOLEAN | DEFAULT FALSE | เปิดรับหลายคน |
| `expires_at` | TIMESTAMPTZ | NOT NULL | หมดอายุประกาศ |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | |

**Index:** `scout_id`, `status`, `destination_lat+destination_lng` (geospatial)

---

### 4. `order_requests`
ออเดอร์ที่คนฝากลงประกาศ

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | |
| `sender_id` | UUID | FK → users.id | คนฝาก |
| `scout_id` | UUID | FK → users.id, NULLABLE | คนหิ้ว (ว่างถ้ายังไม่มีคนรับ) |
| `announcement_id` | UUID | FK → scout_announcements.id, NULLABLE | เชื่อมกับประกาศ |
| `group_order_id` | UUID | FK → group_orders.id, NULLABLE | เชื่อมกับ Group Order |
| `destination_name` | VARCHAR(200) | NOT NULL | |
| `destination_lat` | DECIMAL(10,8) | NOT NULL | |
| `destination_lng` | DECIMAL(11,8) | NOT NULL | |
| `total_estimated_cost` | DECIMAL(10,2) | NOT NULL | ราคาของโดยประมาณ |
| `base_fee` | DECIMAL(8,2) | DEFAULT 10 | ค่าเหนื่อยพื้นฐาน |
| `item_fee` | DECIMAL(8,2) | DEFAULT 0 | ค่าต่อชิ้น |
| `weight_fee` | DECIMAL(8,2) | DEFAULT 0 | ค่าของหนัก |
| `bonus_tip` | DECIMAL(8,2) | DEFAULT 0 | ค่าขนมพิเศษ |
| `total_fee` | DECIMAL(8,2) | GENERATED (base+item+weight+bonus) | รวมค่าหิ้ว |
| `total_payable` | DECIMAL(10,2) | NOT NULL | ราคาของ + ค่าหิ้วรวม |
| `status` | ENUM | NOT NULL | ดูด้านล่าง |
| `escrow_held` | BOOLEAN | DEFAULT FALSE | เงินอยู่ใน Escrow แล้ว |
| `escrow_transaction_id` | VARCHAR(100) | | อ้างอิง Escrow TX |
| `meeting_point_id` | UUID | FK → meeting_points.id, NULLABLE | จุดนัดรับ |
| `payment_slip_url` | TEXT | | URL สลิปโอนเงิน |
| `receipt_photo_url` | TEXT | | URL รูปใบเสร็จ |
| `product_photo_url` | TEXT | | URL รูปสินค้า |
| `notes` | TEXT | | หมายเหตุจากคนฝาก |
| `expires_at` | TIMESTAMPTZ | NOT NULL | |
| `matched_at` | TIMESTAMPTZ | | เวลาที่มีคนรับ |
| `completed_at` | TIMESTAMPTZ | | เวลาสำเร็จ |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | |

**Order Status ENUM:**
```
pending | matched | shopping | photo_pending | payment_pending 
| on_the_way | at_meetpoint | completed | cancelled | disputed
```

**Index:** `sender_id`, `scout_id`, `status`, `announcement_id`, `created_at DESC`

---

### 5. `order_items`
รายการของที่ต้องการในแต่ละออเดอร์

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | |
| `order_id` | UUID | FK → order_requests.id, CASCADE | |
| `name` | VARCHAR(200) | NOT NULL | ชื่อสินค้า |
| `description` | TEXT | | รายละเอียดเพิ่มเติม |
| `quantity` | SMALLINT | DEFAULT 1 | จำนวน |
| `estimated_price` | DECIMAL(8,2) | | ราคาโดยประมาณต่อชิ้น |
| `actual_price` | DECIMAL(8,2) | | ราคาจริงที่จ่าย (กรอกโดย scout) |
| `image_url` | TEXT | | รูปสินค้าที่อยากได้ |

**Index:** `order_id`

---

### 6. `group_orders`
Group Order — คนหลายคนฝากพร้อมกัน 1 รอบ

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | |
| `announcement_id` | UUID | FK → scout_announcements.id | |
| `scout_id` | UUID | FK → users.id | คนหิ้ว |
| `destination_name` | VARCHAR(200) | NOT NULL | |
| `max_participants` | SMALLINT | DEFAULT 5 | รับคนได้สูงสุด |
| `current_participants` | SMALLINT | DEFAULT 0 | คนที่ join แล้ว |
| `is_open` | BOOLEAN | DEFAULT TRUE | ยังรับเพิ่มอยู่ |
| `total_fee_pool` | DECIMAL(10,2) | DEFAULT 0 | ค่าขนมรวม |
| `status` | ENUM | NOT NULL | 'open', 'closed', 'shopping', 'completed' |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | |

---

### 7. `meeting_points`
จุดนัดรับของที่ปลอดภัย

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | |
| `label` | VARCHAR(200) | NOT NULL | เช่น "ใต้หอ A ล็อบบี้" |
| `description` | TEXT | | รายละเอียด |
| `lat` | DECIMAL(10,8) | NOT NULL | |
| `lng` | DECIMAL(11,8) | NOT NULL | |
| `emoji` | VARCHAR(8) | | |
| `is_verified_safe` | BOOLEAN | DEFAULT FALSE | ยืนยันความปลอดภัย |
| `building_id` | UUID | FK → buildings.id, NULLABLE | สังกัดอาคาร |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | |

---

### 8. `chat_messages`
ข้อความในแชทของแต่ละออเดอร์

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | |
| `order_id` | UUID | FK → order_requests.id, CASCADE | |
| `sender_id` | UUID | FK → users.id | |
| `type` | ENUM | NOT NULL | 'text', 'receipt_photo', 'product_photo', 'payment_request', 'location_share', 'arrived_meetpoint', 'payment_slip', 'system' |
| `text` | TEXT | | ข้อความ |
| `image_url` | TEXT | | URL รูปภาพ |
| `amount` | DECIMAL(10,2) | | จำนวนเงิน (payment_request) |
| `location_lat` | DECIMAL(10,8) | | ตำแหน่งแชร์ |
| `location_lng` | DECIMAL(11,8) | | |
| `is_read` | BOOLEAN | DEFAULT FALSE | |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | |

**Index:** `order_id`, `created_at ASC`, `sender_id`

---

### 9. `ratings`
การให้คะแนนหลังออเดอร์สำเร็จ

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | |
| `order_id` | UUID | FK → order_requests.id | |
| `rater_id` | UUID | FK → users.id | คนให้คะแนน |
| `rated_id` | UUID | FK → users.id | คนรับคะแนน |
| `role` | ENUM | NOT NULL | 'scout_rates_sender', 'sender_rates_scout' |
| `score` | SMALLINT | CHECK (1-5) | 1-5 ดาว |
| `comment` | TEXT | | ความคิดเห็น |
| `is_on_time` | BOOLEAN | | ส่งตรงเวลาไหม |
| `is_correct_items` | BOOLEAN | | ของถูกต้องไหม |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | |

**UNIQUE:** `(order_id, rater_id)` — ให้คะแนนได้ครั้งเดียวต่อออเดอร์

---

### 10. `notifications`
Log การแจ้งเตือน (FCM)

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | |
| `user_id` | UUID | FK → users.id | ผู้รับการแจ้งเตือน |
| `type` | ENUM | NOT NULL | 'order_matched', 'scout_at_destination', 'receipt_received', 'payment_requested', 'at_meetpoint', 'order_completed', 'group_order_joined' |
| `order_id` | UUID | FK → order_requests.id, NULLABLE | |
| `title` | VARCHAR(200) | | หัวข้อ |
| `body` | TEXT | | เนื้อหา |
| `is_read` | BOOLEAN | DEFAULT FALSE | |
| `fcm_sent` | BOOLEAN | DEFAULT FALSE | ส่ง FCM แล้วหรือยัง |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | |

---

## Relationships Diagram

```
users ──────────────┬── scout_announcements (scout_id)
                    ├── order_requests (sender_id)
                    ├── order_requests (scout_id)
                    ├── trust_badges (user_id)
                    ├── ratings (rater_id / rated_id)
                    └── notifications (user_id)

scout_announcements ─── group_orders (announcement_id)
                    └── order_requests (announcement_id)

order_requests ─────┬── order_items (order_id)
                    ├── chat_messages (order_id)
                    ├── ratings (order_id)
                    └── meeting_points (meeting_point_id)

group_orders ───────── order_requests (group_order_id)
```

---

## Key Matching Logic (Lat/Long)

```sql
-- หา Scout ที่กำลังจะไปใกล้กับ destination ที่ Sender ต้องการ
-- ใช้ Haversine formula (~6371 km radius of Earth)

SELECT sa.*, u.name, u.trust_score,
  (6371 * ACOS(
    COS(RADIANS(:sender_dest_lat)) * COS(RADIANS(sa.destination_lat)) *
    COS(RADIANS(sa.destination_lng) - RADIANS(:sender_dest_lng)) +
    SIN(RADIANS(:sender_dest_lat)) * SIN(RADIANS(sa.destination_lat))
  )) AS distance_km
FROM scout_announcements sa
JOIN users u ON u.id = sa.scout_id
WHERE sa.status = 'heading_out'
  AND sa.current_item_count < sa.max_items
  AND sa.expires_at > NOW()
  AND (6371 * ACOS(
    COS(RADIANS(:sender_dest_lat)) * COS(RADIANS(sa.destination_lat)) *
    COS(RADIANS(sa.destination_lng) - RADIANS(:sender_dest_lng)) +
    SIN(RADIANS(:sender_dest_lat)) * SIN(RADIANS(sa.destination_lat))
  )) < 0.5  -- ภายใน 500 เมตร
ORDER BY distance_km ASC, u.trust_score DESC
LIMIT 20;
```

---

## Realtime Subscriptions (Supabase)

| Channel | Event | Description |
|---|---|---|
| `order:{orderId}` | UPDATE | สถานะออเดอร์เปลี่ยน |
| `chat:{orderId}` | INSERT | ข้อความใหม่ในแชท |
| `scout:{announcementId}` | UPDATE | ตำแหน่ง Scout อัปเดต |
| `group:{groupOrderId}` | UPDATE | มีคน Join Group Order |

---

## Trust Score Calculation

```
trust_score = (
  avg_rating * 0.40 +           -- ค่าเฉลี่ยดาวจากคนอื่น (max 5)
  (completion_rate / 100) * 5 * 0.30 + -- % สำเร็จ
  min(total_orders / 100, 1) * 5 * 0.20 + -- ประสบการณ์
  (is_verified ? 1 : 0) * 5 * 0.10   -- ยืนยันตัวตน
) → clamped to [0, 5]
```

---

## Fee Calculation

```
base_fee = 10 บาท
item_fee = min(quantity * 5, 25) บาท
weight_fee = max(0, (weight_kg - 1) * 5) บาท  (ถ้าเกิน 1 กก.)
bonus_tip = คนฝากเลือกเอง (0, 5, 10, 15, 20 บาท)

total_fee = base_fee + item_fee + weight_fee + bonus_tip
total_payable = estimated_item_cost + total_fee
```

---

## Tech Stack Recommendations

| Layer | Technology | Reason |
|---|---|---|
| **Backend** | Supabase (PostgreSQL) | Realtime, Auth, Storage, Edge Functions ฟรี |
| **Realtime** | Supabase Realtime | WebSocket channels สำหรับแชทและสถานะ |
| **Auth** | Supabase Auth + OTP SMS | ยืนยันเบอร์มือถือ |
| **Notifications** | Firebase Cloud Messaging | Push notification ทันที |
| **Storage** | Supabase Storage | รูปใบเสร็จ, รูปสินค้า, สลิป |
| **Location** | expo-location | GPS ฟรี ไม่ต้องใช้ Maps API ตลอด |
| **Maps** | react-native-maps | แสดงแผนที่เมื่อจำเป็น |
| **Payment (Phase 1)** | โอนตรง + สลิปในแชท | ง่ายสุด MVP |
| **Payment (Phase 2)** | PromptPay API / Omise | Wallet + Escrow จริง |
