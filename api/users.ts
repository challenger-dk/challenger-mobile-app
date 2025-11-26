import type { UserSettings } from "@/types/settings";
import type {CommonStats, CreateUser, UpdateUser} from '@/types/user';
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

export const getUserCommonStats = async (targetUserId: string | number) => {
  const response = await authenticatedFetch(getApiUrl(`/users/${targetUserId}/in-common`));
  if (!response.ok) {
    // Fallback if endpoint fails
    return {
      common_friends_count: 0,
      common_teams_count: 0,
      common_sports: []
    };
  }
  return response.json() as Promise<CommonStats>;
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

// Updated to safely handle empty responses
export const updateUserSettings = async (settings: Partial<UserSettings>) => {
  const response = await authenticatedFetch(getApiUrl(`/users/settings`), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(settings),
  });

  if (response.status === 204) {
    return { success: true };
  }

  // Read as text first to check for empty body
  const text = await response.text();

  if (!text) {
    // If response is OK but empty, treat as success
    if (response.ok) {
      return { success: true };
    }
    return { error: 'Failed to update user settings' };
  }

  try {
    const responseData = JSON.parse(text);
    if (!response.ok) {
      return { error: responseData.message || responseData.error || 'Failed to update user settings' };
    }
    return responseData;
  } catch (e) {
    // If response is OK but not valid JSON (and not empty), treat as success or handle accordingly
    if (response.ok) {
      return { success: true };
    }
    return { error: 'Invalid server response' };
  }
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

export const removeFriend = async (userId: string) => {
  const response = await authenticatedFetch(getApiUrl(`/users/${userId}/remove`), {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    }
  });

  if (response.status === 204) {
    return { success: true };
  }

  // Read as text first to check for empty body
  const text = await response.text();

  if (!text) {
    // If response is OK but empty, treat as success
    if (response.ok) {
      return { success: true };
    }
    return { error: 'Failed to remove friend' };
  }

  try {
    const responseData = JSON.parse(text);
    if (!response.ok) {
      return { error: responseData.message || responseData.error || 'Failed to remove friend' };
    }
    return responseData;
  } catch (e) {
    if (response.ok) {
      return { success: true };
    }
    return { error: 'Invalid server response' };
  }
};
