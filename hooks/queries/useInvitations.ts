import {
  acceptInvitation,
  declineInvitation,
  getInvitationsByUser,
  getMyInvitations,
  SendInvitation,
} from '@/api/invitations';
import { queryKeys } from '@/lib/queryClient';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * Query hook to fetch invitations for a specific user
 */
export const useInvitationsByUser = (userId: string | number) => {
  return useQuery({
    queryKey: queryKeys.invitations.byUser(userId),
    queryFn: () => getInvitationsByUser(userId),
    enabled: !!userId, // Only fetch if userId is provided
  });
};

/**
 * Query hook to fetch the current user's invitations
 */
export const useMyInvitations = () => {
  return useQuery({
    queryKey: queryKeys.invitations.byUser('me'),
    queryFn: getMyInvitations,
  });
};

/**
 * Mutation hook to send an invitation
 * Automatically invalidates invitations for the recipient user
 */
export const useSendInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: SendInvitation,
    onSuccess: (_, variables) => {
      // Invalidate invitations for the recipient user
      if (variables.resource_type === 'team' && variables.resource_id) {
        // If it's a team invitation, we might want to invalidate team-related queries too
        queryClient.invalidateQueries({ queryKey: queryKeys.teams.lists() });
      }
      // Invalidate invitations for the recipient (if we have their ID)
      queryClient.invalidateQueries({ queryKey: queryKeys.invitations.all });
      showSuccessToast('Invitationen er sendt!');
    },
    onError: (error: Error) => {
      showErrorToast(error.message || 'Der opstod en fejl ved afsendelse af invitationen');
    },
  });
};

/**
 * Mutation hook to accept an invitation
 * Automatically invalidates related queries
 */
export const useAcceptInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: acceptInvitation,
    onSuccess: (_, invitationId) => {
      // Invalidate all invitations queries to remove the accepted invitation
      queryClient.invalidateQueries({ queryKey: queryKeys.invitations.all });
      // Invalidate teams list in case accepting a team invitation adds the user to a team
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.lists() });
      // Invalidate current user to update their teams/friends
      queryClient.invalidateQueries({ queryKey: queryKeys.users.current() });
      // Invalidate current user's teams
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.byUser('me') });
      showSuccessToast('Invitationen er accepteret!');
    },
    onError: (error: Error) => {
      showErrorToast(error.message || 'Der opstod en fejl ved accept af invitationen');
    },
  });
};

/**
 * Mutation hook to decline an invitation
 * Automatically invalidates invitations queries
 */
export const useDeclineInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: declineInvitation,
    onSuccess: () => {
      // Invalidate all invitations queries to remove the declined invitation
      queryClient.invalidateQueries({ queryKey: queryKeys.invitations.all });
      showSuccessToast('Invitationen er afvist');
    },
    onError: (error: Error) => {
      showErrorToast(error.message || 'Der opstod en fejl ved afvisning af invitationen');
    },
  });
};