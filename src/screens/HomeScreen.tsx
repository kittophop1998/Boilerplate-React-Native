// ─── Heist — Dashboard (Home Screen) ────────────────────────────────────────
// Greedy Gang design: purple bg, avatar center, stat cards, nemesis list,
// gold JOIN HEIST CTA at bottom
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@theme/index';
import { useGameStore } from '../store/gameStore';
import type { NemesisRecord } from '@game/game';

const SCREEN_WIDTH = Dimensions.get('window').width;

type Props = { navigation: any };

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ value, label }: { value: string | number; label: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ── Nemesis Card ──────────────────────────────────────────────────────────────
function NemesisCard({ nemesis, onRevenge }: { nemesis: NemesisRecord; onRevenge: () => void }) {
  return (
    <View style={styles.nemesisCard}>
      <View style={styles.nemesisAvatarWrap}>
        <Text style={styles.nemesisAvatar}>{nemesis.avatar}</Text>
        {nemesis.isOnline && <View style={styles.onlineDot} />}
      </View>
      <Text style={styles.nemesisId} numberOfLines={1}>{nemesis.playerId.slice(0, 5).toUpperCase()}</Text>
      <TouchableOpacity style={styles.revengeBtn} onPress={onRevenge} activeOpacity={0.82}>
        <Text style={styles.revengeBtnText}>REVENGE</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function HomeScreen({ navigation }: Props) {
  const {
    localPlayerName,
    localAvatar,
    vaultGold,
    nemesisList,
    roles,
    joinHeist,
    findNemesisMatch,
  } = useGameStore();

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
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.headerRow}>
          {/* Hamburger */}
          <TouchableOpacity style={styles.menuBtn} activeOpacity={0.7}>
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
          </TouchableOpacity>

          {/* Title */}
          <Text style={styles.appTitle}>GREEDY GANG</Text>

          {/* Coin badge */}
          <View style={styles.coinBadge}>
            <Text style={styles.coinIcon}>🪙</Text>
            <Text style={styles.coinAmount}>{vaultGold.toLocaleString()}</Text>
          </View>
        </View>

        {/* ── Player Name + Avatar ── */}
        <View style={styles.avatarSection}>
          <Text style={styles.playerName}>{localPlayerName}</Text>
          {/* Big avatar emoji as placeholder for 3D character */}
          <Text style={styles.avatarEmoji}>{localAvatar}</Text>
        </View>

        {/* ── Quick Stats ── */}
        <View style={styles.statsRow}>
          <StatCard value={vaultGold.toLocaleString()} label="VAULT GOLD" />
          <StatCard value={nemesisList.length} label="NEMESES" />
          <StatCard value={roles.filter((r) => r.isOwned).length} label="ROLES" />
        </View>

        {/* ── Nemesis Section ── */}
        <View style={styles.nemesisSection}>
          <Text style={styles.sectionTitle}>NEMESIS LIST</Text>
          <View style={styles.nemesisRow}>
            {nemesisList.length === 0 ? (
              <Text style={styles.emptyText}>No nemeses yet. Go cause trouble! 😈</Text>
            ) : (
              nemesisList.slice(0, 3).map((n) => (
                <NemesisCard
                  key={n.playerId}
                  nemesis={n}
                  onRevenge={() => handleNemesisRevenge(n)}
                />
              ))
            )}
          </View>
        </View>

        {/* ── Join Heist CTA ── */}
        <View style={styles.joinWrap}>
          <TouchableOpacity
            style={styles.joinBtn}
            onPress={handleJoinHeist}
            activeOpacity={0.88}
          >
            <Text style={styles.joinBtnText}>JOIN HEIST</Text>
            <View style={styles.joinIcon}>
              <Text style={styles.joinIconText}>🎯</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.scrollBottom} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.md, paddingTop: Spacing.sm },

  // ── Header ──────────────────────────────────────────────────────────────────
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  menuBtn: { padding: 6, gap: 4, justifyContent: 'center' },
  menuLine: {
    width: 22,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: Colors.textPrimary,
    marginVertical: 2,
  },
  appTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.black as any,
    color: Colors.textPrimary,
    letterSpacing: 2,
    flex: 1,
    textAlign: 'center',
  },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gold,
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 4,
    shadowColor: Colors.shadowYellow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },
  coinIcon: { fontSize: 14 },
  coinAmount: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold as any,
    color: Colors.textOnYellow,
  },

  // ── Avatar ──────────────────────────────────────────────────────────────────
  avatarSection: {
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  playerName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold as any,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  avatarEmoji: {
    fontSize: 110,
    lineHeight: 130,
  },

  // ── Stats ────────────────────────────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: Colors.shadowCard,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  statValue: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.black as any,
    color: Colors.textSecondary,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: FontWeight.semiBold as any,
    color: Colors.textSecondary,
    letterSpacing: 1,
    marginTop: 3,
    opacity: 0.7,
  },

  // ── Nemesis ──────────────────────────────────────────────────────────────────
  nemesisSection: { marginBottom: Spacing.lg },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold as any,
    color: Colors.textPrimary,
    letterSpacing: 1.5,
    marginBottom: Spacing.sm,
  },
  nemesisRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  nemesisCard: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.30)',
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    minWidth: (SCREEN_WIDTH - Spacing.md * 2 - Spacing.sm * 2) / 3,
    flex: 1,
    gap: 8,
  },
  nemesisAvatarWrap: { position: 'relative' },
  nemesisAvatar: { fontSize: 36 },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.shareGreen,
    borderWidth: 1.5,
    borderColor: Colors.background,
  },
  nemesisId: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semiBold as any,
    color: Colors.textPrimary,
    opacity: 0.8,
  },
  revengeBtn: {
    backgroundColor: Colors.revengeOrange,
    borderRadius: Radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 5,
    shadowColor: Colors.revengeOrangeGlow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
  revengeBtnText: {
    fontSize: 10,
    fontWeight: FontWeight.bold as any,
    color: '#fff',
    letterSpacing: 1,
  },
  emptyText: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    opacity: 0.6,
    fontStyle: 'italic',
  },

  // ── Join Heist ───────────────────────────────────────────────────────────────
  joinWrap: { alignItems: 'center', marginBottom: Spacing.md },
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gold,
    borderRadius: Radius.full,
    width: SCREEN_WIDTH - Spacing.md * 2,
    height: 58,
    justifyContent: 'center',
    shadowColor: Colors.shadowYellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
  },
  joinBtnText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.black as any,
    color: Colors.textOnYellow,
    letterSpacing: 2,
    flex: 1,
    textAlign: 'center',
    marginLeft: 44, // offset so text stays visually centered with icon
  },
  joinIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  joinIconText: { fontSize: 18 },

  scrollBottom: { height: 24 },
});
