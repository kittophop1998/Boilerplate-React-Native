import React, { useCallback } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '@screens/HomeScreen';
import SettingsScreen from '@screens/SettingsScreen';
import CustomBottomTab from '@components/BottomTab';

type Props = {
  onLogout: () => void;
};

const Tab = createBottomTabNavigator();

// Stable component references to avoid re-mounting on every render
const renderTabBar = (props: any) => <CustomBottomTab {...props} />;

export default function MainTabs({ onLogout }: Props) {
  const SettingsWithLogout = useCallback(
    (props: any) => <SettingsScreen {...props} onLogout={onLogout} />,
    [onLogout],
  );

  return (
    <Tab.Navigator tabBar={renderTabBar}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Settings" component={SettingsWithLogout} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  );
}
