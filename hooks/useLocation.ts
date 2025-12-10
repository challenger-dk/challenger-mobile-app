import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

type UseLocationResult =
  | {
      location: UserLocation;
      loading: false;
      error: null;
      permissionGranted: true;
    }
  | { location: null; loading: true; error: null; permissionGranted: boolean }
  | { location: null; loading: false; error: Error; permissionGranted: false };

/**
 * Custom hook that fetches and returns the user's current location.
 * Handles permission requests and location updates.
 *
 * @param options - Configuration options
 * @param options.autoRequest - Automatically request location on mount (default: true)
 * @param options.watchPosition - Continuously watch position changes (default: false)
 * @param options.accuracy - Location accuracy setting (default: Location.Accuracy.Balanced)
 *
 * @returns {UseLocationResult} Discriminated union with location, loading, error, and permission status
 *
 * @example
 * const { location, loading, error, permissionGranted, requestPermission, refreshLocation } = useLocation();
 *
 * if (loading) return <div>Getting location...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 * if (location) {
 *   // Use location.latitude and location.longitude
 * }
 */
export const useLocation = (options?: {
  autoRequest?: boolean;
  watchPosition?: boolean;
  accuracy?: Location.Accuracy;
}): UseLocationResult & {
  requestPermission: () => Promise<boolean>;
  refreshLocation: () => Promise<void>;
} => {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);

  const {
    autoRequest = true,
    watchPosition = false,
    accuracy = Location.Accuracy.Balanced,
  } = options || {};

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      // First check current permission status
      const currentStatus = await Location.getForegroundPermissionsAsync();
      console.log('Current location permission status:', currentStatus.status);

      // Only request if not already determined
      let status = currentStatus.status;
      if (status === 'undetermined') {
        const result = await Location.requestForegroundPermissionsAsync();
        status = result.status;
        console.log('Permission request result:', status);
      }

      const granted = status === 'granted';
      setPermissionGranted(granted);

      if (!granted) {
        const errorMessage =
          status === 'denied'
            ? 'Location permission was denied. Please enable location access in settings.'
            : `Location permission status: ${status}`;
        setError(new Error(errorMessage));
        setLoading(false);
        return false;
      }

      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to request location permission';
      console.error('Error requesting location permission:', err);
      setError(new Error(errorMessage));
      setPermissionGranted(false);
      setLoading(false);
      return false;
    }
  }, []);

  const getCurrentLocation = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Check if permission is already granted
      const { status } = await Location.getForegroundPermissionsAsync();
      console.log('getCurrentLocation - permission status:', status);

      if (status !== 'granted') {
        console.log('Permission not granted, requesting...');
        const granted = await requestPermission();
        if (!granted) {
          console.log('Permission request failed or denied');
          return;
        }
      }

      setPermissionGranted(true);
      console.log('Getting current location...');

      // Get current position
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy,
      });

      console.log('Location obtained:', {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        accuracy: currentLocation.coords.accuracy || undefined,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to get current location';
      console.error('Error getting current location:', err);
      setError(new Error(errorMessage));
      setLocation(null);
    } finally {
      setLoading(false);
    }
  }, [accuracy, requestPermission]);

  const refreshLocation = async (): Promise<void> => {
    await getCurrentLocation();
  };

  useEffect(() => {
    if (autoRequest) {
      getCurrentLocation();
    } else {
      // Still check permission status
      Location.getForegroundPermissionsAsync().then(({ status }) => {
        setPermissionGranted(status === 'granted');
        setLoading(false);
      });
    }
  }, [autoRequest, getCurrentLocation]);

  // Set up position watching if enabled
  useEffect(() => {
    if (!watchPosition || !permissionGranted) {
      return;
    }

    const subscription = Location.watchPositionAsync(
      {
        accuracy,
        timeInterval: 5000, // Update every 5 seconds
        distanceInterval: 10, // Update every 10 meters
      },
      (currentLocation) => {
        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          accuracy: currentLocation.coords.accuracy || undefined,
        });
        setError(null);
      }
    );

    return () => {
      subscription.then((sub) => sub.remove());
    };
  }, [watchPosition, permissionGranted, accuracy]);

  // Return discriminated union based on state
  if (loading) {
    return {
      location: null,
      loading: true,
      error: null,
      permissionGranted,
      requestPermission,
      refreshLocation,
    };
  }

  if (error) {
    return {
      location: null,
      loading: false,
      error,
      permissionGranted: false,
      requestPermission,
      refreshLocation,
    };
  }

  if (location) {
    return {
      location,
      loading: false,
      error: null,
      permissionGranted: true,
      requestPermission,
      refreshLocation,
    };
  }

  // No location yet but no error
  return {
    location: null,
    loading: false,
    error: new Error('No location available'),
    permissionGranted: false,
    requestPermission,
    refreshLocation,
  };
};
