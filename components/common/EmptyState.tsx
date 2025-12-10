import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
}

export const EmptyState = ({
  icon = 'alert-circle-outline',
  title,
  description,
}: EmptyStateProps) => {
  return (
    <View className="py-12 items-center justify-center">
      <View className="w-16 h-16 rounded-full bg-[#2c2c2c] items-center justify-center mb-4">
        <Ionicons name={icon} size={32} color="#575757" />
      </View>
      <Text className="text-white text-base font-medium text-center">
        {title}
      </Text>
      {description && (
        <Text className="text-[#9CA3AF] text-sm text-center mt-1">
          {description}
        </Text>
      )}
    </View>
  );
};
