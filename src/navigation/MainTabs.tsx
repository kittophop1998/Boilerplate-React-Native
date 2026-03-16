// ─── The Heist — Main Navigation ─────────────────────────────────────────────
// Full-screen game layout: NO visible bottom tab bar.
// Navigation is driven by in-screen buttons (Clash of Clans / Free Fire style).
// Tab.Navigator is kept so react-navigation manages state & back-stack correctly,
// but the tab bar is hidden via tabBarStyle: { display: 'none' }.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useCallback } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import HomeScreen from '@screens/HomeScreen';
import LobbyScreen from '@screens/LobbyScreen';
import GameScreen from '@screens/GameScreen';
import RevealScreen from '@screens/RevealScreen';
import ChatScreen from '@screens/ChatScreen';
import RoleLibraryScreen from '@screens/RoleLibraryScreen';
import ShopScreen from '@screens/ShopScreen';
import TransferScreen from '@screens/TransferScreen';
import SettingsScreen from '@screens/SettingsScreen';

// Background
import SkiaBackground from '@components/skia/SkiaBackground';

// ─────────────────────────────────────────────────────────────────────────────
type Props = { onLogout: () => void };

const Tab = createBottomTabNavigator();
const HeistStack = createNativeStackNavigator();
const RoleStack = createNativeStackNavigator();
const ShopStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

// ── Heist Stack: Home → Lobby → Game → Reveal → Transfer ──────────────────────
function HeistStackScreen() {
  return (
    <HeistStack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
      <HeistStack.Screen name="Home"     component={HomeScreen} />
      <HeistStack.Screen name="Lobby"    component={LobbyScreen} />
      <HeistStack.Screen name="Game"     component={GameScreen} />
      <HeistStack.Screen name="Reveal"   component={RevealScreen} />
      <HeistStack.Screen name="Chat"     component={ChatScreen} />
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
// The tab bar is intentionally hidden — navigation happens via in-game buttons.
export default function MainTabs({ onLogout }: Props) {
  return (
    <SkiaBackground>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: 'transparent' },
          // ↓ Hide the tab bar completely — Clash of Clans style
          tabBarStyle: { display: 'none' },
        }}
      >
        <Tab.Screen name="HeistTab" component={HeistStackScreen} />
        <Tab.Screen name="RoleTab"  component={RoleStackScreen} />
        <Tab.Screen name="ShopTab"  component={ShopStackScreen} />
        <Tab.Screen name="ProfileTab">
          {() => <ProfileStackScreen onLogout={onLogout} />}
        </Tab.Screen>
      </Tab.Navigator>
    </SkiaBackground>
  );
}
