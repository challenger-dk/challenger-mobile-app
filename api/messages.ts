import { authenticatedFetch, getChatServiceUrl } from '../utils/api';
import type { ConversationType, Message } from '../types/message';

export const getMessagesHistory = async (
  id: number | string,
  type: ConversationType
): Promise<Message[]> => {
  const params = new URLSearchParams();

  if (type === 'team') {
    params.append('team_id', String(id));
  } else if (type === 'user') {
    params.append('recipient_id', String(id));
  } else {
    throw new Error('Invalid conversation type');
  }

  const url = `${getChatServiceUrl()}/api/messages?${params.toString()}`;
  console.log('[API] Fetching messages from:', url);

  const response = await authenticatedFetch(url);

  if (!response.ok) {
    const text = await response.text();
    console.error('[API] Error fetching messages:', response.status, text);
    throw new Error(`Failed to fetch messages: ${response.status} ${text}`);
  }

  const data: Message[] = await response.json();
  return data;
};
