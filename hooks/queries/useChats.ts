import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyChats, createChat, markChatRead } from '@/api/chats';
import type { CreateChat, Chat } from '@/types/chat';

// Add options parameter
export const useMyChats = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['chats'],
    queryFn: getMyChats,
    enabled: options?.enabled, // Use the enabled option
  });
};

export const useCreateChat = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateChat) => createChat(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });
};

export const useMarkChatRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (chatId: number) => markChatRead(chatId),
    onSuccess: (_, chatId) => {
      queryClient.setQueryData(['chats'], (oldData: Chat[] | undefined) => {
        if (!oldData) return [];
        return oldData.map(chat =>
          chat.id === chatId ? { ...chat, unread_count: 0 } : chat
        );
      });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });
};
