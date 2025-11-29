import { Avatar, ErrorScreen, LoadingScreen, ScreenContainer, TopActionBar } from '@/components/common';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

const ProfileMenuItem = ({ icon, label, color, onPress, count }: any) => (
  <Pressable
    onPress={onPress}
    className="flex-1 bg-surface rounded-lg p-4 items-center justify-center gap-2"
  >
    <Ionicons name={icon} size={32} color={color} />
    <Text className="text-text text-sm">
      {label} {count !== undefined ? `(${count})` : ''}
    </Text>
  </Pressable>
);

export default function ProfileScreen() {
  const { user, loading, error } = useCurrentUser();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Log ud',
      'Er du sikker på, at du vil logge ud?',
      [
        { text: 'Annuller', style: 'cancel' },
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

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} />;
  if (!user) return <LoadingScreen />;

  const friendsCount = user.friends?.length || 0;

  return (
    <ScreenContainer>
      <TopActionBar
        title="Profil"
        leftAction={
          <Pressable onPress={() => router.push('/profile/information' as any)}>
            <Avatar uri={user.profile_picture} size={40} placeholderIcon="person" className="bg-surface" />
          </Pressable>
        }
        settingsRoute="/profile/settings"
      />

      <View className="border-t border-[#272626]" />

      <View className="px-6 pt-8 pb-6">
        <Text className="text-text text-2xl font-medium">
          Hej {user.first_name}
        </Text>
      </View>

      <View className="px-6">
        <View className="flex-row gap-4 mb-4">
          <ProfileMenuItem
            icon="people"
            label="Venner"
            color="#273ba3"
            count={friendsCount}
            onPress={() => router.push('/friends' as any)}
          />
          <ProfileMenuItem
            icon="shield-checkmark"
            label="Teams"
            color="#016937"
            onPress={() => router.push('/teams' as any)}
          />
          <ProfileMenuItem
            icon="star"
            label="Favoritter"
            color="#fbb03c"
          />
        </View>

        <View className="mb-4">
          <Pressable className="bg-surface rounded-lg p-4 items-center justify-center gap-2 w-full">
            <Ionicons name="add-circle" size={32} color="#943d40" />
            <Text className="text-text text-sm">Nødinfo</Text>
          </Pressable>
        </View>

        <View className="bg-surface rounded-lg p-4 min-h-[200px] mb-6">
          <Text className="text-text text-lg font-medium mb-4">Stats</Text>
        </View>

        <View className="mb-6">
          <Pressable
            onPress={handleLogout}
            className="bg-danger rounded-lg p-4 items-center justify-center"
          >
            <Text className="text-text text-base font-medium">Log ud</Text>
          </Pressable>
        </View>
      </View>
    </ScreenContainer>
  );
}
