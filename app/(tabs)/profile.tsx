import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { ErrorScreen, LoadingScreen, TopActionBar } from '../../components/common';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrentUser } from '../../hooks/useCurrentUser';

export default function ProfileScreen() {
  const { user, loading, error } = useCurrentUser();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Log ud',
      'Er du sikker på, at du vil logge ud?',
      [
        {
          text: 'Annuller',
          style: 'cancel',
        },
        {
          text: 'Log ud',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login' as any);
          },
        },
      ]
    );
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen error={error} />;
  }

  return (
    <ScrollView className="flex-1 bg-[#171616]">
      {/* Top actions bar */}
      <TopActionBar
        title="Profil"
        leftAction={
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
        }
        settingsRoute="/profile/information"
      />

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

        {/* Logout button */}
        <View className="mb-6">
          <Pressable
            onPress={handleLogout}
            className="bg-[#943d40] rounded-lg p-4 items-center justify-center"
          >
            <Text className="text-white text-base font-medium">Log ud</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
