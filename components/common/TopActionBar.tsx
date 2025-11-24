import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

interface TopActionBarProps {
  title?: string;
  leftAction?: React.ReactNode;
  showNotifications?: boolean;
  showCalendar?: boolean;
  showSettings?: boolean;
  onNotificationsPress?: () => void;
  onCalendarPress?: () => void;
  onSettingsPress?: () => void;
  settingsRoute?: string;
}

export const TopActionBar = ({
  title,
  leftAction,
  showNotifications = true,
  showCalendar = true,
  showSettings = true,
  onNotificationsPress,
  onCalendarPress,
  onSettingsPress,
  settingsRoute,
}: TopActionBarProps) => {
  const router = useRouter();

  const handleSettingsPress = () => {
    if (onSettingsPress) {
      onSettingsPress();
    } else if (settingsRoute) {
      router.push(settingsRoute as any);
    }
  };

  return (
    <View className="flex-row items-center px-6 py-3">
      {leftAction ? (
        <View className="flex-1 items-start">{leftAction}</View>
      ) : (
        <View className="flex-1" />
      )}

      {title && !leftAction && (
        <View className="flex-1 items-center">
          <Text className="text-white text-lg font-medium">{title}</Text>
        </View>
      )}

      <View className="flex-1 flex-row items-center justify-end gap-2">
        {showNotifications && (
          <Pressable onPress={onNotificationsPress} aria-label="Notifications">
            <Ionicons name="notifications" size={28} color="#ffffff" />
          </Pressable>
        )}
        {showCalendar && (
          <Pressable onPress={onCalendarPress} aria-label="Calendar">
            <Ionicons name="calendar-outline" size={28} color="#ffffff" />
          </Pressable>
        )}
        {showSettings && (
          <Pressable onPress={handleSettingsPress} aria-label="Settings">
            <Ionicons name="settings" size={28} color="#ffffff" />
          </Pressable>
        )}
      </View>
    </View>
  );
};

