import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getNotifications, markAllRead, markRead } from '@/api/notifications';
import { acceptInvitation, declineInvitation } from '@/api/invitations';
import { LoadingScreen, ScreenHeader } from '@/components/common';
import { InvitationCard } from '@/components/InvitationCard';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import type { Notification } from '@/types/notification';
import type { Invitation } from '@/types/invitation';
import { queryKeys } from '@/lib/queryClient';

const PAGE_SIZE = 20;

export default function NotificationsScreen() {
  const queryClient = useQueryClient();
  const router = useRouter();

  // Infinite Scroll Query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isRefetching
  } = useInfiniteQuery({
    queryKey: queryKeys.notifications.all,
    queryFn: async ({ pageParam = 0 }) => {
      const offset = pageParam * PAGE_SIZE;
      // Fetch notifications (read AND unread)
      return getNotifications({ limit: PAGE_SIZE, offset });
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === PAGE_SIZE ? allPages.length : undefined;
    },
    // Disabled automatic polling as requested
    // refetchInterval: 10000,
    staleTime: 0, // Ensure data is considered stale immediately so refetch works
  });

  // Fetch notifications automatically when the screen comes into focus (is redirected to)
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  // Mutations
  const markReadMutation = useMutation({
    mutationFn: markRead,
    onSuccess: () => {
      // Refresh the list and badge count
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unread() });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unread() });
    },
  });

  const onRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleInvitationHandled = () => {
    // Reload the list when an invitation is accepted/declined
    // This will remove the notification if it's no longer "relevant"
    refetch();
    // Also refresh the badge count
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unread() });
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color="#ffffff" />
      </View>
    );
  };

  const notifications = data?.pages.flat() || [];

  const renderNotificationItem = ({ item }: { item: Notification }) => {
    const isUnread = !item.is_read;

    // Check if this is an actionable invitation (friend or team invite)
    const isActionable = item.invitation_id && (
      item.type === 'friend_request' ||
      item.type === 'team_invite' ||
      item.type === 'challenge_request'
    );

    // 1. ACTIONABLE NOTIFICATION (Shows InvitationCard)
    if (isActionable && item.invitation_id && item.actor) {
      const invitationData: Invitation = {
        id: item.invitation_id,
        inviter: item.actor as any,
        note: item.content,
        resource_type: (item.resource_type || 'team') as any,
        status: 'pending',
      };

      return (
        <View className="mb-3">
          <InvitationCard
            invitation={invitationData}
            onInvitationHandled={handleInvitationHandled}
          />
        </View>
      );
    }

    // 2. NOTICE NOTIFICATION (Standard View)
    return (
      <Pressable
        className={`bg-[#2c2c2c] mb-3 p-4 rounded-xl relative overflow-hidden ${isUnread ? 'border-l-4 border-[#0A84FF]' : ''}`}
        onPress={() => {
          if (isUnread) markReadMutation.mutate(item.id);

          // Navigation logic
          if (item.type.includes('friend')) {
            router.push('/friends' as any);
          } else if (item.type.includes('team')) {
            router.push('/teams' as any);
          }
        }}
      >
        <View className="flex-row justify-between items-start mb-1">
          <Text className="text-white font-bold text-base flex-1 mr-2">{item.title}</Text>
          {isUnread && (
            <View className="w-2 h-2 rounded-full bg-[#0A84FF] mt-2" />
          )}
        </View>

        <Text className="text-[#dfdfdf] text-sm mb-2 leading-5">{item.content}</Text>

        <Text className="text-[#575757] text-xs">
          {new Date(item.created_at).toLocaleDateString()} • {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </Pressable>
    );
  };

  if (isLoading && !isRefetching) {
    return <LoadingScreen message="Henter notifikationer..." />;
  }

  return (
    <SafeAreaView className="flex-1 bg-[#171616]" edges={['top']}>
      <View className="px-6 flex-1">
        <ScreenHeader
          title="Notifikationer"
          rightAction={
            <Pressable
              onPress={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
              className="p-2"
            >
              {markAllReadMutation.isPending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Ionicons name="checkmark-done-outline" size={24} color="#ffffff" />
              )}
            </Pressable>
          }
        />

        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={onRefresh}
              tintColor="#fff"
            />
          }
          ListEmptyComponent={
            <View className="py-12 items-center">
              <View className="w-16 h-16 rounded-full bg-[#2c2c2c] items-center justify-center mb-4">
                <Ionicons name="notifications-off-outline" size={32} color="#575757" />
              </View>
              <Text className="text-[#575757] text-base text-center">
                Du har ingen notifikationer
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}
