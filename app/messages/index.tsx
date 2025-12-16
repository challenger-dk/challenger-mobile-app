import {
  EmptyState,
  LoadingScreen,
  ScreenContainer,
  ScreenHeader,
} from '@/components/common';
import { ConversationListItem } from '@/components/chat';
import { useConversations } from '@/hooks/queries/useConversations';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ConversationListItem as ConversationListItemType } from '@/types/conversation';

export default function MessagesScreen() {
  const router = useRouter();
  const { user } = useCurrentUser();
  const { data: conversations = [], isLoading, refetch, isRefetching } = useConversations();
  const [searchQuery, setSearchQuery] = useState('');

  if (!user || isLoading) return <LoadingScreen />;

  // Filter conversations based on search query
  const filteredConversations = conversations.filter((conv) => {
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
  });

  // Calculate total unread count
  const totalUnreadCount = conversations.reduce((sum, conv) => sum + conv.unread_count, 0);

  const renderItem = ({ item }: { item: ConversationListItemType }) => {
    return <ConversationListItem conversation={item} />;
  };

  return (
    <ScreenContainer safeArea edges={['top', 'left', 'right', 'bottom']}>
      <View className="px-6 flex-1">
        <ScreenHeader
          title="Beskeder"
          rightAction={
            totalUnreadCount > 0 ? (
              <View className="bg-danger rounded-full min-w-[24px] h-6 items-center justify-center px-2">
                <Text className="text-white text-xs font-bold">
                  {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                </Text>
              </View>
            ) : undefined
          }
        />

        {/* Search Bar */}
        <View className="pb-3 pt-4">
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
      </View>
    </ScreenContainer>
  );
}

