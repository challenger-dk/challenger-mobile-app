import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Text, View } from 'react-native';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import type { Message } from '../../types/message';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const { user } = useCurrentUser();
  const isMe = user ? message.sender_id === user.id : false;

  // Construct name
  const senderName = message.sender
    ? `${message.sender.first_name} ${message.sender.last_name || ''}`.trim()
    : 'Unknown';

  return (
    <View className={`flex-row mb-4 ${isMe ? 'justify-end' : 'justify-start'}`}>
      {!isMe && (
        <View className="mr-2 justify-end">
          {message.sender?.profile_picture ? (
            <Image
              source={{ uri: message.sender.profile_picture }}
              className="w-8 h-8 rounded-full"
              contentFit="cover"
            />
          ) : (
            <View className="w-8 h-8 rounded-full bg-[#575757] items-center justify-center">
              <Ionicons name="person" size={16} color="#ffffff" />
            </View>
          )}
        </View>
      )}

      <View className="max-w-[80%]">
        {/* Sender Name - Displayed for all incoming messages */}
        {!isMe && (
          <Text className="text-xs text-gray-400 mb-1 ml-1">
            {senderName}
          </Text>
        )}

        <View
          className={`px-4 py-2 rounded-2xl ${
            isMe ? 'bg-[#0A84FF] rounded-br-sm' : 'bg-[#2c2c2c] rounded-bl-sm'
          }`}
        >
          <Text className="text-white text-base">{message.content}</Text>
        </View>
      </View>
    </View>
  );
};