import type { UserSettings } from '@/types/settings';
import type { CommonStats, CreateUser, EmergencyContact, UpdateUser, UsersSearchResponse } from '@/types/user';
import { authenticatedFetch, getApiUrl } from '@/utils/api';

export const getUsers = async (): Promise<UsersSearchResponse> => {
  const response = await authenticatedFetch(getApiUrl('/users'));

  if (!response.ok) {
    throw new Error(`Failed to get users: ${response.status}`);
  }

  return response.json();
};

/**
 * Search users with optional query and pagination
 * @param searchQuery - Optional search query to filter users by name or email
 * @param limit - Number of results per page (default: 20, max: 50)
 * @param cursor - Cursor for pagination (from previous response's next_cursor)
 * @returns UsersSearchResponse with users array and next_cursor for pagination
 */
export const searchUsers = async (
  searchQuery?: string,
  limit: number = 20,
  cursor?: string
): Promise<UsersSearchResponse> => {
  const params = new URLSearchParams();

  if (searchQuery && searchQuery.trim()) {
    params.append('q', searchQuery.trim());
  }

  if (limit) {
    params.append('limit', limit.toString());
  }

  if (cursor) {
    params.append('cursor', cursor);
  }

  const url = params.toString()
    ? getApiUrl(`/users?${params.toString()}`)
    : getApiUrl('/users');

  const response = await authenticatedFetch(url);

  if (!response.ok) {
    throw new Error(`Failed to search users: ${response.status}`);
  }

  return response.json();
};

export const getCurrentUser = async () => {
  const response = await authenticatedFetch(getApiUrl('/users/me'));
  if (!response.ok) {
    return { error: 'Failed to get current user' };
  }
  return response.json();
};

export const getUserById = async (userId: string | number) => {
  const response = await authenticatedFetch(getApiUrl(`/users/${userId}`));
  return response.json();
};

export const getUserCommonStats = async (targetUserId: string | number) => {
  const response = await authenticatedFetch(
    getApiUrl(`/users/${targetUserId}/in-common`)
  );
  if (!response.ok) {
    // Fallback if endpoint fails
    return {
      common_friends_count: 0,
      common_teams_count: 0,
      common_sports: [],
    };
  }
  return response.json() as Promise<CommonStats>;
};

export const getSuggestedFriends = async () => {
  const response = await authenticatedFetch(getApiUrl('/users/suggested-friends'));
  return response.json();
};

export const updateUser = async (user: UpdateUser) => {
  const response = await authenticatedFetch(getApiUrl(`/users`), {
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

  // Safely handle empty 200 OK responses
  const text = await response.text();
  if (!text) {
    return { success: true };
  }

  try {
    const responseData = JSON.parse(text);
    if (!response.ok) {
      return {
        error:
          responseData.message || responseData.error || 'Failed to update user',
      };
    }
    return responseData;
  } catch (e) {
    // If response is OK but not JSON (and not empty), treat as success
    if (response.ok) {
      return { success: true };
    }
    return { error: 'Invalid server response' };
  }
};

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

  const text = await response.text();

  if (!text) {
    if (response.ok) {
      return { success: true };
    }
    return { error: 'Failed to update user settings' };
  }

  try {
    const responseData = JSON.parse(text);
    if (!response.ok) {
      return {
        error:
          responseData.message ||
          responseData.error ||
          'Failed to update user settings',
      };
    }
    return responseData;
  } catch (e) {
    if (response.ok) {
      return { success: true };
    }
    return { error: 'Invalid server response' };
  }
};

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
  const response = await authenticatedFetch(
    getApiUrl(`/users/${userId}/remove`),
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (response.status === 204) {
    return { success: true };
  }

  const text = await response.text();

  if (!text) {
    if (response.ok) {
      return { success: true };
    }
    return { error: 'Failed to remove friend' };
  }

  try {
    const responseData = JSON.parse(text);
    if (!response.ok) {
      return {
        error:
          responseData.message ||
          responseData.error ||
          'Failed to remove friend',
      };
    }
    return responseData;
  } catch (e) {
    if (response.ok) {
      return { success: true };
    }
    return { error: 'Invalid server response' };
  }
};

export const blockUser = async (userId: string) => {
  const response = await authenticatedFetch(
    getApiUrl(`/users/block/${userId}`),
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (response.status === 204) {
    return { success: true };
  }

  const text = await response.text();

  if (!text) {
    if (response.ok) {
      return { success: true };
    }
    return { error: 'Failed to block user' };
  }

  try {
    const responseData = JSON.parse(text);
    if (!response.ok) {
      return {
        error:
          responseData.message || responseData.error || 'Failed to block user',
      };
    }
    return responseData;
  } catch (e) {
    if (response.ok) {
      return { success: true };
    }
    return { error: 'Invalid server response' };
  }
};

export const unblockUser = async (userId: string) => {
  const response = await authenticatedFetch(
    getApiUrl(`/users/unblock/${userId}`),
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (response.status === 204) {
    return { success: true };
  }

  const text = await response.text();

  if (!text) {
    if (response.ok) {
      return { success: true };
    }
    return { error: 'Failed to unblock user' };
  }

  try {
    const responseData = JSON.parse(text);
    if (!response.ok) {
      return {
        error:
          responseData.message ||
          responseData.error ||
          'Failed to unblock user',
      };
    }
    return responseData;
  } catch (e) {
    if (response.ok) {
      return { success: true };
    }
    return { error: 'Invalid server response' };
  }
};

export const createEmergencyContact = async (contact: EmergencyContact) => {
  const response = await authenticatedFetch(getApiUrl('/emergency-info'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(contact),
  });

  if (response.status === 201) {
    return { success: true };
  }

  const text = await response.text();

  if (!text) {
    if (response.ok) {
      return { success: true };
    }
    return { error: 'Failed to create emergency contact' };
  }

  try {
    const responseData = JSON.parse(text);
    if (!response.ok) {
      return { error: responseData.message || responseData.error || 'Failed to create emergency contact' };
    }
    return responseData;
  }
  catch (e) {
    if (response.ok) {
      return { success: true };
    }
    return { error: 'Invalid server response' };
  }
}

export const updateEmergencyContact = async (contactId: string | number, contact: EmergencyContact) => {
  const response = await authenticatedFetch(getApiUrl(`/emergency-info/${contactId}`), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(contact),
  });

  if (response.status === 204) {
    return { success: true };
  }

  const text = await response.text();

  if (!text) {
    if (response.ok) {
      return { success: true };
    }
    return { error: 'Failed to update emergency contact' };
  }

  try {
    const responseData = JSON.parse(text);
    if (!response.ok) {
      return { error: responseData.message || responseData.error || 'Failed to update emergency contact' };
    }
    return responseData;
  } catch (e) {
    if (response.ok) {
      return { success: true };
    }
    return { error: 'Invalid server response' };
  }
}

export const deleteEmergencyContact = async (contactId: string | number) => {
  const response = await authenticatedFetch(getApiUrl(`/emergency-info/${contactId}`), {
    method: 'DELETE',
  });

  if (response.status === 204) {
    return { success: true };
  }

  const text = await response.text();

  if (!text) {
    if (response.ok) {
      return { success: true };
    }
    return { error: 'Failed to delete emergency contact' };
  }

  try {
    const responseData = JSON.parse(text);
    if (!response.ok) {
      return { error: responseData.message || responseData.error || 'Failed to delete emergency contact' };
    }
    return responseData;
  } catch (e) {
    if (response.ok) {
      return { success: true };
    }
    return { error: 'Invalid server response' };
  }
};
