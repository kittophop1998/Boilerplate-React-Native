// ─── FloatingTabBar — ฝากหน่อย ───────────────────────────────────────────────
//
// Custom floating bottom tab bar สำหรับใช้กับ @react-navigation/bottom-tabs
//
// วิธีใช้งาน:
// ─────────────────────────────────────────────────────────────────────────────
//   import FloatingTabBar, { TAB_BAR_TOTAL } from '@components/navigation/FloatingTabBar';
//
//   const renderTabBar = (props: BottomTabBarProps) => <FloatingTabBar {...props} />;
//
//   <Tab.Navigator
//     tabBar={renderTabBar}
//     screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}
//   >
//     <Tab.Screen name="Home"     component={HomeScreen} />
//     <Tab.Screen name="Search"   component={SearchScreen} />
//     <Tab.Screen name="Post"     component={PostScreen} />   ← FAB (ชื่อต้องตรงกับ FAB_ROUTE_NAME)
//     <Tab.Screen name="MyOrders" component={OrdersScreen} />
//     <Tab.Screen name="Profile"  component={ProfileScreen} />
//   </Tab.Navigator>
//
// หมายเหตุ:
//   • TAB_ITEMS ต้องมีจำนวนและลำดับ name ตรงกับ Tab.Screen ที่ประกาศไว้
//   • FAB_ROUTE_NAME คือชื่อ route ที่จะแสดงเป็นปุ่มกลมตรงกลาง
//   • export ค่า TAB_BAR_TOTAL เพื่อนำไปใช้เพิ่ม paddingBottom ให้ screen content
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

// ── Design tokens ─────────────────────────────────────────────────────────────
const BAR_BG         = '#16161E';  // near-black (dark bar background)
const ACTIVE_COLOR   = '#4C6EF5';  // electric blue — active tab icon
const INACTIVE_COLOR = '#6B7280';  // cool grey — inactive tab icon
const FAB_COLOR_1    = '#6C47FF';  // purple — FAB button fill
const FAB_COLOR_2    = '#4C6EF5';  // blue — FAB ring glow

const BAR_HEIGHT     = Platform.OS === 'ios' ? 80 : 68;
const BAR_MARGIN_BTM = Platform.OS === 'ios' ? 24 : 16;
const FAB_SIZE       = 60;
const FAB_RING       = FAB_SIZE + 12;

// ── ค่าความสูงรวมของ bar (export ไปใช้เพิ่ม paddingBottom ใน screen) ──────────
export const TAB_BAR_TOTAL = BAR_HEIGHT + BAR_MARGIN_BTM + 8;

// ── ชื่อ route ที่จะแสดงเป็น FAB กลาง ────────────────────────────────────────
const FAB_ROUTE_NAME = 'Post';

// ── Tab item config ───────────────────────────────────────────────────────────
// เปลี่ยน label / icon ให้ตรงกับ Tab.Screen ที่ประกาศใน Navigator
export const TAB_ITEMS: {
  name: string;
  label: string;
  icon: string;        // Ionicons outline name (inactive)
  activeIcon: string;  // Ionicons filled name  (active)
}[] = [
  { name: 'Home',     label: 'หน้าแรก', icon: 'home-outline',          activeIcon: 'home' },
  { name: 'Search',   label: 'หิ้วของ',  icon: 'bicycle-outline',       activeIcon: 'bicycle' },
  { name: 'Post',     label: '',         icon: '',                      activeIcon: '' },  // FAB
  { name: 'MyOrders', label: 'ออเดอร์',  icon: 'receipt-outline',       activeIcon: 'receipt' },
  { name: 'Profile',  label: 'โปรไฟล์',  icon: 'person-circle-outline', activeIcon: 'person-circle' },
];

// ── FloatingTabBar Component ──────────────────────────────────────────────────
export default function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const tabItems = state.routes.map((route, index) => {
    const isFab   = route.name === FAB_ROUTE_NAME;
    const focused = state.index === index;
    const item    = TAB_ITEMS[index];

    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });
      if (!focused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };

    // ── FAB centre button ────────────────────────────────────────────────────
    if (isFab) {
      return (
        <View key={route.key} style={styles.fabSlot}>
          <View style={styles.fabRing}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onPress}
              style={styles.fab}
            >
              <Icon name="storefront" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // ── Regular tab ──────────────────────────────────────────────────────────
    const iconName = focused ? item.activeIcon : item.icon;
    const color    = focused ? ACTIVE_COLOR : INACTIVE_COLOR;

    return (
      <TouchableOpacity
        key={route.key}
        onPress={onPress}
        activeOpacity={0.7}
        style={styles.tabBtn}
      >
        <Icon name={iconName as any} size={24} color={color} />
        <Text style={[styles.tabLabel, { color }]}>{item.label}</Text>
      </TouchableOpacity>
    );
  });

  return (
    <>
      {/*
        Spacer ใน normal layout flow → บอก React Navigation ว่าต้องเว้น
        พื้นที่ด้านล่างให้ screen content เท่าไหร่ เพื่อไม่ให้ bar บัง
      */}
      <View style={{ height: TAB_BAR_TOTAL }} />

      {/* Floating bar — absolute positioned ────────────────────────────── */}
      <View style={styles.wrapper}>
        <View style={styles.bar}>{tabItems}</View>
      </View>
    </>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Bar wrapper
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BAR_BG,
    width: '92%',
    height: BAR_HEIGHT,
    borderRadius: 36,
    marginBottom: BAR_MARGIN_BTM,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 20,
    overflow: 'visible',
  },

  // Regular tab button
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 3,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
  },

  // FAB
  fabSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: -(FAB_RING / 2 + 4),
  },
  fabRing: {
    width: FAB_RING,
    height: FAB_RING,
    borderRadius: FAB_RING / 2,
    backgroundColor: BAR_BG,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: FAB_COLOR_1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 14,
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: FAB_COLOR_1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: FAB_COLOR_2,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 12,
  },
});
