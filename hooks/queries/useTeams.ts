import { createTeam, deleteTeam, getMyTeams, getTeam, getTeams, getTeamsByUser, leaveTeam, removeUserFromTeam, updateTeam } from '@/api/teams';
import { queryKeys } from '@/lib/queryClient';
import type { UpdateTeam } from '@/types/team';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * Query hook to fetch all teams
 */
export const useTeams = () => {
  return useQuery({
    queryKey: queryKeys.teams.lists(),
    queryFn: getTeams,
  });
};

/**
 * Query hook to fetch a specific team by ID
 */
export const useTeam = (teamId: string) => {
  return useQuery({
    queryKey: queryKeys.teams.detail(teamId),
    queryFn: () => getTeam(teamId),
    enabled: !!teamId, // Only fetch if teamId is provided
  });
};

/**
 * Query hook to fetch teams for a specific user
 */
export const useTeamsByUser = (userId: string | number) => {
  return useQuery({
    queryKey: queryKeys.teams.byUser(userId),
    queryFn: () => getTeamsByUser(String(userId)),
    enabled: !!userId, // Only fetch if userId is provided
  });
};

/**
 * Query hook to fetch the current user's teams
 */
export const useMyTeams = () => {
  return useQuery({
    queryKey: queryKeys.teams.byUser('me'),
    queryFn: getMyTeams,
  });
};

/**
 * Mutation hook to create a new team
 */
export const useCreateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTeam,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.byUser('me') });
      if (data?.users) {
        data.users.forEach((user: { id: string | number }) => {
          queryClient.invalidateQueries({ queryKey: queryKeys.teams.byUser(user.id) });
        });
      }
      showSuccessToast('Holdet er oprettet!');
    },
    onError: (error: Error) => {
      showErrorToast(error.message || 'Der opstod en fejl ved oprettelse af holdet');
    },
  });
};

/**
 * Mutation hook to update a team
 */
export const useUpdateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, team }: { teamId: string; team: UpdateTeam }) =>
      updateTeam(teamId, team),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.detail(variables.teamId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.byUser('me') });
      if (data?.users) {
        data.users.forEach((user: { id: string | number }) => {
          queryClient.invalidateQueries({ queryKey: queryKeys.teams.byUser(user.id) });
        });
      }
      showSuccessToast('Holdet er opdateret!');
    },
    onError: (error: Error) => {
      showErrorToast(error.message || 'Der opstod en fejl ved opdatering af holdet');
    },
  });
};

/**
 * Mutation hook to remove a user from a team
 */
export const useRemoveUserFromTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
      removeUserFromTeam(teamId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.detail(variables.teamId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.byUser(variables.userId) });
      showSuccessToast('Bruger fjernet fra holdet');
    },
    onError: (error: Error) => {
      showErrorToast(error.message || 'Kunne ikke fjerne bruger fra holdet');
    },
  });
};

/**
 * Mutation hook to leave a team
 */
export const useLeaveTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: leaveTeam,
    onSuccess: (_, teamId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.byUser('me') });
      // Invalidate the team detail as well since the user is no longer part of it
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.detail(teamId) });
      showSuccessToast('Du har forladt holdet');
    },
    onError: (error: Error) => {
      showErrorToast(error.message || 'Kunne ikke forlade holdet');
    },
  });
};

/**
 * Mutation hook to delete a team
 */
export const useDeleteTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.byUser('me') });
      showSuccessToast('Holdet er slettet');
    },
    onError: (error: Error) => {
      showErrorToast(error.message || 'Kunne ikke slette holdet');
    },
  });
};