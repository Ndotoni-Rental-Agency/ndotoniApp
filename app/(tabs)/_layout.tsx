import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) => <Ionicons name="search" size={size || 24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Trips',
          tabBarIcon: ({ color, size }) => <Ionicons name="airplane-outline" size={size || 24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Host',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size || 24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="list-property"
        options={{
          title: 'Inbox',
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubble-outline" size={size || 24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size || 24} color={color} />,
        }}
      />
    </Tabs>
  );
}
