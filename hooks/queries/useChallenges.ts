import { createChallenge, getChallenge, getChallenges, joinChallenge, leaveChallenge } from '@/api/challenges';
import { queryKeys } from '@/lib/queryClient';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * Query hook to fetch all challenges
 */
export const useChallenges = () => {
  return useQuery({
    queryKey: queryKeys.challenges.lists(),
    queryFn: getChallenges,
    staleTime: 0, // Always consider data stale so it refetches when invalidated
    refetchOnMount: true, // Always refetch when component mounts
  });
};

/**
 * Query hook to fetch a specific challenge by ID
 */
export const useChallenge = (challengeId: string) => {
  return useQuery({
    queryKey: queryKeys.challenges.detail(challengeId),
    queryFn: () => getChallenge(challengeId),
    enabled: !!challengeId, // Only fetch if challengeId is provided
  });
};

/**
 * Mutation hook to create a new challenge
 * Automatically invalidates and refetches challenges list
 */
export const useCreateChallenge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createChallenge,
    onSuccess: () => {
      // Invalidate challenges list - this marks queries as stale
      // With staleTime: 0, this will trigger immediate refetch when queries become active
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.challenges.lists(),
      });
      showSuccessToast('Udfordringen er oprettet!');
    },
    onError: (error: Error) => {
      showErrorToast(error.message || 'Der opstod en fejl ved oprettelse af udfordringen');
    },
  });
};

/**
 * Mutation hook to join a challenge
 */
export const useJoinChallenge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: joinChallenge,
    onSuccess: () => {
      // Invalidate challenges list to refresh the UI
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.challenges.lists(),
      });
      showSuccessToast('Du har deltaget i udfordringen');
    },
    onError: (error: Error) => {
      showErrorToast(error.message || 'Der opstod en fejl ved deltagelse i udfordringen');
    },
  });
};

/**
 * Mutation hook to leave a challenge
 */
export const useLeaveChallenge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: leaveChallenge,
    onSuccess: () => {
      // Invalidate challenges list to refresh the UI
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.challenges.lists(),
      });
      showSuccessToast('Du har forladt udfordringen');
    },
    onError: (error: Error) => {
      showErrorToast(error.message || 'Der opstod en fejl ved forladelse af udfordringen');
    },
  });
};

