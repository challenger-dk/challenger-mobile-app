import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { getMyInvitations } from '../../api/invitations';
import { getCurrentUser } from '../../api/users';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import type { Invitation } from '../../types/invitation';
import type { User } from '../../types/user';
import { InvitationCard } from '../InvitationCard';
import { EmptyState, LoadingScreen, Avatar } from '../common';
import { SuggestedFriendsSection } from './SuggestedFriendsSection';
import { UserSearchResults } from './UserSearchResults';

export function FriendsContent() {
  const router = useRouter();
  const { user, loading: userLoading, error: userError } = useCurrentUser();
  const [friends, setFriends] = useState<User[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;

    try {
      const [freshUser, myInvitations] = await Promise.all([
        getCurrentUser(),
        getMyInvitations(),
      ]);

      const myFriends: User[] = freshUser.friends || [];
      const myFriendIds = new Set(myFriends.map((f: User) => f.id));
      myFriendIds.add(user.id);

      const pendingInvitations = Array.isArray(myInvitations)
        ? myInvitations.filter(
            (inv: Invitation) =>
              inv.resource_type === 'friend' && inv.status === 'pending'
          )
        : [];

      setFriends(myFriends);
      setInvitations(pendingInvitations);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      setLoading(true);
      loadData().finally(() => setLoading(false));
    }
  }, [loadData, user]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleInvitationHandled = () => {
    loadData();
  };

  // Memoize friend IDs for efficient lookup
  const friendIds = useMemo(() => {
    const ids = new Set(friends.map((f: User) => f.id));
    if (user) {
      ids.add(user.id);
    }
    return ids;
  }, [friends, user]);

  const renderFriendCard = (friend: User) => (
    <Pressable
      key={friend.id}
      onPress={() => router.push(`/users/${friend.id}` as any)}
      className="flex-row items-center justify-between bg-surface rounded-2xl p-4 mb-3"
    >
      <View className="flex-row items-center gap-3">
        <Avatar
          uri={friend.profile_picture}
          size={40}
          placeholderIcon="person"
        />
        <View>
          <Text className="text-text text-base font-semibold">
            {friend.first_name} {friend.last_name}
          </Text>
          <Text className="text-sm text-text-muted">Tryk for at se profil</Text>
        </View>
      </View>
    </Pressable>
  );

  if (loading || userLoading) {
    return <LoadingScreen />;
  }

  if (userError) {
    return (
      <View className="flex-1 justify-center items-center p-5 bg-background">
        <Text className="text-danger text-center">{userError.message}</Text>
      </View>
    );
  }

  const isSearching = search.length > 0;

  return (
    <ScrollView
      className="flex-1 bg-background"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#fff"
        />
      }
    >
      <View className="px-6 py-4">
        <View className="mb-5">
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Søg efter venner..."
            placeholderTextColor="#9CA3AF"
            className="w-full bg-surface text-text p-3 rounded-lg border border-text-disabled"
            style={{ color: '#ffffff' }}
          />
        </View>

        {isSearching ? (
          /* When searching, only show search results */
          <UserSearchResults searchQuery={search} currentFriendIds={friendIds} />
        ) : (
          /* When not searching, show invitations, suggestions, and friends */
          <>
            {invitations.length > 0 && (
              <View className="mb-6">
                <Text className="text-text-muted text-sm mb-3">Invitationer</Text>
                {invitations.map((inv) => (
                  <InvitationCard
                    key={inv.id}
                    invitation={inv}
                    onInvitationHandled={handleInvitationHandled}
                  />
                ))}
              </View>
            )}

            <SuggestedFriendsSection />

            {/* Mine venner */}
            <View className="mb-6">
              <Text className="text-text-muted text-sm mb-3">Mine venner</Text>
              {friends.map(renderFriendCard)}
              {friends.length === 0 && (
                <EmptyState
                  title="Ingen venner"
                  description="Du har ingen venner endnu."
                  icon="people-outline"
                />
              )}
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}
