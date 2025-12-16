import { MessageBubble } from '@/components/chat';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useMarkConversationAsRead } from '@/hooks/queries/useConversations';
import { getConversationMessages } from '@/api/conversations';
import type { Message } from '@/types/conversation';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

interface ChatViewProps {
  conversationId: number;
  conversationName?: string;
}

export const ChatView: React.FC<ChatViewProps> = ({ conversationId, conversationName }) => {
  const { user } = useCurrentUser();
  const {
    messages,
    sendMessage,
    loadConversationHistory,
    setCurrentConversationId,
  } = useWebSocket();
  const flatListRef = useRef<FlatList>(null);
  const { mutate: markAsRead } = useMarkConversationAsRead();

  const [inputText, setInputText] = useState('');
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Load initial messages when conversation ID changes
  useEffect(() => {
    if (conversationId) {
      setIsInitialLoading(true);
      setLocalMessages([]);
      setHasMore(true);
      
      setCurrentConversationId(conversationId);
      loadConversationHistory(conversationId).finally(() => {
        setIsInitialLoading(false);
      });
      
      markAsRead({ conversationId });
    }

    return () => {
      setCurrentConversationId(null);
      setLocalMessages([]);
    };
  }, [conversationId]);

  // Sync WebSocket messages with local state - ONLY for current conversation
  useEffect(() => {
    if (messages.length > 0 && conversationId) {
      setLocalMessages((prev) => {
        const relevantMessages = messages.filter(msg => msg.conversation_id === conversationId);
        
        if (relevantMessages.length === 0) return prev;
        
        const messageMap = new Map<number, Message>();
        prev.forEach((msg) => messageMap.set(msg.id, msg));
        relevantMessages.forEach((msg) => messageMap.set(msg.id, msg));
        
        return Array.from(messageMap.values()).sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      });
    }
  }, [messages, conversationId]);

  // Load more messages (pagination)
  const loadMoreMessages = useCallback(async () => {
    if (!conversationId || isLoadingMore || !hasMore || localMessages.length === 0) {
      return;
    }

    setIsLoadingMore(true);
    try {
      const oldestMessage = localMessages[0];
      const response = await getConversationMessages(conversationId, 50, oldestMessage.id);

      if (response.messages.length > 0) {
        setLocalMessages((prev) => [...response.messages.reverse(), ...prev]);
      }

      setHasMore(response.has_more);
    } catch (error) {
      console.error('Failed to load more messages:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [conversationId, isLoadingMore, hasMore, localMessages]);

  const handleSend = () => {
    if (!inputText.trim() || !conversationId || !user) return;

    const messageContent = inputText.trim();
    
    const optimisticMessage: Message = {
      id: Date.now(),
      conversation_id: conversationId,
      sender_id: user.id,
      content: messageContent,
      created_at: new Date().toISOString(),
      sender: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name || '',
        profile_picture: user.profile_picture || null,
      },
    };

    setLocalMessages((prev) => [...prev, optimisticMessage]);
    setInputText('');

    sendMessage({
      conversation_id: conversationId,
      content: messageContent,
    });

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  if (!user) return null;

  if (isInitialLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#0A84FF" />
        <Text className="text-text-disabled mt-4">Indlæser beskeder...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={localMessages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <MessageBubble message={item} isOwnMessage={item.sender_id === user.id} />
        )}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
        onEndReached={loadMoreMessages}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          isLoadingMore ? (
            <View className="py-4 items-center">
              <ActivityIndicator size="small" color="#0A84FF" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20">
            <Ionicons name="chatbubble-outline" size={64} color="#575757" />
            <Text className="text-text-disabled mt-4 text-center">
              Ingen beskeder endnu{'\n'}Send den første besked!
            </Text>
          </View>
        }
      />

      {/* Input Area */}
      <View className="border-t border-surface px-4 py-3 bg-background">
        <View className="flex-row items-center gap-2">
          <TextInput
            className="flex-1 bg-surface rounded-full px-4 py-3 text-white"
            placeholder="Skriv en besked..."
            placeholderTextColor="#6B7280"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
          />
          <Pressable
            onPress={handleSend}
            disabled={!inputText.trim()}
            className={`w-10 h-10 rounded-full items-center justify-center ${
              inputText.trim() ? 'bg-primary' : 'bg-surface'
            }`}
          >
            <Ionicons
              name="send"
              size={20}
              color={inputText.trim() ? '#ffffff' : '#6B7280'}
            />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

