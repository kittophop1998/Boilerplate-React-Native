// ─── BottomTab — Stamp Duel Custom Tab Bar ───────────────────────────────────
// Floating pill tab bar with emoji icons, Modern Minimalist style
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { Colors, Spacing, Radius, FontWeight } from '@theme/index';

const TAB_ICONS: Record<string, { icon: string; label: string }> = {
  Home:     { icon: '🎨', label: 'Gallery' },
  Gacha:    { icon: '🎴', label: 'Explore' },
  Duel:     { icon: '⚔️', label: 'Duel' },
  Trade:    { icon: '🤝', label: 'Trade' },
  Shop:     { icon: '🛍️', label: 'Shop' },
  Settings: { icon: '⚙️', label: 'Settings' },
};

export default function CustomBottomTabBar({ state, _descriptors, navigation }: any) {
  // Only show tabs for top-level routes
  const visibleRoutes = state.routes.filter(
    (r: any) => Object.keys(TAB_ICONS).includes(r.name),
  );

  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        {visibleRoutes.map((route: any) => {
          const isFocused = state.routes[state.index]?.name === route.name;
          const { icon, label } = TAB_ICONS[route.name] ?? { icon: '●', label: route.name };

          const onPress = () => navigation.navigate(route.name);

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityLabel={label}
              accessibilityState={{ selected: isFocused }}
              activeOpacity={0.8}
              onPress={onPress}
              style={styles.tabWrapper}
            >
              <View style={[styles.tab, isFocused && styles.tabActive]}>
                <Text style={[styles.tabIcon, isFocused && styles.tabIconActive]}>{icon}</Text>
                <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>{label}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    left: Spacing.md,
    right: Spacing.md,
    bottom: Spacing.md,
    zIndex: 10,
  },
  container: {
    flexDirection: 'row',
    height: 64,
    borderRadius: Radius.xl,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.xs,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
    }),
    borderWidth: 1,
    borderColor: Colors.borderCard,
  },
  tabWrapper: { flex: 1 },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: Radius.lg,
    marginHorizontal: 2,
  },
  tabActive: { backgroundColor: Colors.primary },
  tabIcon: { fontSize: 18, marginBottom: 2 },
  tabIconActive: {},
  tabLabel: { fontSize: 9, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  tabLabelActive: { color: Colors.textOnDark, fontWeight: FontWeight.semiBold },
});
