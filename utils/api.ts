import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Gets the API base URL from environment variables.
 * Default Dev: Port 8080 (Make sure this matches your api/main.go)
 */
export const getApiBaseUrl = (): string => {
  let apiUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

  if (apiUrl) {
    if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://') && apiUrl !== '/api') {
      console.warn('Warning: API URL should start with http:// or https://. Got:', apiUrl);
    }

    if (Platform.OS === 'android' && apiUrl.includes('localhost')) {
      apiUrl = apiUrl.replace('localhost', '10.0.2.2');
    }

    return apiUrl;
  }

  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:8000';
    } else {
      return 'http://localhost:8000';
    }
  }

  return '';
};

/**
 * Gets the Chat Service URL (HTTP)
 * Default Dev: Port 8002 (Matches chat/main.go)
 */
export const getChatServiceUrl = (): string => {
  let chatUrl = process.env.EXPO_PUBLIC_CHAT_API_URL;

  if (chatUrl) {
    if (Platform.OS === 'android' && chatUrl.includes('localhost')) {
      chatUrl = chatUrl.replace('localhost', '10.0.2.2');
    }
    return chatUrl;
  }

  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:8002';
    }
    return 'http://localhost:8002';
  }

  return '';
};

/**
 * Gets the WebSocket URL
 * Default Dev: Port 8002 (Matches chat/main.go)
 */
export const getWebSocketUrl = (): string => {
  let wsUrl = process.env.EXPO_PUBLIC_WS_URL;

  if (wsUrl) {
    if (Platform.OS === 'android' && wsUrl.includes('localhost')) {
      wsUrl = wsUrl.replace('localhost', '10.0.2.2');
    }
    return wsUrl;
  }

  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'ws://10.0.2.2:8002';
    }
    return 'ws://localhost:8002';
  }

  return '';
};

export const getApiUrl = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  if (baseUrl.endsWith('/api')) {
    return `${baseUrl}${cleanEndpoint}`;
  }

  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  return `${cleanBaseUrl}${cleanEndpoint}`;
};

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = await SecureStore.getItemAsync('token');
  const headers = new Headers(options.headers);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers,
  };

  console.log(`[API] ${options.method || 'GET'} ${url}`);

  const response = await fetch(url, fetchOptions);

  if (response.status === 401 || response.status === 403) {
    throw new AuthenticationError(`Authentication failed: ${response.status}`);
  }

  return response;
};
