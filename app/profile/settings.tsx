import { ScreenHeader } from '@/components/common';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

  return (
    <SafeAreaView className="flex-1 bg-[#171616]" edges={['top']}>
      <View className="px-6 flex-1">
        <ScreenHeader title="Indstillinger" />

        <ScrollView className="mt-2" showsVerticalScrollIndicator={false}>
          <SettingItem
            label="Sprog"
            value="Dansk"
            onPress={() => {}}
          />

          <SettingItem
            label="Notifikationer"
            onPress={() => router.push('/profile/notificationSettings' as any)}
          />

          <SettingItem
            label="Kalender Sync."
            onPress={() => {}}
          />

          <SettingItem
            label="Blokering"
            onPress={() => {}}
          />

          {/* Spacer for visual separation */}
          <View className="h-8" />

          <SettingItem
            label="Privatindstillinger"
            onPress={() => {}}
          />

          <SettingItem
            label="Tilladelser"
            onPress={() => {}}
          />

          {/* Spacer for visual separation */}
          <View className="h-8" />

          <SettingItem
            label="Privatpolitik"
            onPress={() => router.push('/privacy-policy' as any)}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
