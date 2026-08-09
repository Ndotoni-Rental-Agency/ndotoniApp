import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  const tabBarBg = Colors[colorScheme ?? 'light'].card;
  const inactiveColor = Colors[colorScheme ?? 'light'].textTertiary;
  const activeColor = Colors[colorScheme ?? 'light'].tint;

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
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
          height: Platform.OS === 'ios' ? 88 : 56 + insets.bottom,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 28 : insets.bottom + 4,
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
        name="trips"
        options={{
          title: 'Trips',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'airplane' : 'airplane-outline'} color={color} focused={focused} activeColor={activeColor} />
          ),
        }}
      />
      <Tabs.Screen
        name="host"
        options={{
          title: 'Host',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'home' : 'home-outline'} color={color} focused={focused} activeColor={activeColor} />
          ),
        }}
      />
      <Tabs.Screen
        name="inbox"
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
    </>
  );
}

function TabIcon({ name, color, focused, activeColor }: { name: keyof typeof Ionicons.glyphMap; color: string; focused: boolean; activeColor: string }) {
  const progress = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(focused ? 1 : 0, { duration: 200 });
  }, [focused, progress]);

  const pillStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.6 + progress.value * 0.4 }],
  }));

  return (
    <View style={styles.iconWrap}>
      <Animated.View style={[styles.pill, { backgroundColor: `${activeColor}12` }, pillStyle]} />
      <Ionicons name={name} size={22} color={color} style={styles.icon} />
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
  pill: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  icon: {},
});
