import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const tabBarBg = isDark ? '#0a0a0a' : '#ffffff';
  const tabBarBorder = isDark ? '#1c1c1e' : '#f0f0f0';
  const inactiveColor = isDark ? '#6b7280' : '#9ca3af';
  const activeColor = Colors[colorScheme ?? 'light'].tint;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: tabBarBg,
          borderTopWidth: 0,
          elevation: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: isDark ? 0 : 0.04,
          shadowRadius: 8,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginBottom: -2,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'search' : 'search-outline'} color={color} focused={focused} activeColor={activeColor} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Trips',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'airplane' : 'airplane-outline'} color={color} focused={focused} activeColor={activeColor} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Host',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'home' : 'home-outline'} color={color} focused={focused} activeColor={activeColor} />
          ),
        }}
      />
      <Tabs.Screen
        name="list-property"
        options={{
          title: 'Inbox',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'chatbubble' : 'chatbubble-outline'} color={color} focused={focused} activeColor={activeColor} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'person' : 'person-outline'} color={color} focused={focused} activeColor={activeColor} />
          ),
        }}
      />
    </Tabs>
  );
}

function TabIcon({ name, color, focused, activeColor }: { name: string; color: string; focused: boolean; activeColor: string }) {
  return (
    <View style={[styles.iconWrap, focused && { backgroundColor: `${activeColor}12` }]}>
      <Ionicons name={name as any} size={22} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
