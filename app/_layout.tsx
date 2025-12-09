import { ErrorBoundary } from '@/components/ErrorBoundary';
import { toastConfig } from '@/components/common/ToastConfig';
import { AuthProvider } from '@/contexts/AuthContext';
import { WebSocketProvider } from '@/contexts/WebSocketContext'; // <--- Import this
import { queryClient } from '@/lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LogBox, StyleSheet, View } from 'react-native';
import Toast from 'react-native-toast-message';
import '../global.css';

// Disable LogBox (error overlays) and debugger popup
// This prevents popups from blocking the bottom navigation bar during Maestro tests
// Set to false if you want to see error overlays during development
LogBox.ignoreAllLogs(true);

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <View style={styles.container}>
          <AuthProvider>
            {/* WebSocketProvider must be INSIDE AuthProvider */}
            <WebSocketProvider>
              <Stack screenOptions={{ headerShown: false }} initialRouteName="(auth)">
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="profile" />
                <Stack.Screen name="teams" />
                <Stack.Screen name="hub" />
                <Stack.Screen name="friends" />
                <Stack.Screen name="users" />
                <Stack.Screen name="chat/[id]" />
                <Stack.Screen name="user-settings" />
              </Stack>
              <StatusBar style="light" />
            </WebSocketProvider>
          </AuthProvider>
        </View>
      </QueryClientProvider>
      <Toast config={toastConfig} />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: '#171616',
    alignContent: 'center',
  },
});