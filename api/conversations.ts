import { authenticatedFetch, getChatServiceUrl } from '../utils/api';
import type {
  Conversation,
  ConversationListItem,
  CreateDirectConversationRequest,
  CreateGroupConversationRequest,
  MarkAsReadRequest,
  Message,
  MessagesResponse,
  SendMessageRequest,
} from '../types/conversation';

/**
 * Get the full URL for a conversation endpoint
 */
const getConversationUrl = (endpoint: string): string => {
  const baseUrl = getChatServiceUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}/api${cleanEndpoint}`;
};

/**
 * Create a direct (1-on-1) conversation
 * Idempotent: Returns existing conversation if one already exists
 */
export const createDirectConversation = async (
  request: CreateDirectConversationRequest
): Promise<Conversation> => {
  const url = getConversationUrl('/conversations/direct');
  const response = await authenticatedFetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to create direct conversation: ${response.status} ${text}`);
  }

  return response.json();
};

/**
 * Create a group conversation
 * Requires at least 2 other participants (minimum 3 total including creator)
 */
export const createGroupConversation = async (
  request: CreateGroupConversationRequest
): Promise<Conversation> => {
  const url = getConversationUrl('/conversations/group');
  const response = await authenticatedFetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to create group conversation: ${response.status} ${text}`);
  }

  return response.json();
};

/**
 * List all conversations for the current user
 * Sorted by most recent activity (updated_at DESC)
 */
export const getConversations = async (): Promise<ConversationListItem[]> => {
  const url = getConversationUrl('/conversations');
  const response = await authenticatedFetch(url);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to fetch conversations: ${response.status} ${text}`);
  }

  return response.json();
};

/**
 * Get a single conversation by ID
 */
export const getConversation = async (conversationId: number): Promise<Conversation> => {
  const url = getConversationUrl(`/conversations/${conversationId}`);
  const response = await authenticatedFetch(url);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to fetch conversation: ${response.status} ${text}`);
  }

  return response.json();
};

/**
 * Get the conversation for a team by team ID
 * Creates the conversation if it doesn't exist
 */
export const getTeamConversation = async (teamId: number): Promise<Conversation> => {
  const url = getConversationUrl(`/conversations/team/${teamId}`);
  const response = await authenticatedFetch(url);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to fetch team conversation: ${response.status} ${text}`);
  }

  return response.json();
};

/**
 * Get messages for a conversation with pagination
 * @param conversationId - The conversation ID
 * @param limit - Number of messages to return (default: 50, max: 100)
 * @param before - Message ID to fetch messages before (for pagination)
 */
export const getConversationMessages = async (
  conversationId: number,
  limit: number = 50,
  before?: number
): Promise<MessagesResponse> => {
  const params = new URLSearchParams();
  params.append('limit', String(limit));
  if (before) {
    params.append('before', String(before));
  }

  const url = getConversationUrl(`/conversations/${conversationId}/messages?${params.toString()}`);
  const response = await authenticatedFetch(url);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to fetch messages: ${response.status} ${text}`);
  }

  return response.json();
};

/**
 * Send a message to a conversation via REST API
 * Note: WebSocket is preferred for real-time messaging
 */
export const sendMessage = async (
  conversationId: number,
  request: SendMessageRequest
): Promise<Message> => {
  const url = getConversationUrl(`/conversations/${conversationId}/messages`);
  const response = await authenticatedFetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to send message: ${response.status} ${text}`);
  }

  return response.json();
};

/**
 * Mark a conversation as read
 * Updates the user's last_read_at timestamp
 */
export const markConversationAsRead = async (
  conversationId: number,
  request?: MarkAsReadRequest
): Promise<void> => {
  const url = getConversationUrl(`/conversations/${conversationId}/read`);
  const response = await authenticatedFetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request || {}),
  });

  if (!response.ok && response.status !== 204) {
    const text = await response.text();
    throw new Error(`Failed to mark conversation as read: ${response.status} ${text}`);
  }
};

