import { LoadingScreen } from '@/components/common';
import { InvitationCard } from '@/components/InvitationCard';
import { useInvitationsByUser, useTeams, useTeamsByUser } from '@/hooks/queries';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import type { Invitation } from '@/types/invitation';
import type { Team } from '@/types/team';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TeamsScreen() {
  const router = useRouter();
  const { user } = useCurrentUser();

  // React Query hooks - automatically handle caching, loading, and error states
  const {
    data: allTeams = [],
    isLoading: teamsLoading,
    isRefetching: teamsRefetching,
    refetch: refetchTeams,
  } = useTeams();

  const {
    data: userTeams = [],
    isLoading: userTeamsLoading,
    isRefetching: userTeamsRefetching,
    refetch: refetchUserTeams,
  } = useTeamsByUser(user?.id ?? '');

  const {
    data: userInvitations = [],
    isLoading: invitationsLoading,
    isRefetching: invitationsRefetching,
    refetch: refetchInvitations,
  } = useInvitationsByUser(user?.id ?? 0);

  const [search, setSearch] = useState('');

  // Compute derived state from queries
  const { myTeams, otherTeams, invitations } = useMemo(() => {
    const myIds = new Set(userTeams.map((t: Team) => t.id));
    const others = allTeams.filter((t: Team) => !myIds.has(t.id));
    const pendingTeamInvitations = userInvitations.filter(
      (inv: Invitation) => inv.resource_type === 'team' && inv.status === 'pending'
    );
    return {
      myTeams: userTeams,
      otherTeams: others,
      invitations: pendingTeamInvitations,
    };
  }, [allTeams, userTeams, userInvitations]);

  // Combined loading state
  const loading = teamsLoading || userTeamsLoading || invitationsLoading;
  const refreshing = teamsRefetching || userTeamsRefetching || invitationsRefetching;

  // Handle pull-to-refresh - React Query handles the refreshing state automatically
  const onRefresh = async () => {
    await Promise.all([refetchTeams(), refetchUserTeams(), refetchInvitations()]);
  };

  // This function is called when an invitation is handled
  // React Query will automatically refetch when mutations invalidate the cache
  const handleInvitationHandled = () => {
    // The cache invalidation in the mutation hooks will automatically trigger refetch
    // But we can manually refetch if needed
    refetchInvitations();
    refetchUserTeams();
    refetchTeams();
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
            {invitations.map((inv: Invitation) => (
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