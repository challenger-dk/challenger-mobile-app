import { QueryClient } from '@tanstack/react-query';

/**
 * QueryClient configuration for React Query
 * * Default options:
 * - staleTime: 5 minutes - data is considered fresh for 5 minutes
 * - gcTime: 10 minutes - unused cache is garbage collected after 10 minutes
 * - retry: 1 - retry failed requests once
 * - refetchOnWindowFocus: false - don't refetch when window regains focus (mobile)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false, // Mobile apps don't have window focus
      refetchOnReconnect: true, // Refetch when network reconnects
    },
    mutations: {
      retry: 1,
    },
  },
});

/**
 * Query keys factory for consistent cache key management
 * This helps with cache invalidation and ensures we use the same keys everywhere
 */
export const queryKeys = {
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters: string) =>
      [...queryKeys.users.lists(), { filters }] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string | number) =>
      [...queryKeys.users.details(), id] as const,
    current: () => [...queryKeys.users.all, 'current'] as const,
    suggestedFriends: () => [...queryKeys.users.all, 'suggested-friends'] as const,
  },
  challenges: {
    all: ['challenges'] as const,
    lists: () => [...queryKeys.challenges.all, 'list'] as const,
    list: (filters: string) =>
      [...queryKeys.challenges.lists(), { filters }] as const,
    details: () => [...queryKeys.challenges.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.challenges.details(), id] as const,
  },
  teams: {
    all: ['teams'] as const,
    lists: () => [...queryKeys.teams.all, 'list'] as const,
    list: (filters: string) =>
      [...queryKeys.teams.lists(), { filters }] as const,
    details: () => [...queryKeys.teams.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.teams.details(), id] as const,
    byUser: (userId: string | number) =>
      [...queryKeys.teams.all, 'user', userId] as const,
  },
  invitations: {
    all: ['invitations'] as const,
    lists: () => [...queryKeys.invitations.all, 'list'] as const,
    list: (filters: string) =>
      [...queryKeys.invitations.lists(), { filters }] as const,
    byUser: (userId: string | number) =>
      [...queryKeys.invitations.all, 'user', userId] as const,
    details: () => [...queryKeys.invitations.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.invitations.details(), id] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    unread: () => [...queryKeys.notifications.all, 'unread'] as const,
  },
  conversations: {
    all: ['conversations'] as const,
    lists: () => [...queryKeys.conversations.all, 'list'] as const,
    details: () => [...queryKeys.conversations.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.conversations.details(), id] as const,
    messages: (id: number) => [...queryKeys.conversations.detail(id), 'messages'] as const,
  },
};
