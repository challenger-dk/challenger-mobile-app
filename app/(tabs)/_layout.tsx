import { Ionicons } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs, useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useConversations } from '@/hooks/queries/useConversations';

export default function TabLayout() {
  const { isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const { data: conversations = [] } = useConversations();

  // Calculate total unread messages
  const unreadMessagesCount = conversations.reduce((sum, conv) => sum + conv.unread_count, 0);

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
        name="messages"
        options={{
          title: 'Beskeder',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-ellipses" size={size || 28} color={color} />
          ),
          tabBarBadge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
        }}
      />
      <Tabs.Screen
        name="chat"
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
    </Tabs>
  );
}
