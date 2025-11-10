import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute = ({ children }: PublicRouteProps) => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isAuthenticated && segments[0] === '(auth)' as any) {
      router.replace('/(tabs)' as any);
    }
  }, [isAuthenticated, segments, router]);

  // If authenticated, don't render children (will redirect)
  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

