import { useState, useEffect } from 'react';

interface User {
  username?: string;
  email?: string;
  [key: string]: any;
}

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  isLoading: boolean;
}

/**
 * React hook that integrates with the main domain auth.js system
 * This hook listens to auth changes and provides React state management
 */
export const useAuth = (): AuthState & {
  login: (userData: User) => void;
  logout: () => void;
} => {
  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: false,
    user: null,
    isLoading: true,
  });

  // Function to check auth status from the global auth system
  const checkAuthStatus = () => {
    try {
      // Check if auth.js is loaded by looking for the functions
      const authFunctions = (window as any);
      if (typeof authFunctions.isLoggedIn !== 'function' || typeof authFunctions.getCurrentUser !== 'function') {
        console.log('[BuyCattle-Auth] Auth.js functions not available, checking localStorage directly...');

        // Fallback: check localStorage directly
        const authData = localStorage.getItem('dairyLift_main_auth');
        if (authData) {
          try {
            const userData = JSON.parse(authData);
            console.log('[BuyCattle-Auth] Found auth data in localStorage:', userData);
            setAuthState({
              isLoggedIn: true,
              user: userData,
              isLoading: false,
            });
            return;
          } catch (e) {
            console.log('[BuyCattle-Auth] Invalid auth data in localStorage');
          }
        }

        // No auth data found
        setAuthState({
          isLoggedIn: false,
          user: null,
          isLoading: false,
        });
        return;
      }

      // Access the global auth functions that are loaded by auth.js
      const isLoggedIn = authFunctions.isLoggedIn() || false;
      const user = authFunctions.getCurrentUser() || null;

      console.log('[BuyCattle-Auth] Auth status checked via functions:', { isLoggedIn, user });

      setAuthState({
        isLoggedIn,
        user,
        isLoading: false,
      });
    } catch (error) {
      console.error('[BuyCattle-Auth] Error checking auth status:', error);
      setAuthState({
        isLoggedIn: false,
        user: null,
        isLoading: false,
      });
    }
  };

  // Function to login using the global auth system
  const login = (userData: User) => {
    try {
      if ((window as any).setLoggedIn) {
        (window as any).setLoggedIn(userData);
        checkAuthStatus();
      }
    } catch (error) {
      console.error('[BuyCattle-Auth] Error during login:', error);
    }
  };

  // Function to logout using the global auth system
  const logout = () => {
    try {
      if ((window as any).logout) {
        (window as any).logout();
        checkAuthStatus();
      }
    } catch (error) {
      console.error('[BuyCattle-Auth] Error during logout:', error);
    }
  };

  useEffect(() => {
    // Immediately check auth status (will fallback to localStorage if needed)
    console.log('[BuyCattle-Auth] Component mounted, checking auth status immediately');
    checkAuthStatus();

    // Also set up a retry mechanism
    const retryInterval = setInterval(() => {
      checkAuthStatus();
    }, 500);

    // Listen for auth changes from the global auth system
    const handleAuthChange = () => {
      console.log('[BuyCattle-Auth] Auth change event received');
      checkAuthStatus();
    };

    // Listen for main domain auth changes
    document.addEventListener('dairyLiftMainAuthChanged', handleAuthChange);

    // Listen for the auth loaded event
    document.addEventListener('dairyLiftMainAuthLoaded', handleAuthChange);

    // Listen for storage changes (cross-tab sync)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'dairyLift_main_auth' || event.key === 'dairyLift_main_auth_timestamp') {
        checkAuthStatus();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Set up BroadcastChannel listener for cross-tab sync
    let broadcastChannel: BroadcastChannel | null = null;
    try {
      if (window.BroadcastChannel) {
        broadcastChannel = new BroadcastChannel('dairyLift_main_auth_channel');
        broadcastChannel.onmessage = (event) => {
          if (event.data && event.data.type === 'auth_changed' && event.data.domain === 'main') {
            checkAuthStatus();
          }
        };
      }
    } catch (error) {
      console.error('[BuyCattle-Auth] Error setting up BroadcastChannel:', error);
    }

    // Periodic check to ensure sync (fallback)
    const interval = setInterval(checkAuthStatus, 2000);

    // Cleanup
    return () => {
      document.removeEventListener('dairyLiftMainAuthChanged', handleAuthChange);
      document.removeEventListener('dairyLiftMainAuthLoaded', handleAuthChange);
      window.removeEventListener('storage', handleStorageChange);
      if (broadcastChannel) {
        broadcastChannel.close();
      }
      clearInterval(retryInterval);
      clearInterval(interval);
    };
  }, []);

  return {
    ...authState,
    login,
    logout,
  };
};
