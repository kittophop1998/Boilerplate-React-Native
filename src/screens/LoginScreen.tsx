// ─── Core Defense — Login Screen ─────────────────────────────────────────────
// Dark Neon style login
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@theme/index';

const MOCK_TOKEN = 'mock-core-defense-token';

type Props = { onLogin: (token: string) => void };

export default function LoginScreen({ onLogin }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Required', 'Please enter your username and password.');
      return;
    }
    setLoading(true);
    await new Promise<void>((r) => setTimeout(r, 700));
    setLoading(false);
    onLogin(MOCK_TOKEN);
  };

  const handleGuest = async () => {
    setLoading(true);
    await new Promise<void>((r) => setTimeout(r, 400));
    setLoading(false);
    onLogin(MOCK_TOKEN);
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* ── Brand ─────────────────────────────────────────────────────── */}
        <View style={styles.brandSection}>
          <View style={styles.logoBox}>
            <Text style={styles.logoEmoji}>💰</Text>
          </View>
          <Text style={styles.brandTitle}>The Golden Heist</Text>
          <Text style={styles.brandTitleSub}>No Honor Among Thieves</Text>
          <Text style={styles.brandSubtitle}>มหกรรมปล้นทอง: โจรไร้สัจจะ</Text>
          {/* <Text style={styles.brandDesc}></Text> */}
        </View>

        {/* ── Form ──────────────────────────────────────────────────────── */}
        <View style={styles.form}>
          <Text style={styles.fieldLabel}>USERNAME</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter username"
            placeholderTextColor={Colors.textSecondary}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />

          <Text style={[styles.fieldLabel, { marginTop: Spacing.md }]}>PASSWORD</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter password"
            placeholderTextColor={Colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}>
            {loading ? (
              <ActivityIndicator color={Colors.background} />
            ) : (
              <Text style={styles.loginBtnText}>⚡ ENTER THE TOWER</Text>
            )}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity
            style={styles.guestBtn}
            onPress={handleGuest}
            disabled={loading}
            activeOpacity={0.8}>
            <Text style={styles.guestBtnText}>👤 Play as Guest</Text>
          </TouchableOpacity>
        </View>

        {/* ── Warning ───────────────────────────────────────────────────── */}
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            ⚠️ Daily Sacrifice: One random player may be selected each day. The community decides your fate.
          </Text>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
  },

  // Brand
  brandSection: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  logoBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: Colors.neonGreen,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginBottom: Spacing.md,
    shadowColor: Colors.neonGreen,
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 8,
  },
  logoEmoji: { fontSize: 48 },
  brandTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.black,
    color: Colors.neonGreen,
    letterSpacing: 3,
    marginBottom: 2,
  },
  brandTitleSub: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    color: Colors.gold,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  brandSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  brandDesc: {
    fontSize: FontSize.xs,
    color: Colors.bloodRed,
    letterSpacing: 1,
    fontWeight: FontWeight.bold,
  },

  // Form
  form: { marginBottom: Spacing.lg },
  fieldLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
    letterSpacing: 2,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    color: Colors.textPrimary,
    fontSize: FontSize.md,
  },
  loginBtn: {
    backgroundColor: Colors.neonGreen,
    borderRadius: Radius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: Spacing.lg,
    shadowColor: Colors.neonGreen,
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  loginBtnDisabled: { backgroundColor: Colors.inactive, shadowOpacity: 0 },
  loginBtnText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.black,
    color: Colors.background,
    letterSpacing: 2,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.md,
    gap: Spacing.sm,
  },
  divider: { flex: 1, height: 1, backgroundColor: Colors.divider },
  dividerText: { color: Colors.textSecondary, fontSize: FontSize.xs },
  guestBtn: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    paddingVertical: 14,
    alignItems: 'center',
  },
  guestBtnText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.bold,
  },

  // Warning
  warningBox: {
    borderWidth: 1,
    borderColor: Colors.cyberGold,
    borderRadius: Radius.md,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
  },
  warningText: {
    color: Colors.cyberGold,
    fontSize: FontSize.xs,
    textAlign: 'center',
    lineHeight: 18,
  },
});
