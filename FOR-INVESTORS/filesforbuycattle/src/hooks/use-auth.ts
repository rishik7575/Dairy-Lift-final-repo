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
 * React hook that integrates with the investor domain auth.js system
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

  // Simple function to check auth status
  const checkAuthStatus = () => {
    try {
      // Check localStorage directly for investor auth
      const authData = localStorage.getItem('dairyLift_investor_auth');

      if (authData) {
        const userData = JSON.parse(authData);
        console.log('[BuyCattle-Auth-Investor] User is logged in:', userData);
        setAuthState({
          isLoggedIn: true,
          user: userData,
          isLoading: false,
        });
      } else {
        console.log('[BuyCattle-Auth-Investor] No user logged in');
        setAuthState({
          isLoggedIn: false,
          user: null,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('[BuyCattle-Auth-Investor] Error checking auth status:', error);
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
      console.error('[BuyCattle-Auth-Investor] Error during login:', error);
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
      console.error('[BuyCattle-Auth-Investor] Error during logout:', error);
    }
  };

  useEffect(() => {
    // Immediately check auth status (will fallback to localStorage if needed)
    console.log('[BuyCattle-Auth-Investor] Component mounted, checking auth status immediately');
    checkAuthStatus();

    // Also set up a retry mechanism
    const retryInterval = setInterval(() => {
      checkAuthStatus();
    }, 500);

    // Listen for simple auth changes
    const handleAuthChange = () => {
      console.log('[BuyCattle-Auth-Investor] Auth change event received');
      checkAuthStatus();
    };

    // Listen for the simple auth event
    window.addEventListener('investorAuthChanged', handleAuthChange);

    // Listen for storage changes (cross-tab sync)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'dairyLift_investor_auth' || event.key === 'dairyLift_investor_auth_timestamp') {
        checkAuthStatus();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Set up BroadcastChannel listener for cross-tab sync
    let broadcastChannel: BroadcastChannel | null = null;
    try {
      if (window.BroadcastChannel) {
        broadcastChannel = new BroadcastChannel('dairyLift_investor_auth_channel');
        broadcastChannel.onmessage = (event) => {
          if (event.data && event.data.type === 'auth_changed' && event.data.domain === 'investor') {
            checkAuthStatus();
          }
        };
      }
    } catch (error) {
      console.error('[BuyCattle-Auth-Investor] Error setting up BroadcastChannel:', error);
    }

    // Periodic check to ensure sync (fallback)
    const interval = setInterval(checkAuthStatus, 2000);

    // Cleanup
    return () => {
      window.removeEventListener('investorAuthChanged', handleAuthChange);
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
