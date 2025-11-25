import { useQuery } from '@tanstack/react-query';
import { getNotifications } from '@/api/notifications';
import { queryKeys } from '@/lib/queryClient';
import { useCurrentUser } from '@/hooks/useCurrentUser';

/**
 * Query hook to fetch unread notifications count
 */
export const useUnreadNotifications = () => {
  const { user } = useCurrentUser();

  return useQuery({
    queryKey: queryKeys.notifications.unread(),
    queryFn: () => getNotifications({ read: false, limit: 99 }),
    // Only run if user is logged in
    enabled: !!user,
    // Refresh every 10 seconds
    refetchInterval: 10000,
    // Fetch immediately on mount
    refetchOnMount: true,
    // Consider data stale immediately to ensure fresh fetch on mount
    staleTime: 0,
  });
};
