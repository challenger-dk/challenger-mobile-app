import { Text, View } from 'react-native';

interface ErrorScreenProps {
  error: Error | { message: string };
  message?: string;
}

export const ErrorScreen = ({ error, message }: ErrorScreenProps) => {
  return (
    <View className="flex-1 bg-[#171616] justify-center items-center px-6">
      <Text className="text-white text-lg">
        {message || `Error: ${error.message}`}
      </Text>
    </View>
  );
};

