import { SendInvitation } from '@/api/invitations';
import { Avatar, EmptyState } from '@/components/common';
import { useSuggestedFriends } from '@/hooks/queries/useUsers';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { queryKeys } from '@/lib/queryClient';
import type { CreateInvitation } from '@/types/invitation';
import type { User } from '@/types/user';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

interface SuggestedFriendsSectionProps {
  searchQuery?: string;
}

export function SuggestedFriendsSection({ searchQuery = '' }: SuggestedFriendsSectionProps) {
  const router = useRouter();
  const { user: currentUser } = useCurrentUser();
  const { data: suggestedFriends, isLoading, error } = useSuggestedFriends();
  const queryClient = useQueryClient();
  const [sendingInvites, setSendingInvites] = useState<Set<number>>(new Set());

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
      queryClient.invalidateQueries({ queryKey: queryKeys.users.suggestedFriends() });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.current() });
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

  const filterUsers = (users: User[]) => {
    if (!searchQuery) return users;
    return users.filter((u) =>
      `${u.first_name} ${u.last_name}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  };

  if (isLoading) {
    return (
      <View className="mb-6">
        <Text className="text-text-muted text-sm mb-3">Foreslåede venner</Text>
        <View className="items-center justify-center py-8">
          <ActivityIndicator size="large" color="#F59E0B" />
        </View>
      </View>
    );
  }

  if (error) {
    return null; // Silently fail - suggestions are optional
  }

  const suggestions = suggestedFriends || [];
  const filteredSuggestions = filterUsers(suggestions);

  if (filteredSuggestions.length === 0) {
    return null; // Don't show section if no suggestions
  }

  return (
    <View className="mb-6">
      <View className="flex-row items-center gap-2 mb-3">
        <Ionicons name="sparkles" size={16} color="#F59E0B" />
        <Text className="text-text-muted text-sm">Foreslåede venner</Text>
      </View>
      
      {filteredSuggestions.map((suggestion) => {
        const isSending = sendingInvites.has(
          typeof suggestion.id === 'string' ? parseInt(suggestion.id, 10) : suggestion.id
        );

        return (
          <Pressable
            key={suggestion.id}
            onPress={() => router.push(`/users/${suggestion.id}` as any)}
            className="flex-row items-center justify-between bg-surface rounded-2xl p-4 mb-3"
          >
            <View className="flex-row items-center gap-3 flex-1">
              <Avatar
                uri={suggestion.profile_picture}
                size={40}
                placeholderIcon="person"
              />
              <View className="flex-1">
                <Text className="text-text text-base font-semibold">
                  {suggestion.first_name} {suggestion.last_name}
                </Text>
                <Text className="text-xs text-text-muted">
                  Baseret på fælles interesser
                </Text>
              </View>
            </View>
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                handleAddFriend(suggestion.id);
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

