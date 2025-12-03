import * as SecureStore from 'expo-secure-store';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from './AuthContext';
import { getWebSocketUrl } from '../utils/api';
import type { IncomingMessage, Message, ConversationType } from '../types/message';
import { getMessagesHistory } from '../api/messages';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useMyChats } from '../hooks/queries/useChats';
import { useQueryClient } from '@tanstack/react-query';
import type { Chat } from '../types/chat';

interface WebSocketContextType {
  messages: Message[];
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  sendMessage: (msg: IncomingMessage) => void;
  loadHistory: (id: number | string, type: ConversationType) => Promise<void>;
  currentConversation: { id: number | string | null, type: ConversationType | null };
  unreadCount: number;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();

  // Only fetch chats if authenticated to avoid 401 errors
  const { data: chats } = useMyChats({ enabled: isAuthenticated });

  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<WebSocketContextType['status']>('disconnected');
  const [currentConversation, setCurrentConversation] = useState<WebSocketContextType['currentConversation']>({ id: null, type: null });
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    // Check if chats exists AND is specifically an array before reducing
    if (chats && Array.isArray(chats)) {
      const total = chats.reduce((sum, chat) => sum + (chat.unread_count || 0), 0);
      setUnreadCount(total);
    }
  }, [chats]);

  const ws = useRef<WebSocket | null>(null);
  const currentConversationRef = useRef(currentConversation);
  const userRef = useRef(user);

  useEffect(() => {
    currentConversationRef.current = currentConversation;
  }, [currentConversation]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const connect = useCallback(async () => {
    if (!isAuthenticated) return;
    if (ws.current?.readyState === WebSocket.OPEN) return;

    setStatus('connecting');

    try {
      const token = await SecureStore.getItemAsync('token');
      if (!token) return;

      const wsBaseUrl = getWebSocketUrl();
      const url = `${wsBaseUrl}/ws?token=${token}`;
      console.log('Connecting to WebSocket:', url);

      const newWs = new WebSocket(url);

      newWs.onopen = () => {
        console.log('WebSocket Connected');
        setStatus('connected');
      };

      newWs.onmessage = (event) => {
        try {
          const newMessage: Message = JSON.parse(event.data);
          const activeConversation = currentConversationRef.current;
          const currentUser = userRef.current;

          const isRelevant =
            (activeConversation.type === 'team' && newMessage.team_id == activeConversation.id) ||
            (activeConversation.type === 'chat' && newMessage.chat_id == activeConversation.id);

          setMessages((prevMessages) => {
            if (isRelevant) {
              if (prevMessages.some(m => m.id === newMessage.id)) return prevMessages;
              return [newMessage, ...prevMessages];
            }
            return prevMessages;
          });

          if (!isRelevant && newMessage.sender_id !== currentUser?.id) {
            if (newMessage.chat_id) {
              queryClient.setQueryData(['chats'], (oldData: Chat[] | undefined) => {
                if (!oldData || !Array.isArray(oldData)) return oldData;
                return oldData.map(c =>
                  c.id === newMessage.chat_id
                    ? { ...c, unread_count: (c.unread_count || 0) + 1 }
                    : c
                );
              });
            }
          }

        } catch (e) {
          console.error('Error parsing message:', e);
        }
      };

      newWs.onerror = (e) => {
        console.log('WebSocket Error:', e);
        setStatus('error');
      };

      newWs.onclose = () => {
        console.log('WebSocket Disconnected');
        setStatus('disconnected');
        ws.current = null;
      };

      ws.current = newWs;
    } catch (err) {
      console.error('Connection error:', err);
      setStatus('error');
    }
  }, [isAuthenticated, queryClient]);

  useEffect(() => {
    if (isAuthenticated) {
      connect();
    }
    return () => {
      ws.current?.close();
    };
  }, [isAuthenticated, connect]);

  const sendMessage = useCallback((msg: IncomingMessage) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(msg));
    } else {
      Alert.alert('Connection Lost', 'Reconnecting...');
      connect();
    }
  }, [connect]);

  const loadHistory = useCallback(async (id: number | string, type: ConversationType) => {
    setCurrentConversation({ id, type });
    try {
      const history = await getMessagesHistory(id, type);
      setMessages(Array.isArray(history) ? history : []);
    } catch (e) {
      console.error('Failed to load history', e);
      setMessages([]);
    }
  }, []);

  return (
    <WebSocketContext.Provider value={{ messages, status, sendMessage, loadHistory, currentConversation, unreadCount }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) throw new Error('useWebSocket must be used within a WebSocketProvider');
  return context;
};
