import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { getTeams, getTeamsByUser } from '../../api/teams';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import type { Team } from '../../types/team';

export default function TeamsScreen() {
  const router = useRouter();
  const { user } = useCurrentUser();
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [otherTeams, setOtherTeams] = useState<Team[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTeams = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const allTeams = await getTeams();
        const userTeams = await getTeamsByUser(String(user.id));

        const myIds = new Set(userTeams.map((t: Team) => t.id));
        const others = allTeams.filter((t: Team) => !myIds.has(t.id));

        setMyTeams(userTeams);
        setOtherTeams(others);
      } catch (err) {
        console.error('Failed to load teams:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTeams();
  }, [user]);

  const filterTeams = (teams: Team[]) =>
    teams.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()));

  const renderTeamCard = (team: Team) => (
    <Pressable
      key={team.id}
      onPress={() => router.push(`/teams/${team.id}` as any)}
      className="flex-row items-center justify-between bg-[#1C1C1E] rounded-2xl p-4 mb-3"
    >
      <View className="flex-row items-center gap-3">
        <View className="bg-green-600 rounded-xl p-3">
          <Ionicons name="shield" size={24} color="#ffffff" />
        </View>
        <View>
          <Text className="text-white text-base font-semibold">{team.name}</Text>
          <Text className="text-sm text-gray-400">
            Medlemmer: {team.users?.length ?? 0}x
          </Text>
        </View>
      </View>
      <Text className="text-xs text-gray-400">Fodboldhold</Text>
    </Pressable>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#ffffff" />
        <Text className="text-white mt-4">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <ScrollView className="flex-1 p-5">
        {/* Header Tabs */}
        <View className="flex-row justify-center gap-8 mb-5 border-b border-gray-700 pb-2">
          <Pressable>
            <Text className="text-gray-400">Venner</Text>
          </Pressable>
          <View className="border-b-2 border-orange-500 pb-1">
            <Text className="text-white">Hold</Text>
          </View>
        </View>

        {/* Search */}
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Navn"
          placeholderTextColor="#9CA3AF"
          className="w-full bg-[#2C2C2E] text-white p-3 rounded-lg mb-5"
          style={{ color: '#ffffff' }}
        />

        {/* My Teams */}
        <View className="mb-6">
          <Text className="text-gray-300 text-sm mb-3">Mine hold</Text>
          {filterTeams(myTeams).map(renderTeamCard)}
          {filterTeams(myTeams).length === 0 && (
            <Text className="text-gray-500 text-sm">Ingen hold endnu.</Text>
          )}
        </View>

        {/* Other Teams */}
        <View className="mb-6">
          <Text className="text-gray-300 text-sm mb-3">Andre hold</Text>
          {filterTeams(otherTeams).map(renderTeamCard)}
          {filterTeams(otherTeams).length === 0 && (
            <Text className="text-gray-500 text-sm">Ingen andre hold fundet.</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

