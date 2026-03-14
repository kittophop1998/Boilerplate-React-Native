// ─── Heist — Black Market Shop ────────────────────────────────────────────────
// In-Match items (newspaper aesthetic) + Global Black Market (carousel)
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
  FlatList, Modal, ScrollView, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@theme/index';
import { useGameStore } from '../store/gameStore';
import type { GlobalShopItem, InMatchShopItem } from '@game/game';
import { SkiaBackground, SkiaBadge, SkiaGlowButton } from '@components/skia';

const { width: W } = Dimensions.get('window');
const CAROUSEL_CARD_W = W * 0.52;

type GlobalTab = 'cosmetics' | 'roles' | 'boosters';
const GLOBAL_TABS: { key: GlobalTab; label: string }[] = [
  { key: 'cosmetics', label: '✨ Cosmetics' },
  { key: 'roles', label: '🃏 Roles' },
  { key: 'boosters', label: '⚡ Boosters' },
];

// ── In-Match Item Card ─────────────────────────────────────────────────────────
function InMatchCard({ item, canAfford, onBuy }: {
  item: InMatchShopItem;
  canAfford: boolean;
  onBuy: () => void;
}) {
  return (
    <View style={styles.inmatchCard}>
      <Text style={styles.inmatchIcon}>{item.icon}</Text>
      <View style={styles.inmatchInfo}>
        <Text style={styles.inmatchName}>{item.name}</Text>
        <Text style={styles.inmatchDesc} numberOfLines={2}>{item.description}</Text>
      </View>
      <SkiaGlowButton
        label={`💵 ${item.cost}`}
        onPress={onBuy}
        disabled={!canAfford}
        color={canAfford ? Colors.gold : Colors.inactive}
        glowColor={canAfford ? Colors.goldGlow : 'transparent'}
        width={72}
        height={40}
        fontSize={12}
      />
    </View>
  );
}

