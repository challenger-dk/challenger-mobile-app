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

  // Handle 204 No Content - successful update with no response body
  if (response.status === 204) {
    return { success: true };
  }

  const responseData = await response.json();

  if (!response.ok) {
    return { error: responseData.message || responseData.error || 'Failed to update user' };
  }

  return responseData;
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
