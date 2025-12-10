import { ScreenHeader } from '@/components/common';
import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';

interface SettingItemProps {
  label: string;
  value?: string;
  onPress?: () => void;
}

const SettingItem = ({ label, value, onPress }: SettingItemProps) => (
  <Pressable
    onPress={onPress}
    className="flex-row items-center justify-between py-5 bg-transparent active:opacity-70"
  >
    <Text className="text-white text-lg font-semibold">{label}</Text>
    {value && (
      <View className="bg-[#2c2c2c] px-3 py-1 rounded-full">
        <Text className="text-[#9CA3AF] text-sm">{value}</Text>
      </View>
    )}
  </Pressable>
);

export default function SettingsScreen() {
  const router = useRouter();

  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Log ud', 'Er du sikker på, at du vil logge ud?', [
      { text: 'Annuller', style: 'cancel' },
      {
        text: 'Log ud',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login' as any);
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#171616]" edges={['top']}>
      <View className="px-6 flex-1">
        <ScreenHeader title="Indstillinger" />

        <ScrollView className="mt-2" showsVerticalScrollIndicator={false}>
          <SettingItem label="Sprog" value="Dansk" onPress={() => {}} />

          <SettingItem
            label="Notifikationer"
            onPress={() => router.push('/profile/notificationSettings' as any)}
          />

          <SettingItem label="Kalender Sync." onPress={() => {}} />

          <SettingItem label="Blokering" onPress={() => {}} />

          {/* Spacer for visual separation */}
          <View className="h-8" />

          <SettingItem label="Privatindstillinger" onPress={() => {}} />

          <SettingItem label="Tilladelser" onPress={() => {}} />

          {/* Spacer for visual separation */}
          <View className="h-8" />

          <SettingItem
            label="Support & Kontakt"
            onPress={() => router.push('/profile/support' as any)}
          />

          <SettingItem
            label="Privatpolitik"
            onPress={() => router.push('/privacy-policy' as any)}
          />
        </ScrollView>

        {/* Logout */}
        <Pressable
          onPress={handleLogout}
          className="bg-danger rounded-lg p-4 items-center justify-center"
        >
          <Text className="text-text text-base font-medium">Log ud</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
