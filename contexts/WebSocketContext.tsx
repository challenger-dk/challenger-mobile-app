import * as SecureStore from 'expo-secure-store';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Alert } from 'react-native';
import { useAuth } from './AuthContext';
import { getWebSocketUrl } from '../utils/api';
import type {
  Message,
  WebSocketOutgoingMessage,
  WebSocketIncomingMessage,
} from '../types/conversation';
import { getConversationMessages } from '../api/conversations';

interface WebSocketContextType {
  messages: Message[];
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  sendMessage: (msg: WebSocketOutgoingMessage) => void;
  loadConversationHistory: (conversationId: number) => Promise<void>;
  currentConversationId: number | null;
  setCurrentConversationId: (id: number | null) => void;
  // Callback for when a new message arrives (for updating conversation list)
  onMessageReceived?: (message: Message) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] =
    useState<WebSocketContextType['status']>('disconnected');
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [onMessageReceived, setOnMessageReceived] = useState<
    ((message: Message) => void) | undefined
  >(undefined);

  const ws = useRef<WebSocket | null>(null);

  // Function to establish WebSocket connection
  const connect = useCallback(async () => {
    if (!isAuthenticated) return;
    if (ws.current?.readyState === WebSocket.OPEN) return;

    setStatus('connecting');

    try {
      const token = await SecureStore.getItemAsync('token');
      if (!token) return;

      // Get the correct URL from our utility (handles .env and Android localhost)
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
          const newMessage: WebSocketIncomingMessage = JSON.parse(event.data);

          // Notify callback for conversation list updates
          if (onMessageReceived) {
            onMessageReceived(newMessage);
          }

          // Only add message to list if it belongs to the current active conversation
          setMessages((prevMessages) => {
            if (currentConversationId && newMessage.conversation_id === currentConversationId) {
              // Avoid duplicates
              if (prevMessages.some((m) => m.id === newMessage.id)) {
                return prevMessages;
              }
              // Add new message to the end (newest messages at bottom)
              return [...prevMessages, newMessage];
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
  }, [isAuthenticated, currentConversationId, onMessageReceived]);

  // Connect on mount/auth change
  useEffect(() => {
    if (isAuthenticated) {
      connect();
    }
    return () => {
      ws.current?.close();
    };
  }, [isAuthenticated, connect]);

  const sendMessage = useCallback(
    (msg: WebSocketOutgoingMessage) => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify(msg));
      } else {
        Alert.alert('Connection Lost', 'Reconnecting...');
        connect();
      }
    },
    [connect]
  );

  const loadConversationHistory = useCallback(
    async (conversationId: number) => {
      // Clear messages when switching conversations
      setMessages([]);
      setCurrentConversationId(conversationId);
      try {
        const response = await getConversationMessages(conversationId, 50);
        // Messages come in descending order (newest first), reverse to show oldest first
        setMessages(response.messages.reverse());
      } catch (e) {
        console.error('Failed to load conversation history', e);
        setMessages([]);
      }
    },
    []
  );

  return (
    <WebSocketContext.Provider
      value={{
        messages,
        status,
        sendMessage,
        loadConversationHistory,
        currentConversationId,
        setCurrentConversationId,
        onMessageReceived,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context)
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  return context;
};
