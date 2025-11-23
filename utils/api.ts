import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Gets the API base URL from environment variables.
 * Default Dev: Port 8080
 */
export const getApiBaseUrl = (): string => {
  let apiUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

  // If API URL is set in env, validate and use it
  if (apiUrl) {
    // Basic validation
    if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://') && apiUrl !== '/api') {
      console.warn('Warning: API URL should start with http:// or https://. Got:', apiUrl);
    }

    // On Android, replace localhost with 10.0.2.2 (maps to host machine's localhost)
    if (Platform.OS === 'android' && apiUrl.includes('localhost')) {
      apiUrl = apiUrl.replace('localhost', '10.0.2.2');
    }

    return apiUrl;
  }

  // Fallback: For mobile, we need an absolute URL
  // Default to localhost for iOS simulator, 10.0.2.2 for Android emulator
  // User should set EXPO_PUBLIC_API_BASE_URL in .env for their setup
  if (__DEV__) {
    // For web, /api works with proxy
    // For mobile, we need absolute URL
    if (Platform.OS === 'android') {
      // Android emulator: use 10.0.2.2 to access host machine's localhost
      return 'http://10.0.2.2:3000';
    } else {
      // iOS simulator: localhost works fine
      return 'http://localhost:3000';
    }
  }

  // Production fallback (should not happen if env is set)
  return '';
};

/**
 * Gets the Chat Service URL (HTTP)
 * Default Dev: Port 8082
 */
export const getChatServiceUrl = (): string => {
  let chatUrl = process.env.EXPO_PUBLIC_CHAT_API_URL;

  if (chatUrl) {
    if (Platform.OS === 'android' && chatUrl.includes('localhost')) {
      chatUrl = chatUrl.replace('localhost', '10.0.2.2');
    }
    return chatUrl;
  }

  // Fallback for development
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:8082'; // Chat on 8082
    }
    return 'http://localhost:8082'; // Chat on 8082
  }

  return '';
};

/**
 * Gets the WebSocket URL
 * Default Dev: Port 8082
 */
export const getWebSocketUrl = (): string => {
  let wsUrl = process.env.EXPO_PUBLIC_WS_URL;

  if (wsUrl) {
    if (Platform.OS === 'android' && wsUrl.includes('localhost')) {
      wsUrl = wsUrl.replace('localhost', '10.0.2.2');
    }
    return wsUrl;
  }

  // Fallback for development
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'ws://10.0.2.2:8082'; // WebSocket on 8082
    }
    return 'ws://localhost:8082'; // WebSocket on 8082
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

  console.log(`[API] ${options.method || 'GET'} ${url}`); // Debug log

  const response = await fetch(url, fetchOptions);

  if (response.status === 401 || response.status === 403) {
    throw new AuthenticationError(`Authentication failed: ${response.status}`);
  }

  return response;
};