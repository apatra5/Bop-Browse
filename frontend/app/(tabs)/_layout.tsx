import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        // 1. Aesthetic: Strict Black & Grey palette
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: '#bdbdbd',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: false, // Keep it minimal (icons only)
        
        // 2. Tab Bar Styling
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 0, // Remove harsh line
          height: Platform.OS === 'ios' ? 88 : 64, // Taller for modern feel
          paddingTop: 12, // Center icons vertically
          // Soft, premium shadow
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.04,
          shadowRadius: 12,
          elevation: 5, // Android shadow
        },
      }}>
      
      {/* Tab 1: Discovery Feed */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Discover',
          // Changed to 'house' to represent the "Feed". 
          // 'heart' implies the saved list, which is your closet.
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="house.fill" color={color} />,
        }}
      />

      {/* Tab 2: Closet (Saved Items) */}
      <Tabs.Screen
        name="closet"
        options={{
          title: 'Closet',
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="hanger" color={color} />,
        }}
      />

      {/* Tab 3: Profile */}
      <Tabs.Screen
        name="user"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="person.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}