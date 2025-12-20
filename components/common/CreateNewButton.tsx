import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { router } from 'expo-router';

interface CreateNewButtonProps {
	onPress: () => void;
	size?: number;
}

export const CreateNewButton = ({
	onPress,
	size = 28,
}: CreateNewButtonProps) => {
	return (
		<Pressable
          onPress={onPress}
          className="absolute bottom-8 right-6 bg-white rounded-full p-4 shadow-lg"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          <Ionicons name="add" size={size} color="#171616" />
        </Pressable>
	);
};
