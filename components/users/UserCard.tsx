import { Avatar } from '@/components/common';
import { User } from '@/types/user';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

interface UserCardProps {
  user: User;
  onPress?: () => void;
  rightAction?: React.ReactNode;
}

export const UserCard = ({ user, onPress, rightAction }: UserCardProps) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className="flex-row items-center justify-between py-3"
    >
      <View className="flex-row items-center gap-4">
        <Avatar
          uri={user.profile_picture}
          size={48}
        />
        <View>
          <Text className="text-text text-base font-medium">
            {user.first_name} {user.last_name || ''}
          </Text>
        </View>
      </View>
      {rightAction && <View>{rightAction}</View>}
    </Pressable>
  );
};
