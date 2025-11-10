import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useCurrentUser } from '../../hooks/useCurrentUser';

export default function ProfileScreen() {
  const { user, loading, error } = useCurrentUser();
  const router = useRouter();

  if (loading) {
    return (
      <View className="flex-1 bg-[#171616] justify-center items-center">
        <ActivityIndicator size="large" color="#ffffff" />
        <Text className="text-white mt-4">Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-[#171616] justify-center items-center px-6">
        <Text className="text-white text-lg">Error: {error.message}</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-[#171616]">
      {/* Top actions bar */}
      <View className="flex-row items-center px-6 py-3">
        {/* User logo on the left */}
        <View className="flex-1 items-start">
          <Pressable
            onPress={() => router.push('/profile/information' as any)}
            className="rounded-full overflow-hidden w-10 h-10"
            style={{ backgroundColor: '#2c2c2c', justifyContent: 'center', alignItems: 'center' }}
          >
            {user.profile_picture ? (
              <Image
                source={{ uri: user.profile_picture }}
                className="w-10 h-10"
                contentFit="cover"
              />
            ) : (
              <View 
                className='w-10 h-10 rounded-full justify-center items-center'
                style={{ backgroundColor: '#FFFFFF' }}
              >
                <Ionicons name="person" size={24} color="#2c2c2c" />
              </View>
            )}
          </Pressable>
        </View>

        {/* "Profil" text in the middle */}
        <View className="flex-1 items-center">
          <Text className="text-white text-lg font-medium">Profil</Text>
        </View>

        {/* Icons on the right */}
        <View className="flex-1 flex-row items-center justify-end gap-2">
          <Pressable aria-label="Notifications">
            <Ionicons name="notifications" size={28} color="#ffffff" />
          </Pressable>
          <Pressable aria-label="Calendar">
            <Ionicons name="calendar-outline" size={28} color="#ffffff" />
          </Pressable>
          <Pressable
            onPress={() => router.push('/profile/information' as any)}
            aria-label="Settings"
          >
            <Ionicons name="settings" size={28} color="#ffffff" />
          </Pressable>
        </View>
      </View>

      {/* Divider line */}
      <View className="border-t border-[#272626]" />

      {/* Profile greeting */}
      <View className="px-6 pt-8 pb-6">
        <Text className="text-white text-2xl font-medium">
          Hej {user.first_name}
        </Text>
      </View>

      {/* Action buttons grid */}
      <View className="px-6">
        {/* First row: Venner, Teams, Favoritter */}
        <View className="flex-row gap-4 mb-4">
          {/* Venner button */}
          <Pressable className="flex-1 bg-[#2c2c2c] rounded-lg p-4 items-center justify-center gap-2">
            <Ionicons name="people" size={32} color="#273ba3" />
            <Text className="text-white text-sm">Venner (0)</Text>
          </Pressable>

          {/* Teams button */}
          <Pressable
            onPress={() => router.push('/teams' as any)}
            className="flex-1 bg-[#2c2c2c] rounded-lg p-4 items-center justify-center gap-2"
          >
            <Ionicons name="shield-checkmark" size={32} color="#016937" />
            <Text className="text-white text-sm">Teams</Text>
          </Pressable>

          {/* Favoritter button */}
          <Pressable className="flex-1 bg-[#2c2c2c] rounded-lg p-4 items-center justify-center gap-2">
            <Ionicons name="star" size={32} color="#fbb03c" />
            <Text className="text-white text-sm">Favoritter</Text>
          </Pressable>
        </View>

        {/* Second row: Nødinfo */}
        <View className="mb-4">
          <Pressable className="bg-[#2c2c2c] rounded-lg p-4 items-center justify-center gap-2 w-full">
            <Ionicons name="add-circle" size={32} color="#943d40" />
            <Text className="text-white text-sm">Nødinfo</Text>
          </Pressable>
        </View>

        {/* Stats block */}
        <View className="bg-[#2c2c2c] rounded-lg p-4 min-h-[200px] mb-6">
          <Text className="text-white text-lg font-medium mb-4">Stats</Text>
          {/* Stats content can be added here later */}
        </View>
      </View>
    </ScrollView>
  );
}
