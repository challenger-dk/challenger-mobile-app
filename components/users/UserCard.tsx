import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { User } from '@/types/user';

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
        {user.profile_picture ? (
          <Image
            source={{ uri: user.profile_picture }}
            className="w-12 h-12 rounded-full"
            contentFit="cover"
          />
        ) : (
          <View className="w-12 h-12 rounded-full bg-[#575757] justify-center items-center">
            <Ionicons name="person" size={24} color="#ffffff" />
          </View>
        )}
        <View>
          <Text className="text-white text-base font-medium">
            {user.first_name} {user.last_name || ''}
          </Text>
        </View>
      </View>
      {rightAction && <View>{rightAction}</View>}
    </Pressable>
  );
};