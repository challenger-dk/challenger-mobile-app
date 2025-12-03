import type { PublicUser } from "./user";
import type { Chat } from "./chat";

export type ConversationType = 'chat' | 'team';

export type Message = {
  id: number;
  sender_id: number;
  sender: PublicUser;
  team_id?: number | null;
  chat_id?: number | null;
  chat?: Chat;
  content: string;
  created_at: string; // ISO 8601 string
};

export type IncomingMessage = {
  content: string;
  team_id?: number;
  chat_id?: number;
};
