import {
  blockUser,
  createUser,
  getCurrentUser,
  getUserById,
  getUsers,
  getSuggestedFriends,
  searchUsers,
  unblockUser,
  updateUser,
  updateUserSettings,
} from '@/api/users';
import { queryKeys } from '@/lib/queryClient';
import type { UpdateUser } from '@/types/user';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * Query hook to fetch all users
 * Returns the users array from the paginated response
 */
export const useUsers = () => {
  return useQuery({
    queryKey: queryKeys.users.lists(),
    queryFn: async () => {
      const response = await getUsers();
      return response.users; // Extract users array from paginated response
    },
  });
};

/**
 * Query hook to fetch the current authenticated user
 */
export const useCurrentUserQuery = () => {
  return useQuery({
    queryKey: queryKeys.users.current(),
    queryFn: getCurrentUser,
    staleTime: 1000 * 60 * 2, // Current user data is fresh for 2 minutes
  });
};

/**
 * Query hook to fetch a specific user by ID
 */
export const useUser = (userId: string | number) => {
  return useQuery({
    queryKey: queryKeys.users.detail(userId),
    queryFn: () => getUserById(userId),
    enabled: !!userId, // Only fetch if userId is provided
  });
};

/**
 * Query hook to fetch suggested friends for the current user
 * Uses the friend suggestion algorithm based on common friends, teams, challenges, and sports
 */
export const useSuggestedFriends = () => {
  return useQuery({
    queryKey: queryKeys.users.suggestedFriends(),
    queryFn: getSuggestedFriends,
    staleTime: 1000 * 60 * 5, // Suggestions are fresh for 5 minutes
  });
};

/**
 * Query hook to search users with optional query and pagination
 * @param searchQuery - Optional search query to filter users
 * @param limit - Number of results per page
 * @param cursor - Cursor for pagination
 */
export const useSearchUsers = (
  searchQuery?: string,
  limit: number = 20,
  cursor?: string
) => {
  return useQuery({
    queryKey: [...queryKeys.users.lists(), { q: searchQuery, limit, cursor }],
    queryFn: () => searchUsers(searchQuery, limit, cursor),
    staleTime: 1000 * 60 * 2, // Search results are fresh for 2 minutes
    enabled: true, // Always enabled, even with empty query
  });
};

/**
 * Mutation hook to update a user
 * Automatically invalidates and refetches related queries
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, user }: { userId: string; user: UpdateUser }) =>
      updateUser(userId, user),
    onSuccess: (data, variables) => {
      // Invalidate the specific user's cache
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.detail(variables.userId),
      });
      // Invalidate current user if it's the same user
      queryClient.invalidateQueries({ queryKey: queryKeys.users.current() });
      // Invalidate users list to reflect changes
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      showSuccessToast('Profilen er opdateret!');
    },
    onError: (error: Error) => {
      showErrorToast(
        error.message || 'Der opstod en fejl ved opdatering af profilen'
      );
    },
  });
};

/**
 * Mutation hook to update user settings
 * Automatically invalidates current user query
 */
export const useUpdateUserSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserSettings,
    onSuccess: () => {
      // Invalidate current user to reflect new settings
      queryClient.invalidateQueries({ queryKey: queryKeys.users.current() });
      showSuccessToast('Indstillingerne er opdateret!');
    },
    onError: (error: Error) => {
      showErrorToast(
        error.message || 'Der opstod en fejl ved opdatering af indstillingerne'
      );
    },
  });
};

/**
 * Mutation hook to create a new user
 * Automatically invalidates users list
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      // Invalidate users list to include the new user
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      showSuccessToast('Brugeren er oprettet!');
    },
    onError: (error: Error) => {
      showErrorToast(
        error.message || 'Der opstod en fejl ved oprettelse af brugeren'
      );
    },
  });
};

/**
 * Mutation hook to block a user
 */
export const useBlockUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: blockUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      showSuccessToast('Brugeren er blevet blokeret');
    },
    onError: (error: Error) => {
      showErrorToast(
        error.message || 'Der opstod en fejl ved blokering af brugeren'
      );
    },
  });
};

/**
 * Mutation hook to unblock a user
 */
export const useUnblockUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unblockUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      showSuccessToast('Blokeringen er ophævet');
    },
    onError: (error: Error) => {
      showErrorToast(
        error.message || 'Der opstod en fejl ved ophævelse af blokeringen'
      );
    },
  });
};
