import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

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
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size || 28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'My Properties',
          tabBarIcon: ({ color, size }) => <Ionicons name="business" size={size || 28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="list-property"
        options={{
          title: 'Add Property',
          tabBarIcon: ({ color, size }) => <Ionicons name="add-circle" size={size || 28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubbles" size={size || 28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size || 28} color={color} />,
        }}
      />
    </Tabs>
  );
}
