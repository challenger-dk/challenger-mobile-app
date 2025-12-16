// File: app/(tabs)/chat.tsx
import {
  Avatar,
  EmptyState,
  LoadingScreen,
  ScreenContainer,
  TabNavigation,
  TopActionBar,
} from '@/components/common';
import { useMyTeams } from '@/hooks/queries/useTeams';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';

export default function ChatListScreen() {
  const router = useRouter();
  const { user } = useCurrentUser();

  // Pass current user id to the hook so it fetches the correct teams for the logged-in user
  const { data: myTeams = [], isLoading: teamsLoading } = useMyTeams();

  const [activeTab, setActiveTab] = useState<'teams' | 'friends'>('teams');

  if (!user || teamsLoading) return <LoadingScreen />;

  const data = activeTab === 'teams' ? myTeams : user.friends || [];

  const renderItem = ({ item }: { item: any }) => {
    const isTeam = activeTab === 'teams';
    const name = isTeam
      ? item.name
      : `${item.first_name} ${item.last_name || ''}`;
    const image = item.profile_picture || null;
    const id = item.id;

    return (
      <Pressable
        onPress={() => {
          if (isTeam) {
            // Navigate to the team profile page instead of directly opening chat
            router.push({
              pathname: '/teams/[id]',
              params: { id },
            } as any);
          } else {
            // Friends - navigate to user profile
            router.push({
              pathname: '/users/[id]',
              params: { id },
            } as any);
          }
        }}
        className="flex-row items-center p-4 border-b border-surface"
      >
        <View className="mr-4">
          <Avatar
            uri={image}
            size={48}
            placeholderIcon={isTeam ? 'shield' : 'person'}
            className="bg-surface"
          />
        </View>
        <View className="flex-1">
          <Text className="text-text text-base font-medium">{name}</Text>
          <Text className="text-text-disabled text-sm">
            {isTeam ? 'Gå til holdets profil' : 'Gå til profil'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#575757" />
      </Pressable>
    );
  };

  return (
    <ScreenContainer className="pt-5">
      <TopActionBar
        title="Social"
        showNotifications={false}
        showCalendar={false}
        showSettings={false}
      />
      <View className="px-5 pb-2">
        <TabNavigation
          tabs={[
            { key: 'teams', label: 'Hold' },
            { key: 'friends', label: 'Venner' },
          ]}
          activeTab={activeTab}
          onTabChange={(key) => setActiveTab(key as 'teams' | 'friends')}
        />
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <EmptyState
            title={activeTab === 'teams' ? 'Ingen hold' : 'Ingen venner'}
            description={
              activeTab === 'teams'
                ? 'Du er ikke medlem af nogen hold endnu.'
                : 'Du har ingen venner endnu.'
            }
            icon="chatbubble-ellipses-outline"
          />
        }
      />
    </ScreenContainer>
  );
}
