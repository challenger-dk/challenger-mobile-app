import { createTeam, getTeam, getTeams, getTeamsByUser, updateTeam } from '@/api/teams';
import { queryKeys } from '@/lib/queryClient';
import type { UpdateTeam } from '@/types/team';
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
 * Mutation hook to create a new team
 * Automatically invalidates teams list and user's teams
 */
export const useCreateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTeam,
    onSuccess: (data) => {
      // Invalidate teams list to include the new team
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.lists() });
      // If the team has users, invalidate their teams queries
      if (data?.users) {
        data.users.forEach((user: { id: string | number }) => {
          queryClient.invalidateQueries({ queryKey: queryKeys.teams.byUser(user.id) });
        });
      }
    },
  });
};

/**
 * Mutation hook to update a team
 * Automatically invalidates and refetches related queries
 */
export const useUpdateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, team }: { teamId: string; team: UpdateTeam }) =>
      updateTeam(teamId, team),
    onSuccess: (data, variables) => {
      // Invalidate the specific team's cache
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.detail(variables.teamId) });
      // Invalidate teams list to reflect changes
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.lists() });
      // If the team has users, invalidate their teams queries
      if (data?.users) {
        data.users.forEach((user: { id: string | number }) => {
          queryClient.invalidateQueries({ queryKey: queryKeys.teams.byUser(user.id) });
        });
      }
    },
  });
};

