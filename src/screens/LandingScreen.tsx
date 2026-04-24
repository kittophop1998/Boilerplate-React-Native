// ─── ฝากหน่อย — Onboarding Screen ────────────────────────────────────────────
// 3-Card Swipe: บอกสิ่งที่แอปทำได้ → CTA "เริ่มใช้งานเลย" → MainApp (Bottom Tabs)
// ─────────────────────────────────────────────────────────────────────────────
import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  FlatList,
  Dimensions,
  ViewToken,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@theme/index';

const { width: SW } = Dimensions.get('window');

type Props = { navigation: any };

interface OnboardCard {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  accentColor: string;
  bgColor: string;
}

const CARDS: OnboardCard[] = [
  {
    id: '1',
    emoji: '\uD83D\uDECD\uFE0F',
    title: 'ฝากเพื่อนซื้อของง่ายๆ',
    subtitle: 'แค่บอกของที่อยากได้\nเพื่อนบ้านที่กำลังจะไปจะหิ้วให้คุณเลย',
    accentColor: Colors.accent,
    bgColor: '#FFF5F5',
  },
  {
    id: '2',
    emoji: '\uD83D\uDCB8',
    title: 'หารค่าส่ง ประหยัดเวลา',
    subtitle: 'แบ่งค่าขนมกันนิดหน่อย\nไม่ต้องออกไปซื้อเองให้เสียเวลา',
    accentColor: Colors.blue,
    bgColor: '#F0FDFB',
  },
  {
    id: '3',
    emoji: '\uD83C\uDFE0',
    title: 'ปลอดภัยในชุมชนเดียวกัน',
    subtitle: 'ยืนยันตัวตนด้วยเบอร์โทร/Line\nเพื่อนบ้านจริงๆ ในหอพักเดียวกัน ไว้ใจได้',
    accentColor: Colors.gold,
    bgColor: '#FFFBF0',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
export default function LandingScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatRef = useRef<FlatList<OnboardCard>>(null);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
    [],
  );
  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const goNext = () => {
    if (currentIndex < CARDS.length - 1) {
      flatRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    }
  };

  const goToApp = () => navigation.navigate('Home');
  const isLastCard = currentIndex === CARDS.length - 1;

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Brand header */}
      <View style={styles.brandRow}>
        <Text style={styles.logoEmoji}>{'\uD83D\uDECD\uFE0F'}</Text>
        <View>
          <Text style={styles.brandName}>ฝากหน่อย</Text>
          <Text style={styles.brandEn}>Fark-Noi · รังสิต</Text>
        </View>
      </View>

      {/* Swipeable Cards */}
      <FlatList
        ref={flatRef}
        data={CARDS}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: item.bgColor }]}>
            <View style={[styles.emojiCircle, { backgroundColor: item.accentColor + '22' }]}>
              <Text style={styles.cardEmoji}>{item.emoji}</Text>
            </View>
            <Text style={[styles.cardTitle, { color: item.accentColor }]}>{item.title}</Text>
            <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
          </View>
        )}
        style={styles.flatList}
      />

      {/* Dot indicators */}
      <View style={styles.dots}>
        {CARDS.map((card, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === currentIndex && styles.dotActive,
              i === currentIndex && { backgroundColor: card.accentColor },
            ]}
          />
        ))}
      </View>

      {/* Bottom CTA */}
      <View style={styles.bottomArea}>
        {isLastCard ? (
          <TouchableOpacity style={styles.ctaBtn} activeOpacity={0.85} onPress={goToApp}>
            <Text style={styles.ctaText}>{'\uD83D\uDE80'}{'  '}เริ่มใช้งานเลย!</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.navRow}>
            <TouchableOpacity style={styles.skipBtn} onPress={goToApp} activeOpacity={0.7}>
              <Text style={styles.skipText}>ข้ามไปก่อน</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.nextBtn} onPress={goNext} activeOpacity={0.85}>
              <Text style={styles.nextText}>ถัดไป  →</Text>
            </TouchableOpacity>
          </View>
        )}
        <Text style={styles.disclaimer}>
          {'\uD83D\uDD12'} ลงทะเบียนด้วยเบอร์โทร/Line ครั้งเดียว เพื่อยืนยันตัวตนในหอพัก
        </Text>
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  logoEmoji: { fontSize: 32 },
  brandName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.black,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  brandEn: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.accent,
    letterSpacing: 1.5,
    marginTop: 1,
  },

  flatList: { flexGrow: 0 },
  card: {
    width: SW,
    paddingHorizontal: Spacing.xl + Spacing.md,
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
    minHeight: 340,
  },
  emojiCircle: {
    width: 130,
    height: 130,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  cardEmoji: { fontSize: 68 },
  cardTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.black,
    textAlign: 'center',
    letterSpacing: -0.3,
    lineHeight: 30,
  },
  cardSubtitle: {
    fontSize: FontSize.md,
    color: Colors.subtle,
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: FontWeight.medium,
  },

  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.inactive,
  },
  dotActive: { width: 26, height: 8, borderRadius: Radius.full },

  bottomArea: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    gap: Spacing.md,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skipBtn: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.xs },
  skipText: { fontSize: FontSize.sm, color: Colors.subtle, fontWeight: FontWeight.medium },
  nextBtn: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  nextText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },

  ctaBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.xl,
    paddingVertical: Spacing.md + 4,
    alignItems: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  ctaText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.black,
    color: '#fff',
    letterSpacing: 0.3,
  },

  disclaimer: {
    fontSize: FontSize.xs,
    color: Colors.subtle,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: Spacing.md,
  },
});
