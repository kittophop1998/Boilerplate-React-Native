// ─── Heist — Dashboard (Home Screen) ────────────────────────────────────────
// Avatar center, Global Vault top-right, Join Heist gold button, Nemesis bar
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@theme/index';
import { useGameStore } from '../store/gameStore';
import type { NemesisRecord } from '@game/game';
import {
  SkiaGlowButton,
  SkiaGlassCard,
  SkiaBadge,
  SkiaAvatarRing,
} from '@components/skia';

const CARD_FULL_WIDTH = Dimensions.get('window').width - Spacing.md * 2;

type Props = { navigation: any };

// ── Nemesis Card ──────────────────────────────────────────────────────────────
function NemesisCard({ nemesis, onRevenge }: { nemesis: NemesisRecord; onRevenge: () => void }) {
  return (
    <TouchableOpacity style={styles.nemesisCard} onPress={onRevenge} activeOpacity={0.85}>
      <View style={styles.nemesisAvatarWrap}>
        <Text style={styles.nemesisAvatar}>{nemesis.avatar}</Text>
        {nemesis.isOnline && <View style={styles.onlineDot} />}
      </View>
      <View style={styles.nemesisInfo}>
        <Text style={styles.nemesisName}>{nemesis.playerName}</Text>
        <Text style={styles.nemesisCount}>Stole from you {nemesis.stolenCount}x 🗡️</Text>
      </View>
      <View style={styles.revengeBtn}>
        <Text style={styles.revengeBtnText}>Revenge</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }: Props) {
  const {
    localPlayerName, localAvatar, vaultGold, matchMoney,
    topNemesis, nemesisList, equippedRoleId, roles,
    joinHeist, findNemesisMatch,
  } = useGameStore();

  const equippedRole = roles.find((r) => r.id === equippedRoleId);

  const handleJoinHeist = () => {
    joinHeist();
    navigation.navigate('Lobby');
  };

  const handleNemesisRevenge = (nemesis: NemesisRecord) => {
    findNemesisMatch(nemesis.playerId);
    navigation.navigate('Lobby');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* ── Header Row ── */}
          <View style={styles.headerRow}>
            <Text style={styles.appTitle}>THE HEIST</Text>
            {/* Vault Gold badge — Skia glass card */}
            <SkiaGlassCard width={130} height={38} borderRadius={Radius.md} animateBorder={false}>
              <View style={styles.vaultInner}>
                <Text style={styles.vaultIcon}>🏦</Text>
                <Text style={styles.vaultAmount}>{vaultGold.toLocaleString()}</Text>
                <Text style={styles.vaultLabel}> GOLD</Text>
              </View>
            </SkiaGlassCard>
          </View>

          {/* ── Avatar Center ── */}
          <View style={styles.avatarSection}>
            <SkiaAvatarRing size={130} glowColor={Colors.goldGlow} pulseGlow>
              <Text style={styles.avatarEmoji}>{localAvatar}</Text>
            </SkiaAvatarRing>
            <Text style={styles.playerName}>{localPlayerName}</Text>
            {equippedRole && (
              <SkiaBadge
                label={`${equippedRole.icon}  ${equippedRole.name}`}
                color={Colors.gold}
                textColor={Colors.background}
                paddingH={12}
                paddingV={5}
                borderRadius={Radius.sm}
              />
            )}
            {matchMoney > 0 && (
              <SkiaBadge
                label={`💵 ${matchMoney} Match Money`}
                color={Colors.shareGreen}
                textColor="#fff"
                paddingH={12}
                paddingV={5}
                borderRadius={Radius.sm}
                animated={false}
              />
            )}
          </View>

          {/* ── Quick Stats ── */}
          <View style={styles.statsRow}>
            <SkiaGlassCard width={100} height={64} borderRadius={Radius.md} style={styles.statGlass}>
              <View style={styles.statContent}>
                <Text style={styles.statValue}>{vaultGold.toLocaleString()}</Text>
                <Text style={styles.statLabel}>VAULT GOLD</Text>
              </View>
            </SkiaGlassCard>
            <SkiaGlassCard width={100} height={64} borderRadius={Radius.md} style={styles.statGlass}>
              <View style={styles.statContent}>
                <Text style={styles.statValue}>{nemesisList.length}</Text>
                <Text style={styles.statLabel}>NEMESES</Text>
              </View>
            </SkiaGlassCard>
            <SkiaGlassCard width={100} height={64} borderRadius={Radius.md} style={styles.statGlass}>
              <View style={styles.statContent}>
                <Text style={styles.statValue}>{roles.filter((r) => r.isOwned).length}</Text>
                <Text style={styles.statLabel}>ROLES</Text>
              </View>
            </SkiaGlassCard>
          </View>

          {/* ── Join Heist Button ── */}
          <View style={styles.joinWrap}>
            <SkiaGlowButton
              label="JOIN HEIST"
              icon="🎯"
              onPress={handleJoinHeist}
              color={Colors.gold}
              glowColor={Colors.goldGlow}
              width={320}
              height={60}
            />
          </View>

          {/* ── Nemesis Section ── */}
          {nemesisList.length > 0 && (
            <View style={styles.nemesisSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>⚔️  NEMESIS LIST</Text>
                {topNemesis?.isOnline && (
                  <SkiaBadge label="ONLINE NOW" color={Colors.shareGreen} textColor="#fff" fontSize={9} paddingH={8} paddingV={3} />
                )}
              </View>
              {topNemesis && (
                <SkiaGlassCard
                  width={CARD_FULL_WIDTH}
                  height={64}
                  borderRadius={Radius.md}
                  glowColor={Colors.challengeOrangeGlow}
                  style={styles.topNemesisCard}
                  fillColor={Colors.challengeOrangeBg}
                  borderColor={Colors.challengeOrange}
                  animateBorder={false}
                >
                  <View style={styles.topNemesisInner}>
                    <Text style={styles.topNemesisText}>
                      ⚠️  {topNemesis.playerName} is online right now. Settle the score?
                    </Text>
                    <SkiaGlowButton
                      label="⚡ Challenge Now"
                      onPress={() => handleNemesisRevenge(topNemesis)}
                      color={Colors.challengeOrange}
                      glowColor={Colors.challengeOrangeGlow}
                      width={160}
                      height={36}
                      fontSize={FontSize.sm}
                    />
                  </View>
                </SkiaGlassCard>
              )}
              {nemesisList.slice(0, 3).map((n) => (
                <NemesisCard key={n.playerId} nemesis={n} onRevenge={() => handleNemesisRevenge(n)} />
              ))}
            </View>
          )}

          <View style={styles.scrollBottom} />
        </ScrollView>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  scroll: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md },

  // Header
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  appTitle: { fontSize: 22, fontWeight: FontWeight.bold as any, color: Colors.gold, letterSpacing: 3 },
  vaultInner: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  vaultIcon: { fontSize: 16, marginRight: 4 },
  vaultAmount: { fontSize: 14, fontWeight: FontWeight.bold as any, color: Colors.gold },
  vaultLabel: { fontSize: 9, color: Colors.softGold, marginTop: 2 },

  // Avatar
  avatarSection: { alignItems: 'center', marginVertical: Spacing.xl, gap: 10 },
  avatarEmoji: { fontSize: 56 },
  playerName: { fontSize: FontSize.xl, fontWeight: FontWeight.bold as any, color: Colors.textPrimary },

  // Stats
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xl },
  statGlass: {},
  statContent: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: FontSize.lg, fontWeight: FontWeight.bold as any, color: Colors.gold },
  statLabel: { fontSize: 9, color: Colors.softGold, letterSpacing: 1.2, marginTop: 2 },

  // Join Heist
  joinWrap: { alignItems: 'center', marginBottom: Spacing.xl },

  // Nemesis
  nemesisSection: { marginBottom: Spacing.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  sectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold as any, color: Colors.softGold, flex: 1 },
  topNemesisCard: { marginBottom: Spacing.sm, alignSelf: 'stretch' },
  topNemesisInner: { flex: 1, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: 8 },
  topNemesisText: { flex: 1, fontSize: FontSize.sm, color: Colors.softGold },
  nemesisCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.cardGlass, borderRadius: Radius.md, padding: Spacing.sm, marginBottom: 8, borderWidth: 1, borderColor: Colors.lavenderBorder },
  nemesisAvatarWrap: { position: 'relative', marginRight: Spacing.sm },
  nemesisAvatar: { fontSize: 32 },
  onlineDot: { position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.shareGreen, borderWidth: 1.5, borderColor: Colors.tabBarBg },
  nemesisInfo: { flex: 1 },
  nemesisName: { fontSize: FontSize.md, fontWeight: FontWeight.bold as any, color: Colors.textPrimary },
  nemesisCount: { fontSize: FontSize.xs, color: Colors.softGold, marginTop: 2 },
  revengeBtn: { backgroundColor: Colors.challengeOrangeBg, borderRadius: Radius.sm, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: Colors.challengeOrange },
  revengeBtnText: { fontSize: FontSize.xs, color: Colors.challengeOrange, fontWeight: FontWeight.bold as any },
  scrollBottom: { height: 24 },
});
