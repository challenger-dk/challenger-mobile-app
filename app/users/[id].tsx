import { getUserById, getUserCommonStats, removeFriend } from '@/api/users';
import { Avatar, ScreenContainer, ScreenHeader } from '@/components/common';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { queryKeys } from '@/lib/queryClient';
import { CommonStats, PublicUser } from '@/types/user';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';

const getSportIcon = (sportName: string) => {
  const name = sportName.toLowerCase();
  if (name.includes('fodbold') || name.includes('soccer')) return 'football';
  if (name.includes('basket')) return 'basketball';
  if (name.includes('tennis')) return 'tennisball';
  if (name.includes('base')) return 'baseball';
  return 'trophy';
};

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user: currentUser } = useCurrentUser();
  const queryClient = useQueryClient();

  const [user, setUser] = useState<PublicUser | null>(null);
  const [commonStats, setCommonStats] = useState<CommonStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFriend, setIsFriend] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const [fetchedUser, fetchedStats] = await Promise.all([
          getUserById(id),
          getUserCommonStats(id)
        ]);

        setUser(fetchedUser);
        setCommonStats(fetchedStats);

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
    if (!user) return;

    Alert.alert(
      'Fjern ven',
      `Er du sikker på, at du vil fjerne ${user.first_name} fra dine venner?`,
      [
        { text: 'Annuller', style: 'cancel' },
        {
          text: 'Fjern',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFriend(String(user.id));
              setIsFriend(false);
              showSuccessToast(`${user.first_name} er blevet fjernet som ven.`);
              queryClient.invalidateQueries({ queryKey: queryKeys.users.current() });
              queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(user.id) });
            } catch (err) {
              console.error('Failed to remove friend:', err);
              showErrorToast('Kunne ikke fjerne ven.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <ScreenContainer className="justify-center items-center">
        <ActivityIndicator size="large" color="#ffffff" />
      </ScreenContainer>
    );
  }

  if (!user) {
    return (
      <ScreenContainer className="justify-center items-center">
        <Text className="text-text">Bruger ikke fundet</Text>
      </ScreenContainer>
    )
  }

  return (
    <ScreenContainer>
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
        <View className="flex-row items-center mb-8">
          <Avatar
            uri={user.profile_picture}
            size={80}
            placeholderIcon="person"
            className="mr-4"
          />
          <View className="flex-1">
            <Text className="text-text text-xl font-bold">
              {user.first_name} {user.last_name || ''}
            </Text>
            <Text className="text-text-muted text-base">
              {(user as any).age ? `${(user as any).age} år` : ''}
            </Text>
          </View>
          <View>
            <Ionicons name="chatbubble-ellipses-outline" size={24} color="white" />
          </View>
        </View>

        <View className="bg-surface p-4 rounded-lg mb-6 h-32 justify-center">
          <Text className="text-text-muted text-sm">Sidst i var sammen..</Text>
        </View>

        <View className="flex-row items-center justify-between bg-surface p-4 rounded-lg mb-2">
          <Text className="text-text text-base font-medium">Fællesvenner</Text>
          <View className="flex-row items-center gap-2">
            <Text className="text-text text-base font-bold">
              {commonStats?.common_friends_count ?? 0}
            </Text>
            <Ionicons name="people" size={20} color="#3b82f6" />
          </View>
        </View>

        <View className="flex-row items-center justify-between bg-surface p-4 rounded-lg mb-2">
          <Text className="text-text text-base font-medium">Fælleshold</Text>
          <View className="flex-row items-center gap-2">
            <Text className="text-text text-base font-bold">
              {commonStats?.common_teams_count ?? 0}
            </Text>
            <Ionicons name="shield" size={20} color="#22c55e" />
          </View>
        </View>

        <View className="bg-surface p-4 rounded-lg mb-2">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-text text-base font-medium">Fællesfavoritter</Text>
            <View className="flex-row items-center gap-2">
              <Text className="text-text text-base font-bold">
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
              <Text className="text-text-muted text-xs">Ingen fælles sport</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