// ── Global Shop Carousel Card ──────────────────────────────────────────────────
function GlobalCard({ item, canAfford, onPress }: {
  item: GlobalShopItem;
  canAfford: boolean;
  onPress: () => void;
}) {
  const isSoldOut = item.isOwned;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      disabled={isSoldOut}
      style={[styles.globalCard, isSoldOut && styles.globalCardSoldOut]}
    >
      {/* Top badge row */}
      <View style={styles.globalBadgeRow}>
        {item.isLimited && !isSoldOut ? (
          <SkiaBadge label="LIMITED" color={Colors.stealRed} textColor="#fff" fontSize={8} paddingH={6} paddingV={3} animated />
        ) : <View />}
        {item.isBestValue && (
          <SkiaBadge label="BEST VALUE" color={Colors.gold} textColor={Colors.background} fontSize={8} paddingH={6} paddingV={3} animated={false} />
        )}
      </View>

      {/* Icon */}
      <Text style={styles.globalIcon}>{item.icon}</Text>

      {/* Name + description */}
      <Text style={styles.globalName} numberOfLines={2}>{item.name}</Text>
      <Text style={styles.globalDesc} numberOfLines={3}>{item.description}</Text>

      {/* Spacer */}
      <View style={styles.globalSpacer} />

      {/* Price pill */}
      <View style={styles.globalPriceRow}>
        <SkiaBadge
          label={`🏦 ${item.priceGold.toLocaleString()}`}
          color={canAfford ? Colors.gold : Colors.stealRed}
          textColor={canAfford ? Colors.background : '#fff'}
          fontSize={FontSize.sm}
          paddingH={12}
          paddingV={6}
          animated={canAfford && !isSoldOut}
        />
      </View>

      {/* Sold out overlay */}
      {isSoldOut && (
        <View style={styles.soldOutOverlay}>
          <Text style={styles.soldOutText}>SOLD OUT</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ── Confirm Modal ──────────────────────────────────────────────────────────────
function ConfirmModal({ item, vaultGold, onConfirm, onClose }: {
  item: GlobalShopItem | null;
  vaultGold: number;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!item) return null;
  const canAfford = vaultGold >= item.priceGold;
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.box}>
          <Text style={modalStyles.icon}>{item.icon}</Text>
          <Text style={modalStyles.name}>{item.name}</Text>
          <Text style={modalStyles.desc}>{item.description}</Text>
          <View style={modalStyles.divider} />
          <View style={modalStyles.priceRow}>
            <Text style={modalStyles.priceLabel}>Price</Text>
            <Text style={modalStyles.priceValue}>🏦 {item.priceGold.toLocaleString()}</Text>
          </View>
          <View style={modalStyles.priceRow}>
            <Text style={modalStyles.priceLabel}>Your Gold</Text>
            <Text style={[modalStyles.priceValue, !canAfford && modalStyles.priceValueRed]}>
              🏦 {vaultGold.toLocaleString()}
            </Text>
          </View>
          <View style={modalStyles.btnRow}>
            <TouchableOpacity style={modalStyles.cancelBtn} onPress={onClose}>
              <Text style={modalStyles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            {canAfford ? (
              <TouchableOpacity style={modalStyles.confirmBtn} onPress={onConfirm}>
                <Text style={modalStyles.confirmText}>BUY NOW</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={modalStyles.getGoldBtn} onPress={onClose}>
                <Text style={modalStyles.getGoldText}>GET GOLD</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function ShopScreen() {
  const {
    globalShopItems, inMatchItems, vaultGold, matchMoney,
    purchaseGlobalItem, purchaseInMatchItem,
  } = useGameStore();

  const [globalTab, setGlobalTab] = useState<GlobalTab>('cosmetics');
  const [selectedItem, setSelectedItem] = useState<GlobalShopItem | null>(null);

  const filteredGlobal = globalShopItems.filter((i) => i.category === globalTab);

  function handleConfirmGlobal() {
    if (selectedItem) {
      purchaseGlobalItem(selectedItem.id);
      setSelectedItem(null);
    }
  }

  return (
    <SkiaBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <ScrollView showsVerticalScrollIndicator={false}>

          {/* ── Header ─────────────────────────────────────────────── */}
          <View style={styles.pageHeader}>
            <Text style={styles.pageTitle}>🏴‍☠️ BLACK MARKET</Text>
            <View style={styles.walletRow}>
              <SkiaBadge
                label={`🏦 ${vaultGold.toLocaleString()}`}
                color={Colors.gold}
                textColor={Colors.background}
                fontSize={FontSize.xs}
                paddingH={10}
                paddingV={4}
                borderRadius={Radius.sm}
              />
              <SkiaBadge
                label={`💵 ${matchMoney.toLocaleString()}`}
                color={Colors.textSecondary}
                textColor="#fff"
                fontSize={FontSize.xs}
                paddingH={10}
                paddingV={4}
                borderRadius={Radius.sm}
                animated={false}
              />
            </View>
          </View>

        {/* ── In-Match Section ────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>⚡ IN-MATCH ARSENAL</Text>
            <Text style={styles.sectionSub}>Available during The Heist</Text>
          </View>
          {/* Newspaper-style list */}
          <View style={styles.inmatchList}>
            {inMatchItems.map((item) => (
              <InMatchCard
                key={item.id}
                item={item}
                canAfford={matchMoney >= item.cost}
                onBuy={() => purchaseInMatchItem(item.id)}
              />
            ))}
          </View>
        </View>

        {/* ── Global Black Market Section ─────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🏴‍☠️ GLOBAL BLACK MARKET</Text>
            <Text style={styles.sectionSub}>Permanent upgrades for real gangsters</Text>
          </View>

          {/* Category tabs */}
          <View style={styles.tabRow}>
            {GLOBAL_TABS.map((t) => (
              <TouchableOpacity
                key={t.key}
                style={[styles.tab, globalTab === t.key && styles.tabActive]}
                onPress={() => setGlobalTab(t.key)}
              >
                <Text style={[styles.tabText, globalTab === t.key && styles.tabTextActive]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Horizontal carousel */}
          <FlatList
            data={filteredGlobal}
            keyExtractor={(i) => i.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carousel}
            renderItem={({ item }) => (
              <GlobalCard
                item={item}
                canAfford={vaultGold >= item.priceGold}
                onPress={() => setSelectedItem(item)}
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyCarousel}>
                <Text style={styles.emptyText}>Nothing here yet…</Text>
              </View>
            }
          />
        </View>

        <View style={styles.bottomPad} />
        </ScrollView>

        {/* Confirm modal */}
        <ConfirmModal
          item={selectedItem}
          vaultGold={vaultGold}
          onConfirm={handleConfirmGlobal}
          onClose={() => setSelectedItem(null)}
        />
      </SafeAreaView>
    </SkiaBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  bottomPad: { height: 40 },

  // Header
  pageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingTop: Spacing.md, marginBottom: Spacing.sm },
  pageTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold as any, color: Colors.textPrimary },
  walletRow: { flexDirection: 'row', gap: 8 },
  walletChip: { backgroundColor: Colors.cardBg, borderRadius: Radius.sm, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: Colors.gold },
  walletChipSilver: { borderColor: Colors.textSecondary },
  walletText: { fontSize: FontSize.xs, color: Colors.gold, fontWeight: FontWeight.bold as any },
  walletTextSilver: { color: Colors.textSecondary },

  // Section
  section: { marginTop: Spacing.lg },
  sectionHeader: { paddingHorizontal: Spacing.md, marginBottom: Spacing.sm },
  sectionTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.bold as any, color: Colors.textPrimary, letterSpacing: 1 },
  sectionSub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },

  // In-Match list (newspaper)
  inmatchList: { marginHorizontal: Spacing.md, backgroundColor: Colors.surface, borderRadius: Radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: Colors.divider },
  inmatchCard: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  inmatchIcon: { fontSize: 36, width: 52, textAlign: 'center' },
  inmatchInfo: { flex: 1, paddingHorizontal: Spacing.sm },
  inmatchName: { fontSize: FontSize.sm, fontWeight: FontWeight.bold as any, color: Colors.textPrimary },
  inmatchDesc: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  inmatchEffect: { fontSize: FontSize.xs, color: Colors.gold, marginTop: 2 },
  inmatchBuyBtn: { alignItems: 'center', backgroundColor: Colors.gold, borderRadius: Radius.sm, paddingHorizontal: 10, paddingVertical: 6, minWidth: 60 },
  inmatchBuyBtnDisabled: { backgroundColor: Colors.inactive, opacity: 0.5 },
  inmatchBuyPrice: { fontSize: 10, color: Colors.background, fontWeight: FontWeight.bold as any },
  inmatchBuyLabel: { fontSize: 11, color: Colors.background, fontWeight: FontWeight.black as any },

  // Global tabs
  tabRow: { flexDirection: 'row', paddingHorizontal: Spacing.md, gap: 8, marginBottom: Spacing.sm },
  tab: { borderRadius: Radius.md, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: Colors.cardBg, borderWidth: 1, borderColor: Colors.divider },
  tabActive: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  tabText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.semiBold as any },
  tabTextActive: { color: Colors.background },

  // Carousel
  carousel: { paddingLeft: Spacing.md, paddingRight: Spacing.sm },
  globalCard: {
    width: CAROUSEL_CARD_W,
    marginRight: Spacing.sm,
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    overflow: 'hidden',
    minHeight: 220,
  },
  globalCardSoldOut: { opacity: 0.45 },
  globalBadgeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  globalSpacer: { flex: 1 },
  soldOutOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', zIndex: 1 },
  soldOutText: { fontSize: FontSize.md, color: Colors.stealRed, fontWeight: FontWeight.bold as any, letterSpacing: 2 },
  globalIcon: { fontSize: 48, marginBottom: 8 },
  globalName: { fontSize: FontSize.sm, fontWeight: FontWeight.bold as any, color: Colors.textPrimary, marginBottom: 4 },
  globalDesc: { fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 16, marginBottom: 8, minHeight: 32 },
  globalPriceRow: { alignItems: 'flex-start', marginTop: 8 },
  globalPriceRowRed: { backgroundColor: 'rgba(255,77,77,0.12)' },
  globalPriceText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold as any, color: Colors.gold },
  globalPriceTextRed: { color: Colors.stealRed },
  emptyCarousel: { padding: Spacing.xl, alignItems: 'center' },
  emptyText: { color: Colors.textDisabled, fontSize: FontSize.sm },
});

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center' },
  box: { width: W * 0.82, backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.lg, alignItems: 'center', borderWidth: 1, borderColor: Colors.divider },
  icon: { fontSize: 56, marginBottom: 8 },
  name: { fontSize: FontSize.lg, fontWeight: FontWeight.bold as any, color: Colors.textPrimary, textAlign: 'center' },
  desc: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', marginTop: 6, lineHeight: 20 },
  divider: { height: 1, backgroundColor: Colors.divider, width: '100%', marginVertical: Spacing.md },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 6 },
  priceLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  priceValue: { fontSize: FontSize.sm, fontWeight: FontWeight.bold as any, color: Colors.gold },
  priceValueRed: { color: Colors.stealRed },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: Spacing.md, width: '100%' },
  cancelBtn: { flex: 1, backgroundColor: Colors.cardBg, borderRadius: Radius.md, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: Colors.divider },
  cancelText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.semiBold as any },
  confirmBtn: { flex: 1.4, backgroundColor: Colors.gold, borderRadius: Radius.md, padding: 14, alignItems: 'center' },
  confirmText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold as any, color: Colors.background },
  getGoldBtn: { flex: 1.4, backgroundColor: Colors.stealRed, borderRadius: Radius.md, padding: 14, alignItems: 'center' },
  getGoldText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold as any, color: '#fff' },
});
