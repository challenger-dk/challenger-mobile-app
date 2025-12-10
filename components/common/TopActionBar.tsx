import { useUnreadNotifications } from '@/hooks/queries';
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

  // Fetch unread count
  const { data: unreadNotifications = [] } = useUnreadNotifications();
  const unreadCount = unreadNotifications.length;

  const handleSettingsPress = () => {
    if (onSettingsPress) {
      onSettingsPress();
    } else if (settingsRoute) {
      router.push(settingsRoute as any);
    }
  };

  const handleNotificationsPress = () => {
    if (onNotificationsPress) {
      onNotificationsPress();
    } else {
      router.push('/notifications' as any);
    }
  };

  // Check if there are any right actions
  const hasRightActions = showNotifications || showCalendar || showSettings;
  // Title should be left-aligned if there are right actions AND no left action
  // Title should be centered if there are NO right actions OR there IS a left action
  const shouldCenterTitle = !hasRightActions || !!leftAction;
  // Use absolute positioning for true centering when needed
  const useAbsoluteCentering = shouldCenterTitle;

  return (
    <View
      className="flex-row items-center px-6 py-3 w-full"
      style={{ zIndex: 100 }}
    >
      {leftAction ? (
        <View className="flex-1 items-start">{leftAction}</View>
      ) : shouldCenterTitle ? (
        <View className="flex-1" />
      ) : null}

      {title && (
        <>
          {useAbsoluteCentering ? (
            <View className="absolute left-0 right-0 items-center">
              <Text className="text-white text-lg font-medium">{title}</Text>
            </View>
          ) : (
            <View style={{ flexShrink: 0 }}>
              <Text className="text-white text-lg font-medium">{title}</Text>
            </View>
          )}
        </>
      )}

      <View className="flex-1 flex-row items-center justify-end gap-2">
        {showNotifications && (
          <Pressable
            onPress={handleNotificationsPress}
            aria-label="Notifications"
            className="relative"
          >
            <Ionicons name="notifications" size={28} color="#ffffff" />
            {unreadCount > 0 && (
              <View className="absolute -top-1 -right-1 bg-red-600 rounded-full min-w-[16px] h-[16px] items-center justify-center px-[2px] border border-[#171616]">
                <Text className="text-white text-[10px] font-bold leading-3">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
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
