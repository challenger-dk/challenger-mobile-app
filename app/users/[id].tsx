import { getUserById, getUserCommonStats } from '@/api/users'; // Imported new function
import { ScreenHeader } from '@/components/common';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { PublicUser, CommonStats } from '@/types/user'; // Imported type
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';

// Helper to map sport names to Ionicons (basic mapping)
const getSportIcon = (sportName: string) => {
  const name = sportName.toLowerCase();
  if (name.includes('fodbold') || name.includes('soccer')) return 'football';
  if (name.includes('basket')) return 'basketball';
  if (name.includes('tennis')) return 'tennisball';
  if (name.includes('base')) return 'baseball';
  return 'trophy'; // Default
};

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user: currentUser } = useCurrentUser();

  const [user, setUser] = useState<PublicUser | null>(null);
  const [commonStats, setCommonStats] = useState<CommonStats | null>(null); // New State
  const [loading, setLoading] = useState(true);
  const [isFriend, setIsFriend] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;

      try {
        setLoading(true);

        // Parallel fetching for performance
        const [fetchedUser, fetchedStats] = await Promise.all([
          getUserById(id),
          getUserCommonStats(id)
        ]);

        setUser(fetchedUser);
        setCommonStats(fetchedStats);

        // Check friend status
        if (currentUser && currentUser.friends) {
          const isFriendCheck = currentUser.friends.some(
            (friend) => String(friend.id) === String(fetchedUser.id)
          );
          setIsFriend(isFriendCheck);
        }

      } catch (err) {
        console.error('Failed to load user data:', err);
        Alert.alert('Fejl', 'Kunne ikke hente brugerdata.');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser, id, router]);

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
        title="Profil"
        rightAction={
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
              // source={{ uri: user.profile_picture }}
              className="w-20 h-20 rounded-full mr-4 bg-[#575757]"
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
              {(user as any).age ? `${(user as any).age} år` : ''}
            </Text>
          </View>
          <View>
            <Ionicons name="chatbubble-ellipses-outline" size={24} color="white" />
          </View>
        </View>

        {/* Last Time Together Box (Static for now, hard to calculate without heavy tracking) */}
        <View className="bg-[#2c2c2c] p-4 rounded-lg mb-6 h-32 justify-center">
          <Text className="text-gray-400 text-sm">Sidst i var sammen..</Text>
        </View>

        {/* --- DYNAMIC STATS SECTIONS --- */}

        {/* Common Friends */}
        <View className="flex-row items-center justify-between bg-[#2c2c2c] p-4 rounded-lg mb-2">
          <Text className="text-white text-base font-medium">Fællesvenner</Text>
          <View className="flex-row items-center gap-2">
            <Text className="text-white text-base font-bold">
              {commonStats?.common_friends_count ?? 0}
            </Text>
            <Ionicons name="people" size={20} color="#3b82f6" />
          </View>
        </View>

        {/* Common Teams */}
        <View className="flex-row items-center justify-between bg-[#2c2c2c] p-4 rounded-lg mb-2">
          <Text className="text-white text-base font-medium">Fælleshold</Text>
          <View className="flex-row items-center gap-2">
            <Text className="text-white text-base font-bold">
              {commonStats?.common_teams_count ?? 0}
            </Text>
            <Ionicons name="shield" size={20} color="#22c55e" />
          </View>
        </View>

        {/* Common Favorites / Sports */}
        <View className="bg-[#2c2c2c] p-4 rounded-lg mb-2">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-white text-base font-medium">Fællesfavoritter</Text>
            <View className="flex-row items-center gap-2">
              <Text className="text-white text-base font-bold">
                {commonStats?.common_sports?.length ?? 0}
              </Text>
              <Ionicons name="star" size={20} color="#f59e0b" />
            </View>
          </View>

          <View className="flex-row justify-end gap-3 flex-wrap">
            {commonStats?.common_sports && commonStats.common_sports.length > 0 ? (
              commonStats.common_sports.map((sport) => (
                <Ionicons
                  key={sport.id}
                  name={getSportIcon(sport.name) as any}
                  size={28}
                  color="#dfdfdf"
                />
              ))
            ) : (
              <Text className="text-[#575757] text-xs">Ingen fælles sport</Text>
            )}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}