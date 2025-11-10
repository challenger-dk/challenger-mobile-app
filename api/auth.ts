import type { CreateUser } from '../types/user';
import { getApiUrl } from '../utils/api';

export const login = async (email: string, password: string) => {
  const url = getApiUrl('/auth/login');
  console.log('Login request to:', url);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
      return { success: false, error: errorData.message || `HTTP ${response.status}: Login failed` };
    }

    const data = await response.json();
    return { success: true, token: data.token };
  } catch (error) {
    console.error('Login error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Network error occurred';
    return { success: false, error: errorMessage };
  }
};

export const register = async (data: CreateUser) => {
  // Build payload with only filled fields
  const payload: Record<string, unknown> = {
    email: data.email,
    password: data.password,
    first_name: data.first_name,
  };

  if (data.last_name && data.last_name.trim()) {
    payload.last_name = data.last_name;
  }

  if (data.profile_picture && data.profile_picture.trim()) {
    payload.profile_picture = data.profile_picture;
  }

  if (data.bio && data.bio.trim()) {
    payload.bio = data.bio;
  }

  if (data.favorite_sports && data.favorite_sports.length > 0) {
    payload.favorite_sports = data.favorite_sports;
  }

  const response = await fetch(getApiUrl('/auth/register'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const responseData = await response.json();

  if (!response.ok) {
    return { error: responseData.message || responseData.error || 'Registration failed' };
  }

  return responseData;
};

