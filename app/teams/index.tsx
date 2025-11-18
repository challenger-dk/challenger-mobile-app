import { getMyInvitations } from '@/api/invitations';
import { getMyTeams } from '@/api/teams';
import { LoadingScreen, TabNavigation } from '@/components/common';
import { InvitationCard } from '@/components/InvitationCard';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { queryKeys } from '@/lib/queryClient';
import type { Invitation } from '@/types/invitation';
import type { Team } from '@/types/team';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TeamsScreen() {
  const router = useRouter();
  const { user } = useCurrentUser();

  // Fetch current user's teams directly using useQuery
  const {
    data: userTeams = [],
    isLoading: userTeamsLoading,
    isRefetching: userTeamsRefetching,
    refetch: refetchUserTeams,
  } = useQuery({
    queryKey: queryKeys.teams.byUser('me'),
    queryFn: getMyTeams,
    enabled: !!user,
  });

  // Fetch current user's invitations directly using useQuery
  const {
    data: userInvitations = [],
    isLoading: invitationsLoading,
    isRefetching: invitationsRefetching,
    refetch: refetchInvitations,
  } = useQuery({
    queryKey: queryKeys.invitations.byUser('me'),
    queryFn: getMyInvitations,
    enabled: !!user,
  });

  const [search, setSearch] = useState('');

  // Compute derived state from queries
  const { myTeams, otherTeams, invitations } = useMemo(() => {
    if (!user) return { myTeams: [], otherTeams: [], invitations: [] };

    // Helper to compare IDs safely
    const isCurrentUser = (id: string | number) => String(id) === String(user.id);

    // Filter: Ensure the user is actually part of the team
    const validUserTeams = userTeams.filter((t: Team) =>
      (t.creator && isCurrentUser(t.creator.id)) || (t.users && t.users.some(u => isCurrentUser(u.id)))
    );

    // "Mine hold" -> Teams created by the user
    const createdTeams = validUserTeams.filter((t: Team) => t.creator && isCurrentUser(t.creator.id));

    // "Andre hold" -> Teams the user is a member of, but did not create
    const memberTeams = validUserTeams.filter((t: Team) => t.creator && !isCurrentUser(t.creator.id));

    const pendingTeamInvitations = userInvitations.filter(
      (inv: Invitation) => inv.resource_type === 'team' && inv.status === 'pending'
    );

    return {
      myTeams: createdTeams,
      otherTeams: memberTeams,
      invitations: pendingTeamInvitations,
    };
  }, [userTeams, userInvitations, user]);

  const loading = userTeamsLoading || invitationsLoading;
  const refreshing = userTeamsRefetching || invitationsRefetching;

  const onRefresh = useCallback(async () => {
    await Promise.all([refetchUserTeams(), refetchInvitations()]);
  }, [refetchUserTeams, refetchInvitations]);

  const handleInvitationHandled = () => {
    refetchInvitations();
    refetchUserTeams();
  };

  const filterTeams = (teams: Team[]) =>
    teams.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()));

  const renderTeamCard = (team: Team) => (
    <Pressable
      key={team.id}
      onPress={() => router.push(`/teams/${team.id}` as any)}
      className="flex-row items-center justify-between bg-[#2c2c2c] rounded-2xl p-4 mb-3"
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
    <SafeAreaView className="flex-1 bg-[#171616]" edges={['top']}>
      {/* Header with Back Button */}
      <View className="px-5 py-2 flex-row items-center">
        <Pressable onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="chevron-back" size={28} color="#ffffff" />
        </Pressable>
      </View>

      {/* Tabs - Using TabNavigation for consistency and fill */}
      <TabNavigation
        tabs={[
          { key: 'friends', label: 'Venner' },
          { key: 'teams', label: 'Hold' },
        ]}
        activeTab="teams"
        onTabChange={(key) => {
          if (key === 'friends') {
            router.replace('/friends' as any);
          }
        }}
      />

      <ScrollView
        className="flex-1 p-5"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
      >
        {/* Search Bar & Create Button Row */}
        <View className="flex-row items-center gap-3 mb-5 mt-2">
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Navn"
            placeholderTextColor="#9CA3AF"
            className="flex-1 bg-[#2c2c2c] text-white p-3 rounded-lg border border-[#575757]"
            style={{ color: '#ffffff' }}
          />
          <Pressable
            onPress={() => router.push('/teams/createTeam')}
            className="bg-[#2c2c2c] p-3 rounded-lg border border-[#575757] justify-center items-center"
          >
            <Ionicons name="add" size={24} color="#ffffff" />
          </Pressable>
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
          <Text className="text-gray-300 text-sm mb-3">Mine hold</Text>
          {filterTeams(myTeams).map(renderTeamCard)}
          {filterTeams(myTeams).length === 0 && (
            <Text className="text-gray-500 text-sm">Du har ikke oprettet nogen hold endnu.</Text>
          )}
        </View>

        <View className="mb-6">
          <Text className="text-gray-300 text-sm mb-3">Andre hold</Text>
          {filterTeams(otherTeams).map(renderTeamCard)}
          {filterTeams(otherTeams).length === 0 && (
            <Text className="text-gray-500 text-sm">Du er ikke medlem af andre hold.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}