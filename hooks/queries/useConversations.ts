import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getConversations,
  getConversation,
  getConversationMessages,
  createDirectConversation,
  createGroupConversation,
  sendMessage,
  markConversationAsRead,
  getTeamConversation,
} from '@/api/conversations';
import { queryKeys } from '@/lib/queryClient';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import type {
  CreateDirectConversationRequest,
  CreateGroupConversationRequest,
  SendMessageRequest,
} from '@/types/conversation';

/**
 * Query hook to fetch all conversations for the current user
 * Sorted by most recent activity
 */
export const useConversations = () => {
  const { user } = useCurrentUser();

  return useQuery({
    queryKey: queryKeys.conversations.lists(),
    queryFn: getConversations,
    enabled: !!user,
    // Refresh every 30 seconds to catch new conversations
    refetchInterval: 30000,
    refetchOnMount: true,
    staleTime: 0,
  });
};

/**
 * Query hook to fetch a single conversation by ID
 */
export const useConversation = (conversationId: number | null) => {
  return useQuery({
    queryKey: conversationId ? queryKeys.conversations.detail(conversationId) : ['conversations', 'none'],
    queryFn: () => conversationId ? getConversation(conversationId) : Promise.reject('No conversation ID'),
    enabled: !!conversationId,
  });
};

/**
 * Query hook to get a team conversation by team ID
 * Fetches directly from the backend, creating the conversation if it doesn't exist
 */
export const useTeamConversation = (teamId: number | null) => {
  return useQuery({
    queryKey: teamId ? ['conversations', 'team', teamId] : ['conversations', 'team', 'none'],
    queryFn: () => teamId ? getTeamConversation(teamId) : Promise.reject('No team ID'),
    enabled: !!teamId,
    staleTime: 60000, // 1 minute
  });
};

/**
 * Query hook to fetch messages for a conversation
 */
export const useConversationMessages = (
  conversationId: number | null,
  limit: number = 50,
  before?: number
) => {
  return useQuery({
    queryKey: conversationId 
      ? [...queryKeys.conversations.messages(conversationId), { limit, before }]
      : ['conversations', 'messages', 'none'],
    queryFn: () => conversationId 
      ? getConversationMessages(conversationId, limit, before)
      : Promise.reject('No conversation ID'),
    enabled: !!conversationId,
    staleTime: 60000, // 1 minute
  });
};

/**
 * Mutation hook to create a direct conversation
 */
export const useCreateDirectConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateDirectConversationRequest) =>
      createDirectConversation(request),
    onSuccess: () => {
      // Invalidate conversations list to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.lists() });
    },
  });
};

/**
 * Mutation hook to create a group conversation
 */
export const useCreateGroupConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateGroupConversationRequest) =>
      createGroupConversation(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.lists() });
    },
  });
};

/**
 * Mutation hook to send a message (REST fallback)
 */
export const useSendMessage = (conversationId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: SendMessageRequest) =>
      sendMessage(conversationId, request),
    onSuccess: () => {
      // Invalidate messages for this conversation
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.conversations.messages(conversationId) 
      });
      // Invalidate conversation list to update last message
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.lists() });
    },
  });
};

/**
 * Mutation hook to mark a conversation as read
 */
export const useMarkConversationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId }: { conversationId: number }) =>
      markConversationAsRead(conversationId),
    onSuccess: (_, { conversationId }) => {
      // Invalidate conversation list to update unread count
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.lists() });
      // Invalidate specific conversation
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.conversations.detail(conversationId) 
      });
    },
  });
};

