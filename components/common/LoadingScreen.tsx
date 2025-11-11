import { ActivityIndicator, Text, View } from 'react-native';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen = ({ message = 'Loading...' }: LoadingScreenProps) => {
  return (
    <View className="flex-1 bg-[#171616] justify-center items-center">
      <ActivityIndicator size="large" color="#ffffff" />
      <Text className="text-white mt-4">{message}</Text>
    </View>
  );
};

