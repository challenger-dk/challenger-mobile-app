import { Avatar, EmptyState, LoadingScreen, ScreenContainer, TabNavigation } from '@/components/common';
import { useMyTeams } from '@/hooks/queries/useTeams';
import { useMyChats } from '@/hooks/queries/useChats';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';

export default function ChatListScreen() {
  const router = useRouter();
  const { user } = useCurrentUser();
  const { data: myTeams = [], isLoading: teamsLoading } = useMyTeams();
  const { data: myChats = [], isLoading: chatsLoading } = useMyChats();

  const [activeTab, setActiveTab] = useState<'teams' | 'chats'>('teams');

  if (!user || teamsLoading || chatsLoading) return <LoadingScreen />;

  const data = activeTab === 'teams' ? myTeams : myChats;

  const renderItem = ({ item }: { item: any }) => {
    const isTeam = activeTab === 'teams';
    let name = '';
    let image = null;

    const unreadCount = !isTeam && item.unread_count ? item.unread_count : 0;

    if (isTeam) {
      name = item.name;
    } else {
      if (item.name) {
        name = item.name;
      } else {
        const others = item.users.filter((u: any) => u.id !== user.id);
        name = others.map((u: any) => u.first_name).join(', ') || 'Chat';
        if (others.length === 1) image = others[0].profile_picture;
      }
    }

    return (
      <Pressable
        onPress={() => {
          router.push({
            pathname: '/chat/[id]',
            params: { id: item.id, type: isTeam ? 'team' : 'chat', name: name }
          } as any);
        }}
        className="flex-row items-center p-4 border-b border-surface"
      >
        <View className="mr-4">
          <Avatar
            uri={image}
            size={48}
            placeholderIcon={isTeam ? "shield" : "chatbubble"}
            className="bg-surface"
          />
        </View>
        <View className="flex-1">
          <Text className="text-text text-base font-medium" numberOfLines={1}>{name}</Text>
          <Text className="text-text-disabled text-sm">
            {isTeam ? 'Team Chat' : 'Conversation'}
          </Text>
        </View>

        {unreadCount > 0 && (
          <View className="bg-red-500 rounded-full min-w-[20px] h-5 px-1.5 justify-center items-center mr-2">
            <Text className="text-white text-xs font-bold">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        )}

        <Ionicons name="chevron-forward" size={20} color="#575757" />
      </Pressable>
    );
  };

  return (
    <ScreenContainer safeArea edges={['top']}>
      <View className="px-5 pb-2 flex-row justify-between items-center">
        <Text className="text-text text-xl font-bold mb-4">Beskeder</Text>
        <Pressable onPress={() => router.push('/chat/create' as any)}>
          <Ionicons name="add-circle" size={32} color="#D1FF4C" style={{ marginBottom: 16 }} />
        </Pressable>
      </View>

      <View className="px-5 pb-2">
        <TabNavigation
          tabs={[
            { key: 'teams', label: 'Hold' },
            { key: 'chats', label: 'Chats' },
          ]}
          activeTab={activeTab}
          onTabChange={(key) => setActiveTab(key as 'teams' | 'chats')}
        />
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <EmptyState
            title={activeTab === 'teams' ? "Ingen hold" : "Ingen chats"}
            description={
              activeTab === 'teams'
                ? "Du er ikke medlem af nogen hold endnu."
                : "Du har ingen aktive chats. Tryk på + for at starte en."
            }
            icon="chatbubble-ellipses-outline"
          />
        }
      />
    </ScreenContainer>
  );
}
