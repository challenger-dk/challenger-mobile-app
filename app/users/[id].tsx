import { getUserById } from '@/api/users';
import { ScreenHeader } from '@/components/common';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { PublicUser } from '@/types/user';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user: currentUser } = useCurrentUser();

  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFriend, setIsFriend] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      if (!id) return;

      try {
        setLoading(true);
        // 1. Fetch the specific user
        const fetchedUser = await getUserById(id);
        setUser(fetchedUser);

        // 2. Check if this user is already a friend
        if (currentUser && currentUser.friends) {
          // Convert to string to ensure safe comparison
          const isFriendCheck = currentUser.friends.some(
            (friend) => String(friend.id) === String(fetchedUser.id)
          );
          setIsFriend(isFriendCheck);
        }

      } catch (err) {
        console.error('Failed to load user:', err);
        Alert.alert('Fejl', 'Kunne ikke hente bruger.');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [currentUser, id, router]);

  // Placeholder handlers
  const handleAddFriend = () => {
    Alert.alert('Friend Request', `Friend request sent to ${user?.first_name}`);
  };

  const handleUnfriend = () => {
    Alert.alert('Unfriend', `Removed ${user?.first_name} from friends`);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#171616] justify-center items-center">
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 bg-[#171616] justify-center items-center">
        <Text className="text-white">Bruger ikke fundet</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-[#171616]">
      <ScreenHeader
        title="Venner"
        rightAction={
          // 3. Conditional Button Logic
          isFriend ? (
            <Pressable onPress={handleUnfriend} className="bg-[#575757] px-4 py-2 rounded-full">
              <Text className="text-white text-xs font-medium">Fjern ven</Text>
            </Pressable>
          ) : (
            <Pressable onPress={handleAddFriend} className="bg-green-600 px-4 py-2 rounded-full">
              <Text className="text-white text-xs font-medium">Tilføj ven</Text>
            </Pressable>
          )
        }
      />

      <ScrollView className="flex-1 px-6">
        {/* Profile Header */}
        <View className="flex-row items-center mb-8">
          {user.profile_picture ? (
            <Image
              //source={{ uri: user.profile_picture }}
              className="w-20 h-20 rounded-full mr-4"
              contentFit="cover"
            />
          ) : (
            <View className="w-20 h-20 rounded-full bg-[#575757] items-center justify-center mr-4">
              <Ionicons name="person" size={40} color="#ffffff" />
            </View>
          )}
          <View className="flex-1">
            <Text className="text-white text-xl font-bold">
              {user.first_name} {user.last_name || ''}
            </Text>
            <Text className="text-gray-400 text-base">
              {/* Casting to any if 'age' isn't in your User type yet */}
              {(user as any).age ? `${(user as any).age} år` : ''}
            </Text>
          </View>
          <View>
            <Ionicons name="chatbubble-ellipses-outline" size={24} color="white" />
          </View>
        </View>

        {/* Last Time Together Box */}
        <View className="bg-[#2c2c2c] p-4 rounded-lg mb-6 h-32 justify-center">
          <Text className="text-gray-400 text-sm">Sidst i var sammen..</Text>
        </View>

        {/* Hardcoded Common Stats Sections */}

        {/* Common Friends */}
        <View className="flex-row items-center justify-between bg-[#2c2c2c] p-4 rounded-lg mb-2">
          <Text className="text-white text-base font-medium">Fællesvenner</Text>
          <View className="flex-row items-center gap-2">
            <Text className="text-white text-base font-bold">34x</Text>
            <Ionicons name="people" size={20} color="#3b82f6" />
          </View>
        </View>

        {/* Common Teams */}
        <View className="flex-row items-center justify-between bg-[#2c2c2c] p-4 rounded-lg mb-2">
          <Text className="text-white text-base font-medium">Fælleshold</Text>
          <View className="flex-row items-center gap-2">
            <Text className="text-white text-base font-bold">2x</Text>
            <Ionicons name="shield" size={20} color="#22c55e" />
          </View>
        </View>

        {/* Common Favorites */}
        <View className="bg-[#2c2c2c] p-4 rounded-lg mb-2">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-white text-base font-medium">Fællesfavoritter</Text>
            <View className="flex-row items-center gap-2">
              <Text className="text-white text-base font-bold">4x</Text>
              <Ionicons name="star" size={20} color="#f59e0b" />
            </View>
          </View>
          {/* Hardcoded Sports Icons */}
          <View className="flex-row justify-end gap-3">
            <Ionicons name="tennisball" size={28} color="#dfdfdf" />
            <Ionicons name="football" size={28} color="#dfdfdf" />
            <Ionicons name="basketball" size={28} color="#dfdfdf" />
            <Ionicons name="baseball" size={28} color="#dfdfdf" />
          </View>
        </View>

      </ScrollView>
    </View>
  );
}