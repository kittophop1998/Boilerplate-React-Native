// ─── The Heist — Main Navigation ─────────────────────────────────────────────
// Bottom tab navigator (4 tabs) + stack screens per tab
// Properly handles Android navigation bar (button & gesture modes)
// ─────────────────────────────────────────────────────────────────────────────
import React, { useCallback } from 'react';
import { StyleSheet, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import HomeScreen from '@screens/HomeScreen';
import LobbyScreen from '@screens/LobbyScreen';
import GameScreen from '@screens/GameScreen';
import RevealScreen from '@screens/RevealScreen';
import RoleLibraryScreen from '@screens/RoleLibraryScreen';
import ShopScreen from '@screens/ShopScreen';
import TransferScreen from '@screens/TransferScreen';
import SettingsScreen from '@screens/SettingsScreen';

// Theme
import { Colors, FontSize, FontWeight } from '@theme/index';

// Background
import SkiaBackground from '@components/skia/SkiaBackground';

// ─────────────────────────────────────────────────────────────────────────────
type Props = { onLogout: () => void };

const Tab = createBottomTabNavigator();
const HeistStack = createNativeStackNavigator();
const RoleStack = createNativeStackNavigator();
const ShopStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

// ── Tab icon helper (defined OUTSIDE render to avoid recreation) ───────────────
const makeTabIcon = (emoji: string) =>
  ({ focused }: { focused: boolean }) => (
    <Text style={[tabStyles.icon, focused && tabStyles.iconFocused]}>{emoji}</Text>
  );
const HeistIcon  = makeTabIcon('🎯');
const RoleIcon   = makeTabIcon('🃏');
const ShopIcon   = makeTabIcon('🏴‍☠️');
const ProfileIcon = makeTabIcon('👤');

// ── Heist Stack: Home → Lobby → Game → Reveal → Transfer ──────────────────────
// Stack screens use edges={['top','bottom']} — no tab bar below them
function HeistStackScreen() {
  return (
    <HeistStack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
      <HeistStack.Screen name="Home"     component={HomeScreen} />
      <HeistStack.Screen name="Lobby"    component={LobbyScreen} />
      <HeistStack.Screen name="Game"     component={GameScreen} />
      <HeistStack.Screen name="Reveal"   component={RevealScreen} />
      <HeistStack.Screen name="Transfer">
        {(props: any) => <TransferScreen {...props} />}
      </HeistStack.Screen>
    </HeistStack.Navigator>
  );
}

// ── Role Stack ────────────────────────────────────────────────────────────────
function RoleStackScreen() {
  return (
    <RoleStack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
      <RoleStack.Screen name="RoleLibrary" component={RoleLibraryScreen} />
    </RoleStack.Navigator>
  );
}

// ── Shop Stack ────────────────────────────────────────────────────────────────
function ShopStackScreen() {
  return (
    <ShopStack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
      <ShopStack.Screen name="Shop" component={ShopScreen} />
    </ShopStack.Navigator>
  );
}

// ── Profile Stack ─────────────────────────────────────────────────────────────
function ProfileStackScreen({ onLogout }: Props) {
  const SettingsWithLogout = useCallback(
    (props: any) => <SettingsScreen {...props} onLogout={onLogout} />,
    [onLogout],
  );
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
      <ProfileStack.Screen name="Settings">
        {(props) => <SettingsWithLogout {...props} />}
      </ProfileStack.Screen>
    </ProfileStack.Navigator>
  );
}

// ── Main Tabs ──────────────────────────────────────────────────────────────────
export default function MainTabs({ onLogout }: Props) {
  return (
    <SkiaBackground>
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        // Make every tab screen transparent so SkiaBackground shows through
        sceneStyle: { backgroundColor: 'transparent' },
        // ↓ react-navigation automatically adds bottom inset for nav bar
        tabBarStyle: tabStyles.bar,
        tabBarActiveTintColor: Colors.gold,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.45)',
        tabBarLabelStyle: tabStyles.label,
        // Ensures tab bar background extends behind nav buttons on Android
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="HeistTab"
        component={HeistStackScreen}
        options={{ tabBarLabel: 'Heist', tabBarIcon: HeistIcon }}
      />
      <Tab.Screen
        name="RoleTab"
        component={RoleStackScreen}
        options={{ tabBarLabel: 'Roles', tabBarIcon: RoleIcon }}
      />
      <Tab.Screen
        name="ShopTab"
        component={ShopStackScreen}
        options={{ tabBarLabel: 'Shop', tabBarIcon: ShopIcon }}
      />
      <Tab.Screen
        name="ProfileTab"
        options={{ tabBarLabel: 'Profile', tabBarIcon: ProfileIcon }}
      >
        {() => <ProfileStackScreen onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
    </SkiaBackground>
  );
}

const tabStyles = StyleSheet.create({
  bar: {
    // Dark Navy — clearly separate layer from the Electric Indigo screen bg
    backgroundColor: Colors.tabBarBg,
    borderTopColor: Colors.tabBarBorder,
    borderTopWidth: 1,
    // Fixed height — react-navigation adds system nav bar inset on top
    height: 60,
    paddingBottom: 4,
    paddingTop: 4,
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.40,
    shadowRadius: 12,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semiBold as any,
    // active label color comes from tabBarActiveTintColor in screenOptions
  },
  // Inactive: white at low opacity so it's readable on dark navy
  icon: {
    fontSize: 22,
    opacity: 0.55,
  },
  // Active: full opacity + yellow tint glow via text shadow
  iconFocused: {
    fontSize: 22,
    opacity: 1,
    textShadowColor: Colors.goldGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
});
