import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, checkAuth } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isAuthenticated && segments[0] === ('(auth)' as any)) {
      router.replace('/(auth)/login' as any);
    }
  }, [isAuthenticated, segments, router]);

  if (!isAuthenticated) {
    return (
      <View className="flex-1 bg-[#171616] justify-center items-center">
        <ActivityIndicator size="large" color="#ffffff" />
        <Text className="text-white mt-4">Checking authentication...</Text>
      </View>
    );
  }

  return <>{children}</>;
};
