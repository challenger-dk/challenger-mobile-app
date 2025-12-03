import type { PublicUser } from "./user";

export type Chat = {
  id: number;
  name: string; // Optional name for group chats
  users: PublicUser[];
};

export type CreateChat = {
  name?: string;
  user_ids: number[];
};

export type AddUserToChat = {
  user_id: number;
};
