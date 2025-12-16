import type { PublicUser } from './user';

/**
 * Conversation type: direct (1-on-1), group (multiple users), or team (team chat)
 */
export type ConversationType = 'direct' | 'group' | 'team';

/**
 * User information for conversation participants
 */
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  profile_picture?: string;
}

/**
 * Message in a conversation
 */
export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  sender: User;
  content: string;
  created_at: string;
  pending?: boolean; // For optimistic UI updates
}

/**
 * Conversation participant with join/read/leave timestamps
 */
export interface ConversationParticipant {
  conversation_id: number;
  user_id: number;
  user: User;
  joined_at: string;
  last_read_at?: string;
  left_at?: string;
}

/**
 * Full conversation details with participants
 */
export interface Conversation {
  id: number;
  type: ConversationType;
  title?: string;
  team_id?: number;
  participants: ConversationParticipant[];
  created_at: string;
  updated_at: string;
}

/**
 * Conversation list item with summary information
 */
export interface ConversationListItem {
  id: number;
  type: ConversationType;
  title?: string;
  team_id?: number;
  team_name?: string;
  other_user?: User; // For direct conversations
  participant_count?: number; // For group/team conversations
  unread_count: number;
  last_message?: Message;
  updated_at: string;
}

/**
 * Paginated messages response
 */
export interface MessagesResponse {
  messages: Message[];
  has_more: boolean;
  total: number;
}

/**
 * Request to create a direct conversation
 */
export interface CreateDirectConversationRequest {
  other_user_id: number;
}

/**
 * Request to create a group conversation
 */
export interface CreateGroupConversationRequest {
  title: string;
  participant_ids: number[];
}

/**
 * Request to send a message
 */
export interface SendMessageRequest {
  content: string;
}

/**
 * Request to mark conversation as read
 */
export interface MarkAsReadRequest {
  read_at?: string;
}

/**
 * WebSocket message format (outgoing)
 */
export interface WebSocketOutgoingMessage {
  conversation_id?: number;
  content: string;
  // Legacy support
  team_id?: number;
  recipient_id?: number;
}

/**
 * WebSocket message format (incoming)
 */
export interface WebSocketIncomingMessage extends Message {
  // Same as Message type
}

