import { getMyInvitations } from '@/api/invitations';
import { getMyTeams } from '@/api/teams';
import { EmptyState, LoadingScreen } from '@/components/common';
import { InvitationCard } from '@/components/InvitationCard';
import { TeamCard } from '@/components/teams/TeamCard';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { queryKeys } from '@/lib/queryClient';
import type { Invitation } from '@/types/invitation';
import type { Team } from '@/types/team';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

export function TeamsContent() {
  const router = useRouter();
  const { user } = useCurrentUser();

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

  const { myTeams, otherTeams, invitations } = useMemo(() => {
    if (!user) return { myTeams: [], otherTeams: [], invitations: [] };

    const isCurrentUser = (id: string | number) =>
      String(id) === String(user.id);

    const validUserTeams = userTeams.filter(
      (t: Team) =>
        (t.creator && isCurrentUser(t.creator.id)) ||
        (t.users && t.users.some((u) => isCurrentUser(u.id)))
    );

    const createdTeams = validUserTeams.filter(
      (t: Team) => t.creator && isCurrentUser(t.creator.id)
    );
    const memberTeams = validUserTeams.filter(
      (t: Team) => t.creator && !isCurrentUser(t.creator.id)
    );

    const pendingTeamInvitations = userInvitations.filter(
      (inv: Invitation) =>
        inv.resource_type === 'team' && inv.status === 'pending'
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

  if (loading || !user) {
    return <LoadingScreen />;
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#fff"
        />
      }
    >
      <View className="px-6 py-4">
        <View className="flex-row items-center gap-3 mb-5">
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Navn"
            placeholderTextColor="#9CA3AF"
            className="flex-1 bg-surface text-text p-3 rounded-lg border border-text-disabled"
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
            <Text className="text-text-muted text-sm mb-3">Invitationer</Text>
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
          <Text className="text-text-muted text-sm mb-3">Mine hold</Text>
          {filterTeams(myTeams).map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              onPress={(id) => router.push(`/teams/${id}` as any)}
            />
          ))}
          {filterTeams(myTeams).length === 0 && (
            <EmptyState
              title="Ingen hold"
              description="Du har ikke oprettet nogen hold endnu."
            />
          )}
        </View>

        <View className="mb-6">
          <Text className="text-text-muted text-sm mb-3">Andre hold</Text>
          {filterTeams(otherTeams).map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              onPress={(id) => router.push(`/teams/${id}` as any)}
            />
          ))}
          {filterTeams(otherTeams).length === 0 && (
            <EmptyState
              title="Ingen hold"
              description="Du er ikke medlem af andre hold."
            />
          )}
        </View>
      </View>
    </ScrollView>
  );
}
