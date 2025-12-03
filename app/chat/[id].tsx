import { MessageBubble } from '@/components/chat';
import { LoadingScreen, ScreenContainer } from '@/components/common';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useMarkChatRead } from '@/hooks/queries/useChats';
import type { ConversationType } from '@/types/message';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ChatRoomScreen() {
  const router = useRouter();
  const { id, type, name } = useLocalSearchParams<{ id: string; type: string; name: string }>();
  const { user } = useCurrentUser();
  const { messages, status, sendMessage, loadHistory } = useWebSocket();
  const { mutate: markRead } = useMarkChatRead();
  const insets = useSafeAreaInsets();

  const [inputText, setInputText] = useState('');
  const conversationId = parseInt(id, 10);
  const conversationType = type as ConversationType;

  useEffect(() => {
    if (conversationId && conversationType) {
      loadHistory(conversationId, conversationType);

      if (conversationType === 'chat') {
        markRead(conversationId);
      }
    }
  }, [conversationId, conversationType, loadHistory]);

  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    if (conversationType === 'team') {
      sendMessage({ content: inputText, team_id: conversationId });
    } else {
      sendMessage({ content: inputText, chat_id: conversationId });
    }

    setInputText('');
  };

  if (!user || !id) return <LoadingScreen />;

  return (
    <ScreenContainer safeArea edges={['top']}>
      <View className="px-4 py-3 border-b border-surface flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} className="mr-3">
            <Ionicons name="chevron-back" size={28} color="#ffffff" />
          </Pressable>
          <View>
            <Text className="text-text text-lg font-bold">{name || 'Chat'}</Text>
            <View className="flex-row items-center">
              <View className={`w-2 h-2 rounded-full mr-2 ${status === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
              <Text className="text-text-muted text-xs">{status === 'connected' ? 'Online' : 'Forbinder...'}</Text>
            </View>
          </View>
        </View>
      </View>

      <FlatList
        data={sortedMessages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <MessageBubble message={item} />}
        inverted
        contentContainerStyle={{ padding: 20 }}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center mt-10 transform scale-y-[-1]">
            <Text className="text-text-muted">Ingen beskeder her endnu.</Text>
          </View>
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.bottom : 0}
      >
        <View
          className="p-4 bg-background border-t border-surface flex-row items-center gap-3"
          style={{ paddingBottom: 16 + insets.bottom }}
        >
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Skriv en besked..."
            placeholderTextColor="#575757"
            className="flex-1 bg-surface text-text p-3 rounded-2xl max-h-24"
            multiline
          />
          <Pressable
            onPress={handleSend}
            disabled={!inputText.trim() || status !== 'connected'}
            className={`p-3 rounded-full ${inputText.trim() ? 'bg-primary' : 'bg-surface'}`}
          >
            <Ionicons name="send" size={20} color={inputText.trim() ? '#ffffff' : '#575757'} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
