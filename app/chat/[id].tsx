import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState, useMemo } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageBubble } from '@/components/chat';
import { LoadingScreen } from '@/components/common';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import type { ConversationType } from '@/types/message';

export default function ChatRoomScreen() {
  const router = useRouter();
  const { id, type, name } = useLocalSearchParams<{ id: string; type: string; name: string }>();
  const { user } = useCurrentUser();
  const { messages, status, sendMessage, loadHistory } = useWebSocket();

  const [inputText, setInputText] = useState('');
  const conversationId = parseInt(id, 10);
  const conversationType = type as ConversationType;

  // Load history when entering the room
  useEffect(() => {
    if (conversationId && conversationType) {
      loadHistory(conversationId, conversationType);
    }
  }, [conversationId, conversationType, loadHistory]);

  // Sort messages Descending (Newest First) for Inverted FlatList
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
      sendMessage({ content: inputText, recipient_id: conversationId });
    }

    setInputText('');
  };

  if (!user || !id) return <LoadingScreen />;

  return (
    <SafeAreaView className="flex-1 bg-[#171616]" edges={['top']}>
      {/* Header */}
      <View className="px-4 py-3 border-b border-[#2c2c2c] flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} className="mr-3">
            <Ionicons name="chevron-back" size={28} color="#ffffff" />
          </Pressable>
          <View>
            <Text className="text-white text-lg font-bold">{name || 'Chat'}</Text>
            <View className="flex-row items-center">
              <View className={`w-2 h-2 rounded-full mr-2 ${status === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
              <Text className="text-gray-500 text-xs">{status === 'connected' ? 'Online' : 'Forbinder...'}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        data={sortedMessages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <MessageBubble message={item} />}
        inverted
        contentContainerStyle={{ padding: 20 }}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center mt-10 transform scale-y-[-1]">
            {/* Note: scale-y-[-1] flips the text back up because the list is inverted */}
            <Text className="text-gray-500">Ingen beskeder her endnu.</Text>
          </View>
        }
      />

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View className="p-4 bg-[#171616] border-t border-[#2c2c2c] flex-row items-center gap-3">
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Skriv en besked..."
            placeholderTextColor="#575757"
            className="flex-1 bg-[#2c2c2c] text-white p-3 rounded-2xl max-h-24"
            multiline
          />
          <Pressable
            onPress={handleSend}
            disabled={!inputText.trim() || status !== 'connected'}
            className={`p-3 rounded-full ${inputText.trim() ? 'bg-[#0A84FF]' : 'bg-[#2c2c2c]'}`}
          >
            <Ionicons name="send" size={20} color={inputText.trim() ? '#ffffff' : '#575757'} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}