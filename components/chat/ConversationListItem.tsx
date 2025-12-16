import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Avatar } from '../common';
import { Ionicons } from '@expo/vector-icons';
import type { ConversationListItem as ConversationListItemType } from '@/types/conversation';
import { useRouter } from 'expo-router';

interface ConversationListItemProps {
  conversation: ConversationListItemType;
}

/**
 * Format timestamp to relative time (e.g., "2m ago", "Yesterday", "Jan 15")
 */
const formatTimestamp = (timestamp: string): string => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  // Format as "Jan 15"
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/**
 * Get display name for conversation
 */
const getConversationName = (conversation: ConversationListItemType): string => {
  if (conversation.type === 'direct' && conversation.other_user) {
    return `${conversation.other_user.first_name} ${conversation.other_user.last_name}`;
  }
  if (conversation.type === 'group' && conversation.title) {
    return conversation.title;
  }
  if (conversation.type === 'team' && conversation.team_name) {
    return conversation.team_name;
  }

  // Debug: Log conversations with missing data
  console.warn('Conversation with missing data:', {
    id: conversation.id,
    type: conversation.type,
    has_other_user: !!conversation.other_user,
    has_title: !!conversation.title,
    has_team_name: !!conversation.team_name,
    full_data: conversation,
  });

  return `${conversation.type === 'direct' ? 'Direct' : conversation.type === 'group' ? 'Group' : 'Team'} Chat #${conversation.id}`;
};

/**
 * Get avatar URI for conversation
 */
const getConversationAvatar = (conversation: ConversationListItemType): string | null => {
  if (conversation.type === 'direct' && conversation.other_user) {
    return conversation.other_user.profile_picture || null;
  }
  return null;
};

/**
 * Get placeholder icon for conversation
 */
const getPlaceholderIcon = (conversation: ConversationListItemType): 'person' | 'people' | 'shield' => {
  if (conversation.type === 'direct') return 'person';
  if (conversation.type === 'team') return 'shield';
  return 'people';
};

export const ConversationListItem: React.FC<ConversationListItemProps> = ({ conversation }) => {
  const router = useRouter();

  const name = getConversationName(conversation);
  const avatar = getConversationAvatar(conversation);
  const placeholderIcon = getPlaceholderIcon(conversation);
  const hasUnread = conversation.unread_count > 0;
  const lastMessagePreview = conversation.last_message?.content || 'No messages yet';
  const timestamp = conversation.last_message?.created_at || conversation.updated_at;

  const handlePress = () => {
    router.push({
      pathname: '/chat/[id]',
      params: { 
        id: conversation.id,
        name,
      },
    } as any);
  };

  return (
    <Pressable
      onPress={handlePress}
      className="flex-row items-center p-4 border-b border-surface active:bg-surface/50"
    >
      {/* Avatar */}
      <View className="mr-4">
        <Avatar
          uri={avatar}
          size={56}
          placeholderIcon={placeholderIcon}
          className="bg-surface"
        />
        {/* Unread badge */}
        {hasUnread && (
          <View className="absolute -top-1 -right-1 bg-danger rounded-full min-w-[20px] h-5 items-center justify-center px-1">
            <Text className="text-white text-xs font-bold">
              {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
            </Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View className="flex-1">
        <View className="flex-row items-center justify-between mb-1">
          <Text className={`text-base ${hasUnread ? 'font-bold text-white' : 'font-medium text-text'}`}>
            {name}
          </Text>
          <Text className="text-text-disabled text-xs">
            {formatTimestamp(timestamp)}
          </Text>
        </View>

        <View className="flex-row items-center">
          <Text 
            className={`flex-1 text-sm ${hasUnread ? 'text-text font-medium' : 'text-text-disabled'}`}
            numberOfLines={1}
          >
            {lastMessagePreview}
          </Text>
          {conversation.type === 'group' && conversation.participant_count && (
            <View className="flex-row items-center ml-2">
              <Ionicons name="people" size={14} color="#6B7280" />
              <Text className="text-text-disabled text-xs ml-1">
                {conversation.participant_count}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Chevron */}
      <Ionicons name="chevron-forward" size={20} color="#575757" className="ml-2" />
    </Pressable>
  );
};

