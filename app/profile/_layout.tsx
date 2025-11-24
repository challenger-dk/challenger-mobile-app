import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="information" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="notificationSettings" />
      <Stack.Screen name="friends" />
      <Stack.Screen name="teams" />
    </Stack>
  );
}
