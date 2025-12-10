import type { PublicUser } from './user';

export type ConversationType = 'user' | 'team';

export type Message = {
  id: number;
  sender_id: number;
  sender: PublicUser;
  team_id: number | null;
  recipient_id: number | null;
  content: string;
  created_at: string; // ISO 8601 string
};

export type IncomingMessage = {
  content: string;
  team_id?: number;
  recipient_id?: number;
};
