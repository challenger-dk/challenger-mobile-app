import {
  EmptyState,
  LoadingScreen,
  ScreenContainer,
  TopActionBar,
} from '@/components/common';
import { ConversationListItem } from '@/components/chat';
import { useConversations } from '@/hooks/queries/useConversations';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, TextInput, View } from 'react-native';
import type { ConversationListItem as ConversationListItemType } from '@/types/conversation';

export default function MessagesTabScreen() {
  const router = useRouter();
  const { user } = useCurrentUser();
  const { data: conversations = [], isLoading, refetch, isRefetching } = useConversations();
  const [searchQuery, setSearchQuery] = useState('');

  if (!user || isLoading) return <LoadingScreen />;

  // Filter and sort conversations
  const filteredConversations = conversations
    // Filter out conversations with no messages
    .filter((conv) => conv.last_message !== null && conv.last_message !== undefined)
    // Filter based on search query
    .filter((conv) => {
      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase();

      // Search in direct conversation user names
      if (conv.type === 'direct' && conv.other_user) {
        const fullName = `${conv.other_user.first_name} ${conv.other_user.last_name}`.toLowerCase();
        return fullName.includes(query);
      }

      // Search in group titles
      if (conv.type === 'group' && conv.title) {
        return conv.title.toLowerCase().includes(query);
      }

      // Search in team names
      if (conv.type === 'team' && conv.team_name) {
        return conv.team_name.toLowerCase().includes(query);
      }

      return false;
    })
    // Sort by most recent message first (newest on top)
    .sort((a, b) => {
      const aTime = a.last_message?.created_at || a.updated_at;
      const bTime = b.last_message?.created_at || b.updated_at;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });

  const renderItem = ({ item }: { item: ConversationListItemType }) => {
    return <ConversationListItem conversation={item} />;
  };

  return (
    <ScreenContainer className="pt-5">
      <TopActionBar
        title="Beskeder"
        showNotifications={false}
        showCalendar={false}
        showSettings={false}
      />

      {/* Search Bar */}
      <View className="px-5 pb-3">
        <View className="flex-row items-center bg-surface rounded-2xl px-4 py-2">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            className="ml-2 flex-1 text-white text-sm"
            placeholder="Søg beskeder..."
            placeholderTextColor="#6B7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#6B7280" />
            </Pressable>
          )}
        </View>
      </View>

      <FlatList
        data={filteredConversations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#ffffff"
          />
        }
        ListEmptyComponent={
          <EmptyState
            title="Ingen beskeder"
            description={
              searchQuery
                ? 'Ingen beskeder matcher din søgning.'
                : 'Start en samtale ved at trykke på + knappen.'
            }
            icon="chatbubble-ellipses-outline"
          />
        }
      />

      {/* Floating Action Button */}
      <Pressable
        onPress={() => router.push('/messages/new' as any)}
        className="absolute bottom-6 right-6 bg-primary w-14 h-14 rounded-full items-center justify-center shadow-lg"
        style={{
          shadowColor: '#0A84FF',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Ionicons name="add" size={28} color="#ffffff" />
      </Pressable>
    </ScreenContainer>
  );
}

