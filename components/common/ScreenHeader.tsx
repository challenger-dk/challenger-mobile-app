import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

interface ScreenHeaderProps {
  title: string;
  showBackButton?: boolean;
  rightAction?: React.ReactNode;
}

export const ScreenHeader = ({ title, showBackButton = true, rightAction }: ScreenHeaderProps) => {
  const router = useRouter();

  return (
    <View className="w-full flex-row items-center mb-6 mt-8" style={{ maxWidth: 384 }}>
      {showBackButton ? (
        <Pressable
          onPress={() => router.back()}
          style={{ flex: 1 }}
        >
          <Ionicons name="chevron-back-outline" size={24} color="#9CA3AF" />
        </Pressable>
      ) : (
        <View style={{ flex: 1 }} />
      )}
      <Text className="text-white text-2xl font-bold text-center" style={{ flex: 4 }}>
        {title}
      </Text>
      {rightAction ? (
        <View style={{ flex: 1 }}>{rightAction}</View>
      ) : (
        <View style={{ flex: 1 }} />
      )}
    </View>
  );
};

