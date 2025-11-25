import { authenticatedFetch, getApiUrl } from '@/utils/api';
import type { Notification } from '@/types/notification';

// Define filter options
type NotificationFilters = {
  read?: boolean;
  limit?: number;
  offset?: number;
};

export const getNotifications = async (filters?: NotificationFilters) => {
  // Build query string from filters
  const params = new URLSearchParams();

  if (filters?.read !== undefined) {
    params.append('read', String(filters.read));
  }
  if (filters?.limit) {
    params.append('limit', String(filters.limit));
  }
  if (filters?.offset) {
    params.append('offset', String(filters.offset));
  }

  const queryString = params.toString();
  const endpoint = queryString ? `/notifications?${queryString}` : '/notifications';

  const response = await authenticatedFetch(getApiUrl(endpoint));
  return response.json() as Promise<Notification[]>;
};

export const markRead = async (id: number) => {
  const response = await authenticatedFetch(getApiUrl(`/notifications/${id}/read`), {
    method: 'PUT',
  });

  if (!response.ok) {
    throw new Error('Failed to mark notification as read');
  }
};

export const markAllRead = async () => {
  const response = await authenticatedFetch(getApiUrl('/notifications/read-all'), {
    method: 'PUT',
  });

  if (!response.ok) {
    throw new Error('Failed to mark all as read');
  }
};
