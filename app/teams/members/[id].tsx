import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getTeam } from '@/api/teams';
import { LoadingScreen, ScreenHeader } from '@/components/common';
import { UserCard } from '@/components/users/UserCard';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import type { Team } from '@/types/team';

export default function TeamMembersScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user: currentUser } = useCurrentUser();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTeam = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await getTeam(id);
        setTeam(data);
      } catch (err) {
        console.error('Failed to load team:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTeam();
  }, [id]);

  if (loading || !currentUser) {
    return <LoadingScreen message="Indlæser medlemmer..." />;
  }

  if (!team) {
    return (
      <View className="flex-1 bg-black justify-center items-center px-5">
        <Text className="text-white">Hold ikke fundet.</Text>
      </View>
    );
  }

  const isCreator = team.creator.id === currentUser.id;

  return (
    <SafeAreaView className="flex-1 bg-black" edges={['top']}>
      <ScreenHeader title={team.name} />
      <ScrollView className="flex-1 px-5 pb-20">
        <Text className="text-gray-300 text-sm mb-3">Medlemmer ({team.users?.length ?? 0})</Text>
        {team.users && team.users.length > 0 ? (
          team.users.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onPress={() => {
                // Redirect to own profile if clicking self, otherwise to user profile
                if (user.id === currentUser.id) {
                  router.push('/(tabs)/profile' as any);
                } else {
                  router.push(`/users/${user.id}` as any);
                }
              }}
              rightAction={
                isCreator && user.id !== currentUser.id ? (
                  <Pressable className="bg-[#575757] rounded-full px-4 py-2">
                    <Text className="text-white text-xs font-medium">Fjern</Text>
                  </Pressable>
                ) : user.id === team.creator.id ? (
                  <View className="bg-gray-700 rounded-full px-4 py-2">
                    <Text className="text-white text-xs font-medium">Ejer</Text>
                  </View>
                ) : null
              }
            />
          ))
        ) : (
          <Text className="text-gray-500 text-sm">Der er ingen medlemmer på dette hold endnu.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}