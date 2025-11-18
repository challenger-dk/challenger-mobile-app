import { createChallenge, getChallenge, getChallenges } from '@/api/challenges';
import { queryKeys } from '@/lib/queryClient';
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
    },
  });
};

