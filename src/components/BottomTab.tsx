import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Custom bottom tab bar with simple emoji icons (no extra deps), floating style,
// rounded border, shadow, and clear active-tab visuals.
export default function CustomBottomTabBar({ state, descriptors, navigation, styleOverrides }: any) {
  // Return a MaterialIcons name for a given route. We'll render the icon element
  // in the tab render block so we can control size & color based on focus.
  const getIconName = (routeName: string) => {
    switch (routeName.toLowerCase()) {
      case 'home':
        return 'home';
      case 'login':
      case 'profile':
        return 'person';
      case 'settings':
        return 'settings';
      case 'search':
        return 'search';
      case 'notifications':
        return 'notifications';
      default:
        return 'help-outline';
    }
  };

  return (
    <View style={[styles.outerContainer]}> 
      <View style={[styles.container, styleOverrides?.container]}>
        {state.routes.map((route: any, index: number) => {
          const label = descriptors[route.key]?.options?.title ?? route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            // Navigate normally. If the tab is already focused, still call navigate to be consistent.
            navigation.navigate(route.name);
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityLabel={label}
              activeOpacity={0.8}
              onPress={onPress}
              style={styles.tabWrapper}
            >
              <View style={[styles.tab, isFocused && styles.tabActive]}>
                {/* Render MaterialIcons directly so size & color behave as expected */}
                <MaterialIcons
                  name={getIconName(route.name)}
                  size={20}
                  color={isFocused ? styles.iconActive.color : '#666'}
                  style={styles.icon}
                />
                <Text style={[styles.label, isFocused && styles.labelActive]}>{label}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Outer container is used to position the floating bar above the bottom and
  // keep it within safe area visually. Keep it full width; inner container has margins.
  outerContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    zIndex: 10,
    // allow the floating bar to not stretch under other elements
  },
  container: {
    flexDirection: 'row',
    height: 66,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    // Shadow / elevation
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  tabWrapper: {
    flex: 1,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginHorizontal: 6,
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: '#EAF2FF', // light accent background for active tab
  },
  icon: {
    fontSize: 18,
    marginBottom: 2,
    color: '#666',
  },
  iconActive: {
    color: '#007AFF',
  },
  label: {
    fontSize: 12,
    color: '#444',
  },
  labelActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
});
