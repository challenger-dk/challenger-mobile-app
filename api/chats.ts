import { authenticatedFetch, getApiUrl } from '../utils/api';
import type { Chat, CreateChat } from '../types/chat';

export const getMyChats = async (): Promise<Chat[]> => {
  const response = await authenticatedFetch(getApiUrl('/chats'));
  return response.json();
};

export const getChat = async (id: number): Promise<Chat> => {
  const response = await authenticatedFetch(getApiUrl(`/chats/${id}`));
  return response.json();
};

export const createChat = async (data: CreateChat): Promise<Chat> => {
  const response = await authenticatedFetch(getApiUrl('/chats'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const addUserToChat = async (chatId: number, userId: number) => {
  const response = await authenticatedFetch(getApiUrl(`/chats/${chatId}/users`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId }),
  });

  if (!response.ok) {
    throw new Error('Failed to add user');
  }
};
