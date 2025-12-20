import { Ionicons } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs, useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function TabLayout() {
  const { isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Redirect unauthenticated users to auth screens
    if (!isAuthenticated && segments[0] === '(tabs)') {
      router.replace('/(auth)/login' as any);
    }
  }, [isAuthenticated, segments, router]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#171616',
          borderTopColor: '#3a3a3a',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 80 : 64,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#0A84FF',
        tabBarInactiveTintColor: '#999999',
        tabBarLabelStyle: {
          fontSize: 11,
          lineHeight: 11,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size || 28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="social"
        options={{
          title: 'Social',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size || 28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="hub"
        options={{
          title: 'Hub',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="soccer-field"
              size={size || 28}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="maps"
        options={{
          title: 'Maps',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-outline" size={size || 28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size || 28} color={color} />
          ),
        }}
      />
      {/* Messages screen - hidden from tab bar but accessible via routing */}
      <Tabs.Screen
        name="messages"
        options={{
          href: null, // This hides it from the tab bar
        }}
      />
    </Tabs>
  );
}
