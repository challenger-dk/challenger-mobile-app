import { createUser, getCurrentUser, getUserById, getUsers, updateUser } from '@/api/users';
import { queryKeys } from '@/lib/queryClient';
import type { UpdateUser } from '@/types/user';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * Query hook to fetch all users
 */
export const useUsers = () => {
  return useQuery({
    queryKey: queryKeys.users.lists(),
    queryFn: getUsers,
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
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(variables.userId) });
      // Invalidate current user if it's the same user
      queryClient.invalidateQueries({ queryKey: queryKeys.users.current() });
      // Invalidate users list to reflect changes
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
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
    },
  });
};

