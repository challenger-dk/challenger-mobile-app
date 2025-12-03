import { ErrorBoundary } from '@/components/ErrorBoundary';
import { toastConfig } from '@/components/common/ToastConfig';
import { AuthProvider } from '@/contexts/AuthContext';
import { WebSocketProvider } from '@/contexts/WebSocketContext';
import { queryClient } from '@/lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LogBox, StyleSheet, View } from 'react-native';
import Toast from 'react-native-toast-message';
import '../global.css';

LogBox.ignoreAllLogs(true);

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <View style={styles.container}>
          <AuthProvider>
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
                {/* Removed invalid 'user-settings' route */}
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
  },
});
