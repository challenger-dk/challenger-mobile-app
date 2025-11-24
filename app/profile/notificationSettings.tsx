import { ScreenHeader } from '@/components/common';
import { useUpdateUserSettings } from '@/hooks/queries/useUsers';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import type { UserSettings } from '@/types/settings';
import { useEffect, useState } from 'react';
import { ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface NotificationItemProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

const NotificationItem = ({ label, description, value, onValueChange, disabled }: NotificationItemProps) => (
  <View className="flex-row items-center justify-between py-4 border-b border-[#2c2c2c]">
    <View className="flex-1 mr-4">
      <Text className="text-white text-base font-medium">{label}</Text>
      {description && (
        <Text className="text-[#9CA3AF] text-xs mt-1">{description}</Text>
      )}
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{ false: '#2c2c2c', true: '#0A84FF' }}
      thumbColor={value ? '#ffffff' : '#f4f3f4'}
      ios_backgroundColor="#3e3e3e"
    />
  </View>
);

export default function NotificationsSettingsScreen() {
  const { user } = useCurrentUser();
  const { mutate: updateSettings } = useUpdateUserSettings();

  // Default state using snake_case to match backend
  const [settings, setSettings] = useState<UserSettings>({
    notify_team_invite: true,
    notify_friend_req: true,
    notify_challenge_invite: true,
    notify_challenge_update: true,
  });

  // Sync local state with user data when it loads
  useEffect(() => {
    if (user?.settings) {
      setSettings(prev => ({
        ...prev,
        ...user.settings
      }));
    }
  }, [user]);

  const handleToggle = (key: keyof UserSettings, value: boolean) => {
    if (!user) return;

    // 1. Optimistic Update
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    // 2. API Update: Send ONLY the changed field
    // Because we switched the type to snake_case, this will now send:
    // { "notify_team_invite": false }
    // instead of { "notifyTeamInvite": false }
    updateSettings({ [key]: value });
  };

  return (
    <SafeAreaView className="flex-1 bg-[#171616]" edges={['top']}>
      <View className="px-6 flex-1">
        <ScreenHeader title="Notifikationer" />

        <ScrollView className="mt-2" showsVerticalScrollIndicator={false}>
          <Text className="text-[#9CA3AF] text-sm font-medium mb-4 uppercase tracking-wider">Socialt</Text>

          <NotificationItem
            label="Venneanmodninger"
            description="Når du modtager en ny venneanmodning"
            value={settings.notify_friend_req}
            onValueChange={(val) => handleToggle('notify_friend_req', val)}
          />

          <NotificationItem
            label="Holdinvitationer"
            description="Når du bliver inviteret til et hold"
            value={settings.notify_team_invite}
            onValueChange={(val) => handleToggle('notify_team_invite', val)}
          />

          <View className="h-8" />
          <Text className="text-[#9CA3AF] text-sm font-medium mb-4 uppercase tracking-wider">Udfordringer</Text>

          <NotificationItem
            label="Invitationer"
            description="Når du bliver inviteret til en udfordring"
            value={settings.notify_challenge_invite}
            onValueChange={(val) => handleToggle('notify_challenge_invite', val)}
          />

          <NotificationItem
            label="Opdateringer"
            description="Ændringer i dine planlagte udfordringer"
            value={settings.notify_challenge_update}
            onValueChange={(val) => handleToggle('notify_challenge_update', val)}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
