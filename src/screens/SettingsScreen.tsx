// ─── SettingsScreen — Stamp Duel ──────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@theme/index';
import { loadPlayer, savePlayer, DEFAULT_PLAYER } from '@services/stampService';
import type { PlayerProfile } from '@game/stamp';
import { SkiaBackground, SkiaGlassCard, SkiaGlowButton } from '@components/skia';

const CARD_W = Dimensions.get('window').width - Spacing.md * 2;

const VERSION = '1.0.0 (Stamp Duel)';

type Props = { onLogout?: () => void };

export default function SettingsScreen({ onLogout }: Props) {
  const [player, setPlayer] = useState<PlayerProfile | null>(null);

  useEffect(() => { loadPlayer().then(setPlayer); }, []);

  const handleResetProgress = () => {
    Alert.alert(
      'Reset Progress',
      'This will erase all your collected stamps and stats. Are you sure?',
      [
        { text: 'Cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await savePlayer({ ...DEFAULT_PLAYER });
            setPlayer({ ...DEFAULT_PLAYER });
            Alert.alert('Done', 'Progress reset. Starting fresh!');
          },
        },
      ],
    );
  };

  return (
    <SkiaBackground>
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* ── Header ─────────────────────────────────────────────────────── */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Settings</Text>
            <Text style={styles.headerSub}>Stamp Duel · {VERSION}</Text>
          </View>

          {/* ── Player card ─────────────────────────────────────────────────── */}
          {player && (
            <SkiaGlassCard
              width={CARD_W}
              borderRadius={Radius.lg}
              animateBorder={false}
              style={styles.cardMargin}
            >
              <View style={styles.cardInner}>
                <Text style={styles.cardLabel}>PLAYER</Text>
                <View style={styles.playerRow}>
                  <Text style={styles.avatarEmoji}>{player.avatarEmoji}</Text>
                  <View style={styles.playerInfo}>
                    <Text style={styles.playerName}>{player.username}</Text>
                    <Text style={styles.playerLevel}>Level {player.level}</Text>
                  </View>
                  <View style={styles.playerStats}>
                    <Text style={styles.statLine}>🏆 {player.wins}W / {player.losses}L</Text>
                    <Text style={styles.statLine}>📦 {player.collection.length} stamps</Text>
                  </View>
                </View>
              </View>
            </SkiaGlassCard>
          )}

          {/* ── Resources ───────────────────────────────────────────────────── */}
          {player && (
            <SkiaGlassCard
              width={CARD_W}
              borderRadius={Radius.lg}
              animateBorder={false}
              style={styles.cardMargin}
            >
              <View style={styles.cardInner}>
                <Text style={styles.cardLabel}>RESOURCES</Text>
                <View style={styles.resourceRow}>
                  <ResourcePill icon="⚡" label="Energy" value={`${player.energy}/${player.maxEnergy}`} />
                  <ResourcePill icon="🪙" label="Coins" value={String(player.coins)} />
                  <ResourcePill icon="💎" label="Gems" value={String(player.gems)} />
                </View>
              </View>
            </SkiaGlassCard>
          )}

          {/* ── About ───────────────────────────────────────────────────────── */}
          <SkiaGlassCard
            width={CARD_W}
            borderRadius={Radius.lg}
            animateBorder={false}
            style={styles.cardMargin}
          >
            <View style={styles.cardInner}>
              <Text style={styles.cardLabel}>ABOUT</Text>
              <SettingRow icon="🎨" label="Game" value="Stamp Duel v1.0" />
              <SettingRow icon="⚖️" label="Monetization" value="Cosmetics only" />
              <SettingRow icon="🔒" label="Privacy" value="Local storage only" />
              <SettingRow icon="📮" label="Contact" value="support@stampduel.com" />
            </View>
          </SkiaGlassCard>

          {/* ── Danger zone ─────────────────────────────────────────────────── */}
          <View style={styles.dangerWrap}>
            <SkiaGlowButton
              label="🗑️  Reset All Progress"
              onPress={handleResetProgress}
              color={Colors.lose}
              glowColor={Colors.bloodRedGlow}
              width={CARD_W}
              height={48}
              fontSize={FontSize.sm}
            />
          </View>

          {/* ── Logout ──────────────────────────────────────────────────────── */}
          {onLogout && (
            <View style={styles.logoutWrap}>
              <SkiaGlowButton
                label="Sign Out"
                onPress={onLogout}
                color={Colors.primary}
                glowColor="rgba(247,247,247,0.18)"
                width={CARD_W}
                height={52}
              />
            </View>
          )}

        </ScrollView>
      </SafeAreaView>
    </SkiaBackground>
  );
}

function ResourcePill({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={resPillStyles.pill}>
      <Text style={resPillStyles.icon}>{icon}</Text>
      <Text style={resPillStyles.value}>{value}</Text>
      <Text style={resPillStyles.label}>{label}</Text>
    </View>
  );
}
const resPillStyles = StyleSheet.create({
  pill: { flex: 1, alignItems: 'center', paddingVertical: Spacing.xs },
  icon: { fontSize: 20, marginBottom: 2 },
  value: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  label: { fontSize: FontSize.xs, color: Colors.textSecondary },
});

function SettingRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={settingRowStyles.row}>
      <Text style={settingRowStyles.icon}>{icon}</Text>
      <Text style={settingRowStyles.label}>{label}</Text>
      <Text style={settingRowStyles.value}>{value}</Text>
    </View>
  );
}
const settingRowStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  icon: { fontSize: 16, marginRight: Spacing.sm },
  label: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary },
  value: { fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: FontWeight.medium },
});

const styles = StyleSheet.create({
  root:        { flex: 1, backgroundColor: 'transparent' },
  scroll:      { padding: Spacing.md, paddingBottom: Spacing.xl },
  header:      { marginBottom: Spacing.lg },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  headerSub:   { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },

  cardMargin: { marginBottom: Spacing.md },
  cardInner:  { flex: 1, padding: Spacing.md },
  cardLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
    fontWeight: FontWeight.semiBold,
  },

  playerRow:   { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  avatarEmoji: { fontSize: 36 },
  playerInfo:  { flex: 1 },
  playerName:  { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  playerLevel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  playerStats: { alignItems: 'flex-end' },
  statLine:    { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: 2 },

  resourceRow: { flexDirection: 'row' },

  dangerWrap: { marginBottom: Spacing.sm },
  logoutWrap: { marginTop: Spacing.xs },
});
