import * as SecureStore from 'expo-secure-store';

/**
 * Gets the API base URL from environment variables.
 * Uses EXPO_PUBLIC_API_BASE_URL from .env file.
 * 
 * For mobile development:
 * - iOS Simulator: http://localhost:3000
 * - Android Emulator: http://10.0.2.2:3000
 * - Physical Device: http://YOUR_COMPUTER_IP:3000 (e.g., http://192.168.1.100:3000)
 */
export const getApiBaseUrl = (): string => {
  let apiUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  
  // If API URL is set in env, validate and use it
  if (apiUrl) {
    // Basic validation
    if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://') && apiUrl !== '/api') {
      console.warn('Warning: API URL should start with http:// or https://. Got:', apiUrl);
    }
    
    return apiUrl;
  }
  
  // Fallback: For mobile, we need an absolute URL
  // Default to localhost for iOS simulator (most common case)
  // User should set EXPO_PUBLIC_API_BASE_URL in .env for their setup
  if (__DEV__) {
    // For web, /api works with proxy
    // For mobile, we need absolute URL - defaulting to localhost
    // This will work for iOS simulator but NOT for Android emulator or physical devices
    return 'http://localhost:3000';
  }
  
  // Production fallback (should not happen if env is set)
  return '';
};

/**
 * Creates a full API URL by combining the base URL with the endpoint
 */
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl();
  
  // Ensure endpoint starts with /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Handle web proxy case (/api)
  if (baseUrl === '/api') {
    return `${baseUrl}${cleanEndpoint}`;
  }
  
  // For absolute URLs (mobile), combine base URL with endpoint
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  const fullUrl = `${cleanBaseUrl}${cleanEndpoint}`;
  
  return fullUrl;
};

/**
 * Custom error class for authentication errors
 */
export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

/**
 * Creates an authenticated fetch function that automatically includes
 * the Bearer token from secure storage in the Authorization header.
 * Throws AuthenticationError if the response is 401 or 403.
 */
export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = await SecureStore.getItemAsync('token');

  const headers = new Headers(options.headers);

  // Add Authorization header if token exists
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Merge with existing headers
  const fetchOptions: RequestInit = {
    ...options,
    headers,
  };

  const response = await fetch(url, fetchOptions);

  // Check for authentication errors (401 Unauthorized or 403 Forbidden)
  if (response.status === 401 || response.status === 403) {
    throw new AuthenticationError(`Authentication failed: ${response.status}`);
  }

  return response;
};

