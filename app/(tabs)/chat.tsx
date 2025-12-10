import { Avatar, EmptyState, LoadingScreen, ScreenContainer, TabNavigation, TopActionBar } from '@/components/common';
import { useMyTeams } from '@/hooks/queries/useTeams';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';

export default function ChatListScreen() {
  const router = useRouter();
  const { user } = useCurrentUser();
  const { data: myTeams = [], isLoading: teamsLoading } = useMyTeams();

  const [activeTab, setActiveTab] = useState<'teams' | 'friends'>('teams');

  if (!user || teamsLoading) return <LoadingScreen />;

  const data = activeTab === 'teams' ? myTeams : (user.friends || []);

  const renderItem = ({ item }: { item: any }) => {
    const isTeam = activeTab === 'teams';
    const name = isTeam ? item.name : `${item.first_name} ${item.last_name || ''}`;
    const image = item.profile_picture || null;
    const id = item.id;

    return (
      <Pressable
        onPress={() => {
          router.push({
            pathname: '/chat/[id]',
            params: { id: id, type: isTeam ? 'team' : 'user', name: name }
          } as any);
        }}
        className="flex-row items-center p-4 border-b border-surface"
      >
        <View className="mr-4">
          <Avatar
            uri={image}
            size={48}
            placeholderIcon={isTeam ? "shield" : "person"}
            className="bg-surface"
          />
        </View>
        <View className="flex-1">
          <Text className="text-text text-base font-medium">{name}</Text>
          <Text className="text-text-disabled text-sm">Tryk for at chatte</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#575757" />
      </Pressable>
    );
  };

  return (
    <ScreenContainer className='pt-5'>
      <TopActionBar
        title="Beskeder"
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
            title={activeTab === 'teams' ? "Ingen hold" : "Ingen venner"}
            description={activeTab === 'teams' ? "Du er ikke medlem af nogen hold endnu." : "Du har ingen venner endnu."}
            icon="chatbubble-ellipses-outline"
          />
        }
      />
    </ScreenContainer>
  );
}
