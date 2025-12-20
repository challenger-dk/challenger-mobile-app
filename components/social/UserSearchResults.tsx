import { SendInvitation } from '@/api/invitations';
import { Avatar, EmptyState } from '@/components/common';
import { useDebounce } from '@/hooks/useDebounce';
import { useSearchUsers } from '@/hooks/queries/useUsers';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { queryKeys } from '@/lib/queryClient';
import type { CreateInvitation } from '@/types/invitation';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useState, useMemo } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

interface UserSearchResultsProps {
  searchQuery: string;
  currentFriendIds: Set<number | string>;
}

export function UserSearchResults({ searchQuery, currentFriendIds }: UserSearchResultsProps) {
  const router = useRouter();
  const { user: currentUser } = useCurrentUser();
  const queryClient = useQueryClient();
  const [sendingInvites, setSendingInvites] = useState<Set<number>>(new Set());
  
  // Debounce search query to avoid too many API calls
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Fetch search results
  const { data, isLoading, error } = useSearchUsers(debouncedSearch, 20);

  const handleAddFriend = async (inviteeId: number | string) => {
    if (!currentUser) return;

    const numericInviterId =
      typeof currentUser.id === 'string' ? parseInt(currentUser.id, 10) : currentUser.id;
    const numericInviteeId =
      typeof inviteeId === 'string' ? parseInt(inviteeId, 10) : inviteeId;

    // Add to sending set
    setSendingInvites((prev) => new Set(prev).add(numericInviteeId));

    try {
      const invitation: CreateInvitation = {
        inviter_id: numericInviterId,
        invitee_id: numericInviteeId,
        note: `${currentUser.first_name} har sendt dig en venneanmodning`,
        resource_type: 'friend',
      };

      await SendInvitation(invitation);
      showSuccessToast('Venneanmodning sendt!');
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.current() });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.suggestedFriends() });
    } catch (err) {
      console.error('Failed to send invitation:', err);
      showErrorToast('Kunne ikke sende venneanmodning.');
    } finally {
      // Remove from sending set
      setSendingInvites((prev) => {
        const newSet = new Set(prev);
        newSet.delete(numericInviteeId);
        return newSet;
      });
    }
  };

  // Filter out current friends from search results
  const filteredUsers = useMemo(() => {
    if (!data?.users) return [];
    return data.users.filter((u) => !currentFriendIds.has(u.id));
  }, [data?.users, currentFriendIds]);

  if (isLoading && debouncedSearch) {
    return (
      <View className="mb-6">
        <Text className="text-text-muted text-sm mb-3">Søgeresultater</Text>
        <View className="items-center justify-center py-8">
          <ActivityIndicator size="large" color="#F59E0B" />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="mb-6">
        <Text className="text-text-muted text-sm mb-3">Søgeresultater</Text>
        <Text className="text-danger text-sm">Kunne ikke søge efter brugere</Text>
      </View>
    );
  }

  // Only show search results when there's an active search query
  if (!debouncedSearch) {
    return null;
  }

  if (!data?.users || filteredUsers.length === 0) {
    return (
      <View className="mb-6">
        <Text className="text-text-muted text-sm mb-3">Søgeresultater</Text>
        <EmptyState
          title="Ingen resultater"
          description={`Ingen brugere fundet for "${debouncedSearch}"`}
          icon="search-outline"
        />
      </View>
    );
  }

  return (
    <View className="mb-6">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-text-muted text-sm">Søgeresultater</Text>
        {filteredUsers.length > 0 && (
          <Text className="text-text-muted text-xs">
            {filteredUsers.length} {filteredUsers.length === 1 ? 'bruger' : 'brugere'}
          </Text>
        )}
      </View>
      
      {filteredUsers.map((user) => {
        const isSending = sendingInvites.has(
          typeof user.id === 'string' ? parseInt(user.id, 10) : user.id
        );

        return (
          <Pressable
            key={user.id}
            onPress={() => router.push(`/users/${user.id}` as any)}
            className="flex-row items-center justify-between bg-surface rounded-2xl p-4 mb-3"
          >
            <View className="flex-row items-center gap-3 flex-1">
              <Avatar
                uri={user.profile_picture}
                size={40}
                placeholderIcon="person"
              />
              <View className="flex-1">
                <Text className="text-text text-base font-semibold">
                  {user.first_name} {user.last_name}
                </Text>
                {user.city && (
                  <Text className="text-xs text-text-muted">{user.city}</Text>
                )}
              </View>
            </View>
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                handleAddFriend(user.id);
              }}
              disabled={isSending}
              className={`rounded-full p-2 ${isSending ? 'bg-gray-600' : 'bg-warning'}`}
            >
              {isSending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Ionicons name="add" size={20} color="#ffffff" />
              )}
            </Pressable>
          </Pressable>
        );
      })}
    </View>
  );
}

