import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyChats, createChat } from '@/api/chats';
import type { CreateChat } from '@/types/chat';

export const useMyChats = () => {
  return useQuery({
    queryKey: ['chats'],
    queryFn: getMyChats,
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
