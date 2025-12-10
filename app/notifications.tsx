import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';

import { getNotifications, markAllRead, markRead } from '@/api/notifications';
import { InvitationCard } from '@/components/InvitationCard';
import {
  EmptyState,
  LoadingScreen,
  ScreenContainer,
  ScreenHeader,
} from '@/components/common';
import { queryKeys } from '@/lib/queryClient';
import type { Invitation } from '@/types/invitation';
import type { Notification } from '@/types/notification';

const PAGE_SIZE = 20;

export default function NotificationsScreen() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: queryKeys.notifications.all,
    queryFn: async ({ pageParam = 0 }) => {
      const offset = pageParam * PAGE_SIZE;
      return getNotifications({ limit: PAGE_SIZE, offset });
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === PAGE_SIZE ? allPages.length : undefined;
    },
    staleTime: 0,
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const markReadMutation = useMutation({
    mutationFn: markRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.unread(),
      });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.unread(),
      });
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
    refetch();
    queryClient.invalidateQueries({
      queryKey: queryKeys.notifications.unread(),
    });
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

    const isActionable =
      item.invitation_id &&
      (item.type === 'friend_request' ||
        item.type === 'team_invite' ||
        item.type === 'challenge_request');

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

    return (
      <Pressable
        className={`bg-surface mb-3 p-4 rounded-xl relative overflow-hidden ${isUnread ? 'border-l-4 border-primary' : ''}`}
        onPress={() => {
          if (isUnread) markReadMutation.mutate(item.id);
          if (item.type.includes('friend')) {
            router.push('/friends' as any);
          } else if (item.type.includes('team')) {
            router.push('/teams' as any);
          }
        }}
      >
        <View className="flex-row justify-between items-start mb-1">
          <Text className="text-text font-bold text-base flex-1 mr-2">
            {item.title}
          </Text>
          {isUnread && (
            <View className="w-2 h-2 rounded-full bg-primary mt-2" />
          )}
        </View>

        <Text className="text-text-disabled text-sm mb-2 leading-5">
          {item.content}
        </Text>

        <Text className="text-text-muted text-xs">
          {new Date(item.created_at).toLocaleDateString()} •{' '}
          {new Date(item.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </Pressable>
    );
  };

  if (isLoading && !isRefetching) {
    return <LoadingScreen message="Henter notifikationer..." />;
  }

  return (
    <ScreenContainer safeArea edges={['top']}>
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
                <Ionicons
                  name="checkmark-done-outline"
                  size={24}
                  color="#ffffff"
                />
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
            <EmptyState
              title="Du har ingen notifikationer"
              icon="notifications-off-outline"
            />
          }
        />
      </View>
    </ScreenContainer>
  );
}
