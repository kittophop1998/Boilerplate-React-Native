// ─── ฝากหน่อย (Fark-Noi) — Main Navigation ──────────────────────────────────
// Flow: Onboarding (LandingScreen) → MainApp (Stack: Home)
// Overlay Screens (Stack): PostRequest · TaskBoard · ActiveOrder · ScoutAnnounce · Chat · Settings
// ─────────────────────────────────────────────────────────────────────────────
import React, { useCallback } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import LandingScreen from '@screens/LandingScreen';
import HomeScreen from '@screens/HomeScreen';
import ActiveOrderScreen from '@screens/ActiveOrderScreen';
import ScoutAnnounceScreen from '@screens/ScoutAnnounceScreen';
import PostRequestScreen from '@screens/PostRequestScreen';
import TaskBoardScreen from '@screens/TaskBoardScreen';
import ChatScreen from '@screens/ChatScreen';
import SettingsScreen from '@screens/SettingsScreen';
import AppDetailScreen from '@screens/AppDetailScreen';

// ─────────────────────────────────────────────────────────────────────────────
type Props = { onLogout: () => void };

const Stack = createNativeStackNavigator();

// ── Root Stack ────────────────────────────────────────────────────────────────
export default function MainTabs({ onLogout }: Props) {
  const SettingsWithLogout = useCallback(
    (props: any) => <SettingsScreen {...props} onLogout={onLogout} />,
    [onLogout],
  );

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* 1. Onboarding — shown first */}
      <Stack.Screen name="Onboarding" component={LandingScreen} />

      {/* 2. Main App */}
      <Stack.Screen name="Home" component={HomeScreen} />

      {/* 3. Overlay / Action Screens */}
      <Stack.Screen name="PostRequest" component={PostRequestScreen} />
      <Stack.Screen name="TaskBoard" component={TaskBoardScreen} />
      <Stack.Screen name="ActiveOrder" component={ActiveOrderScreen} />
      <Stack.Screen name="ScoutAnnounce" component={ScoutAnnounceScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="OrderDetail" component={ActiveOrderScreen} />
      <Stack.Screen name="AppDetail" component={AppDetailScreen} />
      <Stack.Screen name="Settings" options={{ presentation: 'modal' }}>
        {(props) => <SettingsWithLogout {...props} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
