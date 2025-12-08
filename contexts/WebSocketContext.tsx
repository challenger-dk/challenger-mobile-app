import * as SecureStore from 'expo-secure-store';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from './AuthContext';
import { getWebSocketUrl } from '../utils/api';
import type { IncomingMessage, Message, ConversationType } from '../types/message';
import { getMessagesHistory } from '../api/messages';

interface WebSocketContextType {
  messages: Message[];
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  sendMessage: (msg: IncomingMessage) => void;
  loadHistory: (id: number | string, type: ConversationType) => Promise<void>;
  currentConversation: { id: number | string | null, type: ConversationType | null };
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<WebSocketContextType['status']>('disconnected');
  const [currentConversation, setCurrentConversation] = useState<WebSocketContextType['currentConversation']>({ id: null, type: null });

  const ws = useRef<WebSocket | null>(null);

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

          setMessages((prevMessages) => {
            // Check if message belongs to current view
            const isRelevant =
              (currentConversation.type === 'team' && newMessage.team_id == currentConversation.id) ||
              (currentConversation.type === 'chat' && newMessage.chat_id == currentConversation.id);

            if (isRelevant) {
              if (prevMessages.some(m => m.id === newMessage.id)) return prevMessages;
              return [newMessage, ...prevMessages];
            }
            return prevMessages;
          });
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
  }, [isAuthenticated, currentConversation]);

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
    <WebSocketContext.Provider value={{ messages, status, sendMessage, loadHistory, currentConversation }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) throw new Error('useWebSocket must be used within a WebSocketProvider');
  return context;
};
