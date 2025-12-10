import * as SecureStore from 'expo-secure-store';
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { ActivityIndicator, View } from 'react-native';

interface AuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  setToken: (token: string) => Promise<void>;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkAuth = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      setIsAuthenticated(!!token);
    } catch (error) {
      console.error('Error checking auth:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const setToken = async (token: string) => {
    try {
      await SecureStore.setItemAsync('token', token);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error storing token:', error);
      throw error;
    }
  };

  const handleSetIsAuthenticated = async (value: boolean) => {
    setIsAuthenticated(value);
    if (!value) {
      // Clear token when logging out
      try {
        await SecureStore.deleteItemAsync('token');
      } catch (error) {
        console.error('Error clearing token:', error);
      }
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('token');
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error during logout:', error);
      // Still set authenticated to false even if token deletion fails
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated: handleSetIsAuthenticated,
        setToken,
        checkAuth,
        logout,
      }}
    >
      {isLoading ? (
        <View
          style={{
            flex: 1,
            backgroundColor: '#171616',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
