import { getMyInvitations } from '@/api/invitations';
import { getMyTeams } from '@/api/teams';
import { LoadingScreen } from '@/components/common';
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

export function TeamsContent() {
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
    <ScrollView
      className="flex-1"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
    >
      <View className="px-6 py-4">
        {/* Search Bar & Create Button Row */}
        <View className="flex-row items-center gap-3 mb-5">
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
            className="bg-white rounded-full p-2"
            aria-label="Create Team"
          >
            <Ionicons name="add" size={24} color="#171616" />
          </Pressable>
        </View>

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
            <Text className="text-[#575757] text-sm">Du har ikke oprettet nogen hold endnu.</Text>
          )}
        </View>

        <View className="mb-6">
          <Text className="text-gray-300 text-sm mb-3">Andre hold</Text>
          {filterTeams(otherTeams).map(renderTeamCard)}
          {filterTeams(otherTeams).length === 0 && (
            <Text className="text-[#575757] text-sm">Du er ikke medlem af andre hold.</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

