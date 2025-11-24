import type { UserSettings } from "@/types/settings";
import type { CreateUser, UpdateUser } from '@/types/user';
import { authenticatedFetch, getApiUrl } from '@/utils/api';

export const getUsers = async () => {
  const response = await authenticatedFetch(getApiUrl('/users'));
  return response.json();
};

export const getCurrentUser = async () => {
  const response = await authenticatedFetch(getApiUrl('/users/me'));
  return response.json();
};

export const getUserById = async (userId: string | number) => {
  const response = await authenticatedFetch(getApiUrl(`/users/${userId}`));
  return response.json();
};

export const updateUser = async (userId: string, user: UpdateUser) => {
  const response = await authenticatedFetch(getApiUrl(`/users/${userId}`), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user),
  });

  // Handle 204 No Content
  if (response.status === 204) {
    return { success: true };
  }

  const responseData = await response.json();

  if (!response.ok) {
    return { error: responseData.message || responseData.error || 'Failed to update user' };
  }

  return responseData;
};

// Updated to accept Partial<UserSettings>
export const updateUserSettings = async (settings: Partial<UserSettings>) => {
  const response = await authenticatedFetch(getApiUrl(`/users/settings`), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    // JSON.stringify will ignore undefined fields,
    // or if you send { notifyFriendReq: true }, only that key is sent.
    body: JSON.stringify(settings),
  });

  if (response.status === 204) {
    return { success: true };
  }

  const responseData = await response.json();

  if (!response.ok) {
    return { error: responseData.message || responseData.error || 'Failed to update user settings' };
  }

  return responseData;
}

export const createUser = async (user: CreateUser) => {
  const response = await authenticatedFetch(getApiUrl('/users'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user),
  });
  return response.json();
};
