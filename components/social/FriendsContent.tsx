import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import { SendInvitation, getMyInvitations } from '../../api/invitations';
import { getCurrentUser, getUsers } from '../../api/users';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import type { CreateInvitation, Invitation } from '../../types/invitation';
import type { User } from '../../types/user';
import { showErrorToast, showSuccessToast } from '../../utils/toast';
import { InvitationCard } from '../InvitationCard';
import { LoadingScreen } from '../common';

export function FriendsContent() {
  const router = useRouter();
  const { user, loading: userLoading, error: userError } = useCurrentUser();
  const [friends, setFriends] = useState<User[]>([]);
  const [otherUsers, setOtherUsers] = useState<User[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch fresh user data (for friends), all users, and invitations in parallel
      const [freshUser, allUsers, myInvitations] = await Promise.all([
        getCurrentUser(),
        getUsers(),
        getMyInvitations()
      ]);

      // Use the fresh user object to get the latest friends list
      const myFriends: User[] = freshUser.friends || [];
      const myFriendIds = new Set(myFriends.map((f: User) => f.id));
      myFriendIds.add(user.id);

      const others = allUsers.filter((u: User) => !myFriendIds.has(u.id));

      // Filter for pending friend invitations
      const pendingInvitations = Array.isArray(myInvitations)
        ? myInvitations.filter((inv: Invitation) =>
          inv.resource_type === 'friend' && inv.status === 'pending'
        )
        : [];

      setFriends(myFriends);
      setOtherUsers(others);
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

  const handleAddFriend = async (inviteeId: number | string) => {
    if (!user) return;

    const numericInviterId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
    const numericInviteeId = typeof inviteeId === 'string' ? parseInt(inviteeId, 10) : inviteeId;

    try {
      const invitation: CreateInvitation = {
        inviter_id: numericInviterId,
        invitee_id: numericInviteeId,
        note: `${user.first_name} har sendt der en venneanmodning`,
        resource_type: 'friend'
      };

      await SendInvitation(invitation);
      showSuccessToast('Venneanmodning sendt!');
      loadData();
    } catch (err) {
      console.error('Failed to send invitation:', err);
      showErrorToast('Kunne ikke sende venneanmodning.');
    }
  };

  const filterUsers = (users: User[]) =>
    users.filter((u) =>
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(search.toLowerCase())
    );

  const renderFriendCard = (friend: User) => (
    <Pressable
      key={friend.id}
      onPress={() => router.push(`/users/${friend.id}` as any)}
      className="flex-row items-center justify-between bg-[#2c2c2c] rounded-2xl p-4 mb-3"
    >
      <View className="flex-row items-center gap-3">
        <View className="bg-gray-700 rounded-full p-3">
          <Ionicons name="person" size={24} color="#ffffff" />
        </View>
        <View>
          <Text className="text-white text-base font-semibold">
            {friend.first_name} {friend.last_name}
          </Text>
          <Text className="text-sm text-gray-400">Tryk for at se profil</Text>
        </View>
      </View>
    </Pressable>
  );

  const renderOtherUserCard = (otherUser: User) => (
    <Pressable
      key={otherUser.id}
      onPress={() => router.push(`/users/${otherUser.id}` as any)}
      className="flex-row items-center justify-between bg-[#2c2c2c] rounded-2xl p-4 mb-3"
    >
      <View className="flex-row items-center gap-3">
        <View className="bg-gray-700 rounded-full p-3">
          <Ionicons name="person" size={24} color="#ffffff" />
        </View>
        <View>
          <Text className="text-white text-base font-semibold">
            {otherUser.first_name} {otherUser.last_name}
          </Text>
        </View>
      </View>
      <Pressable
        onPress={(e) => {
          e.stopPropagation();
          handleAddFriend(otherUser.id);
        }}
        className="bg-orange-500 rounded-full p-2"
      >
        <Ionicons name="add" size={20} color="#ffffff" />
      </Pressable>
    </Pressable>
  );

  if (loading || userLoading) {
    return <LoadingScreen />;
  }

  if (userError) {
    return (
      <View className="flex-1 justify-center items-center p-5">
        <Text className="text-red-500 text-center">{userError.message}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
    >
      <View className="px-6 py-4">
        <View className="mb-5">
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Søg efter venner..."
            placeholderTextColor="#9CA3AF"
            className="w-full bg-[#2c2c2c] text-white p-3 rounded-lg border border-[#575757]"
            style={{ color: '#ffffff' }}
          />
        </View>

        {invitations.length > 0 && (
          <View className="mb-6">
            <Text className="text-gray-300 text-sm mb-3">Invitationer</Text>
            {invitations.map((inv) => (
              <InvitationCard
                key={inv.id}
                invitation={inv}
                onInvitationHandled={handleInvitationHandled}
              />
            ))}
          </View>
        )}

        <View className="mb-6">
          <Text className="text-gray-300 text-sm mb-3">Mine venner</Text>
          {filterUsers(friends).map(renderFriendCard)}
          {filterUsers(friends).length === 0 && (
            <Text className="text-[#575757] text-sm">Du har ingen venner endnu.</Text>
          )}
        </View>

        <View className="mb-6">
          <Text className="text-gray-300 text-sm mb-3">Find nye venner</Text>
          {filterUsers(otherUsers).map(renderOtherUserCard)}
          {filterUsers(otherUsers).length === 0 && search.length > 0 && (
            <Text className="text-[#575757] text-sm">Ingen brugere fundet.</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

