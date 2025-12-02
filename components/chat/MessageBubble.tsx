import { Avatar } from '@/components/common';
import { ActionMenu, MenuAction } from '@/components/common/ActionMenu';
import { ReportModal } from '@/components/common/ReportModal';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import type { Message } from '../../types/message';
import React, { useState } from 'react';
import { Text, View } from 'react-native';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const { user } = useCurrentUser();
  const isMe = user ? message.sender_id === user.id : false;
  const [reportVisible, setReportVisible] = useState(false);

  // Construct name
  const senderName = message.sender
    ? `${message.sender.first_name} ${message.sender.last_name || ''}`.trim()
    : 'Unknown';

  const menuActions: MenuAction[] = [
    {
      label: 'Rapporter besked',
      icon: 'flag-outline',
      onPress: () => setReportVisible(true),
      variant: 'destructive'
    }
  ];

  return (
    <>
      <ReportModal
        visible={reportVisible}
        onClose={() => setReportVisible(false)}
        targetId={message.id}
        targetType="MESSAGE"
      />

      <View className={`flex-row mb-4 ${isMe ? 'justify-end' : 'justify-start'}`}>
        {!isMe && (
          <View className="mr-2 justify-end">
            <Avatar
              uri={message.sender?.profile_picture}
              size={32}
              placeholderIcon="person"
            />
          </View>
        )}

        <View className="max-w-[80%]">
          {/* Sender Name - Displayed for all incoming messages */}
          {!isMe && (
            <Text className="text-xs text-text-muted mb-1 ml-1">
              {senderName}
            </Text>
          )}

          {/* ActionMenu wrapping the bubble content as a trigger */}
          <ActionMenu
            actions={menuActions}
            trigger={
              <View
                className={`px-4 py-2 rounded-2xl ${
                  isMe ? 'bg-primary rounded-br-sm' : 'bg-surface rounded-bl-sm'
                }`}
              >
                <Text className="text-text text-base">{message.content}</Text>
              </View>
            }
          />
        </View>
      </View>
    </>
  );
};
