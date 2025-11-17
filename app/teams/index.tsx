import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import { getInvitationsByUser } from '@/api/invitations';
import { getTeams, getTeamsByUser } from '@/api/teams';
import { LoadingScreen } from '@/components/common';
import { InvitationCard } from '@/components/InvitationCard';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import type { Invitation } from '@/types/invitation';
import type { Team } from '@/types/team';
import { SafeAreaView } from 'react-native-safe-area-context'; // Import SafeAreaView

export default function TeamsScreen() {
  const router = useRouter();
  const { user } = useCurrentUser();
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [otherTeams, setOtherTeams] = useState<Team[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Encapsulate data loading in a useCallback
  const loadData = useCallback(async () => {
    if (!user) return;

    try {
      const [allTeams, userTeams, userInvitations] = await Promise.all([
        getTeams(),
        getTeamsByUser(String(user.id)),
        getInvitationsByUser(user.id),
      ]);

      // Team logic
      const myIds = new Set(userTeams.map((t: Team) => t.id));
      const others = allTeams.filter((t: Team) => !myIds.has(t.id));
      setMyTeams(userTeams);
      setOtherTeams(others);

      // Invitation logic
      const pendingTeamInvitations = userInvitations.filter(
        (inv: Invitation) => inv.resource_type === 'team' && inv.status === 'pending'
      );
      setInvitations(pendingTeamInvitations);
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

  // This function will be passed to the card to reload all data
  const handleInvitationHandled = () => {
    // Re-load all data to update both invitations and team lists
    loadData();
  };

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

  if (loading || !user) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView className="flex-1 bg-black" edges={['top']}>
      <ScrollView
        className="flex-1 p-5"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
      >
        {/* Updated Header */}
        <View className="flex-row justify-between items-center mb-5 border-b border-gray-700 pb-2">
          {/* Back Button */}
          <Pressable onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="chevron-back" size={28} color="#ffffff" />
          </Pressable>

          {/* Tabs */}
          <View className="flex-row gap-8">
            <Pressable onPress={() => router.replace('/friends' as any)}>
              <Text className="text-gray-400 text-lg">Venner</Text>
            </Pressable>
            <View className="border-b-2 border-orange-500 pb-1">
              <Text className="text-white text-lg">Hold</Text>
            </View>
            <Pressable onPress={() => router.push('/chat' as any)}>
              <Text className="text-gray-400 text-lg">Chat</Text>
            </Pressable>
          </View>

          {/* Add Button */}
          <Pressable onPress={() => router.push('/teams/createTeam')} className="p-2 -mr-2">
            <Ionicons name="add" size={28} color="#ffffff" />
          </Pressable>
        </View>

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Navn"
          placeholderTextColor="#9CA3AF"
          className="w-full bg-[#2C2C1E] text-white p-3 rounded-lg mb-5"
          style={{ color: '#ffffff' }}
        />

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
          <Text className="text-gray-300 text-sm mb-3">Mine hold</Text>
          {filterTeams(myTeams).map(renderTeamCard)}
          {filterTeams(myTeams).length === 0 && (
            <Text className="text-gray-500 text-sm">Ingen hold endnu.</Text>
          )}
        </View>

        <View className="mb-6">
          <Text className="text-gray-300 text-sm mb-3">Andre hold</Text>
          {filterTeams(otherTeams).map(renderTeamCard)}
          {filterTeams(otherTeams).length === 0 && (
            <Text className="text-gray-500 text-sm">Ingen andre hold fundet.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}