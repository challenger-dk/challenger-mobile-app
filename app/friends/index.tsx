import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SendInvitation } from '../../api/invitations';
import { getUsers } from '../../api/users'; // Removed getUserById
import { LoadingScreen, ScreenHeader } from '../../components/common'; // Import ScreenHeader
import { useCurrentUser } from '../../hooks/useCurrentUser';
import type { CreateInvitation } from '../../types/invitation'; // Import CreateInvitation
import type { User } from '../../types/user';

export default function FriendsScreen() {
  const router = useRouter();
  const { user, loading: userLoading, error: userError } = useCurrentUser();
  const [friends, setFriends] = useState<User[]>([]);
  const [otherUsers, setOtherUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Encapsulate data loading
  const loadData = useCallback(async () => {
    if (!user) return;

    try {
      // FIX: Removed Promise.all and getUserById.
      // Get friends directly from the user object from the hook.
      const myFriends: User[] = user.friends || [];
      const myFriendIds = new Set(myFriends.map((f: User) => f.id));
      myFriendIds.add(user.id); // Add self to filter

      // Fetch all other users
      const allUsers = await getUsers();

      // Filter all users to find who is NOT a friend and NOT the user themselves
      const others = allUsers.filter((u: User) => !myFriendIds.has(u.id));

      setFriends(myFriends);
      setOtherUsers(others);
    } catch (err) {
      console.error('Failed to load data:', err);
      Alert.alert('Fejl', 'Kunne ikke hente data.');
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    if (user) {
      setLoading(true);
      loadData().finally(() => setLoading(false));
    }
  }, [loadData, user]);

  // Handle pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // Handle sending a new friend request
  const handleAddFriend = async (inviteeId: number | string) => {
    if (!user) return;

    const numericInviterId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
    const numericInviteeId = typeof inviteeId === 'string' ? parseInt(inviteeId, 10) : inviteeId;

    try {
      const invitation: CreateInvitation = {
        inviter_id: numericInviterId,
        invitee_id: numericInviteeId,
        note: `${user.first_name} har sendt der en venneanmodning`, // Added note
        resource_type: 'friend'
        // resource_id is omitted as it's optional
      };

      await SendInvitation(invitation);
      Alert.alert('Success', 'Venneanmodning sendt!');
      // Reload data to move user from 'other users' list
      loadData();
    } catch (err) {
      console.error('Failed to send invitation:', err);
      Alert.alert('Fejl', 'Kunne ikke sende venneanmodning.');
    }
  };

  const filterUsers = (users: User[]) =>
    users.filter((u) =>
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(search.toLowerCase())
    );

  // Card for current friends
  const renderFriendCard = (friend: User) => (
    <Pressable
      key={friend.id}
      onPress={() => router.push(`/users/${friend.id}` as any)} // Correct navigation to user profile
      className="flex-row items-center justify-between bg-[#1C1C1E] rounded-2xl p-4 mb-3"
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

  // Card for other users (with an "add" button)
  const renderOtherUserCard = (otherUser: User) => (
    // Changed View to Pressable to make the whole card clickable
    <Pressable
      key={otherUser.id}
      onPress={() => router.push(`/users/${otherUser.id}` as any)} // Navigate to user profile
      className="flex-row items-center justify-between bg-[#1C1C1E] rounded-2xl p-4 mb-3"
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
      {/* Add Friend Button - Use a separate Pressable to prevent bubbling if needed, or keep it simple */}
      <Pressable
        onPress={(e) => {
          e.stopPropagation(); // Prevent navigating to profile when clicking add
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

  // Handle user loading error
  if (userError) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <ScreenHeader title="Venner" />
        <View className="flex-1 justify-center items-center p-5">
          <Text className="text-red-500 text-center">{userError.message}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black" edges={['top']}>
      {/* Added ScreenHeader for layout consistency and back button */}
      <ScreenHeader
        title=""
        rightAction={
          <Pressable onPress={() => {}} className="p-2">
            <Ionicons name="add" size={28} color="#ffffff" />
          </Pressable>
        }
      />

      <ScrollView
        className="flex-1 px-5"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
      >
        {/* Header matching the image's tabs */}
        <View className="flex-row justify-center items-center mb-5 border-b border-gray-700 pb-2">
          <View className="flex-row gap-8">
            <View className="border-b-2 border-orange-500 pb-1">
              <Text className="text-white text-lg">Venner</Text>
            </View>
            <Pressable onPress={() => router.push('/chat' as any)}>
              <Text className="text-gray-400 text-lg">Chat</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/teams' as any)}>
              <Text className="text-gray-400 text-lg">Hold</Text>
            </Pressable>
          </View>
        </View>

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Søg efter venner..."
          placeholderTextColor="#9CA3AF"
          className="w-full bg-[#1C1C1E] text-white p-3 rounded-lg mb-5 border border-[#2c2c2c]"
          style={{ color: '#ffffff' }}
        />

        <View className="mb-6">
          <Text className="text-gray-300 text-sm mb-3">Mine venner</Text>
          {filterUsers(friends).map(renderFriendCard)}
          {filterUsers(friends).length === 0 && (
            <Text className="text-gray-500 text-sm">Du har ingen venner endnu.</Text>
          )}
        </View>

        <View className="mb-6">
          <Text className="text-gray-300 text-sm mb-3">Find nye venner</Text>
          {filterUsers(otherUsers).map(renderOtherUserCard)}
          {filterUsers(otherUsers).length === 0 && search.length > 0 && (
            <Text className="text-gray-500 text-sm">Ingen brugere fundet.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}