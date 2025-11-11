import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

export default function HubScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-[#171616]">
      {/* Header Section */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <Text className="text-white text-xl font-bold">Hub</Text>
        <Pressable
          onPress={() => router.push('/hub/create' as any)}
          className="bg-white rounded-full p-2"
          aria-label="Create Challenge"
        >
          <Ionicons name="add" size={24} color="#171616" />
        </Pressable>
      </View>

      {/* Content Area */}
      <View className="flex-1 px-6 py-4">
        <Text className="text-white">Hub</Text>
      </View>
    </View>
  );
}

