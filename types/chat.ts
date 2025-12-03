import type { PublicUser } from "./user";

export type Chat = {
  id: number;
  name: string; // Optional name for group chats
  users: PublicUser[];
  unread_count: number;
};

export type CreateChat = {
  name?: string;
  user_ids: number[];
};

export type AddUserToChat = {
  user_id: number;
};