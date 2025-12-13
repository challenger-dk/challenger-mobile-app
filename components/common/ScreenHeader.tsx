import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

interface ScreenHeaderProps {
  title: string;
  showBackButton?: boolean;
  rightAction?: React.ReactNode;
}

export const ScreenHeader = ({
  title,
  showBackButton = true,
  rightAction,
}: ScreenHeaderProps) => {
  const router = useRouter();

  return (
    <View className="w-full flex-row items-center justify-between mb-6 mt-4">
      {showBackButton ? (
        <Pressable onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="chevron-back" size={28} color="#ffffff" />
        </Pressable>
      ) : (
        <View style={{ width: 44 }} />
      )}
      <Text className="text-white text-2xl font-bold flex-1 text-center">
        {title}
      </Text>
      {rightAction ? (
        <View className="items-end">{rightAction}</View>
      ) : (
        <View style={{ width: 44 }} />
      )}
    </View>
  );
};
