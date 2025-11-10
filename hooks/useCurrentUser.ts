import { useEffect, useState } from 'react';
import { getCurrentUser } from '../api/users';
import { useAuth } from '../contexts/AuthContext';
import type { User } from '../types/user';

type UseCurrentUserResult =
  | { user: User; loading: false; error: null }
  | { user: null; loading: true; error: null }
  | { user: null; loading: false; error: Error };

/**
 * Custom hook that fetches and returns the current logged-in user.
 * Uses discriminated union types to ensure type safety - when loading is false
 * and error is null, user is guaranteed to be non-null.
 * 
 * @returns {UseCurrentUserResult} Discriminated union ensuring user is not null when ready
 * 
 * @example
 * const { user, loading, error } = useCurrentUser();
 * 
 * if (loading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 * // TypeScript knows user is not null here
 * return <div>Welcome, {user.firstName}!</div>;
 */
export const useCurrentUser = (): UseCurrentUserResult => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Only fetch user if authenticated
    if (!isAuthenticated) {
      setUser(null);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const currentUser = await getCurrentUser();

        if (!currentUser) {
          throw new Error('User not found. Please log in again.');
        }

        setUser(currentUser);
      } catch (err) {
        const errorMessage = err instanceof Error
          ? err.message
          : 'Failed to fetch current user';
        setError(new Error(errorMessage));
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [isAuthenticated]);

  // Return discriminated union based on state
  if (loading) {
    return { user: null, loading: true, error: null };
  }

  if (error) {
    return { user: null, loading: false, error };
  }

  // TypeScript now knows user is not null here
  return { user: user as User, loading: false, error: null };
};

