/**
 * Authentication utilities for Dairy-Lift React components
 */

// Key for storing authentication state in localStorage (must match the one in auth.js)
const AUTH_KEY = 'dairyLift_auth';

// Debug mode - set to true to enable console logs
const DEBUG = true;

/**
 * Log debug messages if debug mode is enabled
 */
function debug(...args: any[]): void {
  if (DEBUG) {
    console.log('[DairyLiftAuth React]', ...args);
  }
}

// User data interface
export interface UserData {
  email: string;
  name: string;
  profileImage?: string | null;
  lastLogin?: string;
  registrationDate?: string;
  [key: string]: any; // Allow additional properties
}

/**
 * Check if a user is currently logged in
 * @returns {boolean} True if user is logged in, false otherwise
 */
export function isLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;

  // First try to use the global auth.js function if it exists
  try {
    if (window.DairyLiftAuth && typeof window.DairyLiftAuth.isLoggedIn === 'function') {
      return window.DairyLiftAuth.isLoggedIn();
    }
  } catch (error) {
    debug('Error calling global isLoggedIn:', error);
  }

  // Fallback: check localStorage directly
  const authData = localStorage.getItem(AUTH_KEY);
  return authData !== null;
}

/**
 * Get the current user's data
 * @returns {UserData|null} User data object or null if not logged in
 */
export function getCurrentUser(): UserData | null {
  if (typeof window === 'undefined') return null;

  // First try to use the global auth.js function if it exists
  try {
    if (window.DairyLiftAuth && typeof window.DairyLiftAuth.getCurrentUser === 'function') {
      return window.DairyLiftAuth.getCurrentUser();
    }
  } catch (error) {
    debug('Error calling global getCurrentUser:', error);
  }

  // Fallback: check localStorage directly
  const authData = localStorage.getItem(AUTH_KEY);
  return authData ? JSON.parse(authData) : null;
}

/**
 * Set user as logged in
 * @param {UserData} userData - User data to store
 */
export function setLoggedIn(userData: UserData): void {
  if (typeof window === 'undefined') return;
  debug('Setting user as logged in', userData);

  // First try to use the global auth.js function if it exists
  try {
    if (window.DairyLiftAuth && typeof window.DairyLiftAuth.setLoggedIn === 'function') {
      window.DairyLiftAuth.setLoggedIn(userData);
      debug('Called global setLoggedIn function');
      return; // The global function will handle everything else
    }
  } catch (error) {
    debug('Error calling global setLoggedIn:', error);
  }

  // Fallback: set localStorage directly
  localStorage.setItem(AUTH_KEY, JSON.stringify(userData));

  // Also store a timestamp to track when the auth state was last updated
  localStorage.setItem(AUTH_KEY + '_timestamp', Date.now().toString());

  // Dispatch a custom event that other scripts can listen for
  try {
    const event = new CustomEvent('dairyLiftAuthChanged', {
      detail: { isLoggedIn: true, user: userData, timestamp: Date.now() }
    });
    document.dispatchEvent(event);
    debug('Dispatched dairyLiftAuthChanged event');
  } catch (error) {
    debug('Error dispatching event:', error);
  }

  // Broadcast a message to all tabs
  try {
    if (window.BroadcastChannel) {
      const bc = new BroadcastChannel('dairyLift_auth_channel');
      bc.postMessage({
        type: 'auth_changed',
        isLoggedIn: true,
        timestamp: Date.now()
      });
      debug('Broadcasted auth change to all tabs');
    }
  } catch (error) {
    debug('Error broadcasting auth change:', error);
  }
}

/**
 * Log out the current user
 */
export function logout(): void {
  if (typeof window === 'undefined') return;
  debug('Logging out user');

  // First try to use the global auth.js function if it exists
  try {
    if (window.DairyLiftAuth && typeof window.DairyLiftAuth.logout === 'function') {
      window.DairyLiftAuth.logout();
      debug('Called global logout function');
      return; // The global function will handle everything else
    }
  } catch (error) {
    debug('Error calling global logout:', error);
  }

  // Fallback: remove from localStorage directly
  localStorage.removeItem(AUTH_KEY);

  // Also update the timestamp to track when the auth state was last updated
  localStorage.setItem(AUTH_KEY + '_timestamp', Date.now().toString());

  // Dispatch a custom event that other scripts can listen for
  try {
    const event = new CustomEvent('dairyLiftAuthChanged', {
      detail: { isLoggedIn: false, user: null, timestamp: Date.now() }
    });
    document.dispatchEvent(event);
    debug('Dispatched dairyLiftAuthChanged event for logout');
  } catch (error) {
    debug('Error dispatching event for logout:', error);
  }

  // Broadcast a message to all tabs
  try {
    if (window.BroadcastChannel) {
      const bc = new BroadcastChannel('dairyLift_auth_channel');
      bc.postMessage({
        type: 'auth_changed',
        isLoggedIn: false,
        timestamp: Date.now()
      });
      debug('Broadcasted logout to all tabs');
    }
  } catch (error) {
    debug('Error broadcasting logout:', error);
  }

  // Fallback: redirect to home page
  window.location.href = '../home_page.html';
}

/**
 * Initialize the auth system by checking for global auth.js
 * and setting up event listeners
 */
export function initAuth(): void {
  if (typeof window === 'undefined') return;
  debug('Initializing auth system');

  // Check if global auth.js is available
  if (window.DairyLiftAuth) {
    debug('Global auth.js is available');

    // Try to initialize it
    try {
      window.DairyLiftAuth.initAuth();
      debug('Called global initAuth function');
    } catch (error) {
      debug('Error calling global initAuth:', error);
    }
  } else {
    debug('Global auth.js is not available, setting up event listeners');

    // Set up event listener for when auth.js becomes available
    document.addEventListener('dairyLiftAuthLoaded', function(event) {
      debug('Auth script loaded event received');
      if (window.DairyLiftAuth) {
        try {
          window.DairyLiftAuth.initAuth();
          debug('Called global initAuth function after load event');
        } catch (error) {
          debug('Error calling global initAuth after load event:', error);
        }
      }
    });

    // Set up event listener for auth ready event
    document.addEventListener('dairyLiftAuthReady', function(event) {
      debug('Auth ready event received');
      // Force a UI update
      if (window.DairyLiftAuth) {
        try {
          window.DairyLiftAuth.updateAuthUI();
          debug('Called global updateAuthUI function after ready event');
        } catch (error) {
          debug('Error calling global updateAuthUI after ready event:', error);
        }
      }
    });
  }

  // Set up BroadcastChannel for cross-tab communication
  try {
    if (window.BroadcastChannel) {
      const bc = new BroadcastChannel('dairyLift_auth_channel');
      bc.onmessage = function(event) {
        if (event.data && event.data.type === 'auth_changed') {
          debug('Received auth change broadcast:', event.data);

          // Force a UI update
          if (window.DairyLiftAuth) {
            try {
              window.DairyLiftAuth.updateAuthUI();
              debug('Called global updateAuthUI function after broadcast event');

              // Force another update after a short delay
              setTimeout(() => {
                if (window.DairyLiftAuth) {
                  window.DairyLiftAuth.updateAuthUI();
                }
              }, 300);
            } catch (error) {
              debug('Error calling global updateAuthUI after broadcast event:', error);
            }
          }
        }
      };
      debug('Set up BroadcastChannel for auth synchronization');
    }
  } catch (error) {
    debug('Error setting up BroadcastChannel:', error);
  }

  // Set up event listener for storage events
  window.addEventListener('storage', function(event) {
    if (event.key === AUTH_KEY || event.key === AUTH_KEY + '_timestamp') {
      debug('Storage event detected for AUTH_KEY');
      // Force a UI update
      if (window.DairyLiftAuth) {
        try {
          window.DairyLiftAuth.updateAuthUI();
          debug('Called global updateAuthUI function after storage event');

          // Force another update after a short delay
          setTimeout(() => {
            if (window.DairyLiftAuth) {
              window.DairyLiftAuth.updateAuthUI();
            }
          }, 300);
        } catch (error) {
          debug('Error calling global updateAuthUI after storage event:', error);
        }
      }
    }
  });

  // Broadcast a ping to all tabs to check if we need to update
  try {
    if (window.BroadcastChannel) {
      const bc = new BroadcastChannel('dairyLift_auth_channel');
      bc.postMessage({
        type: 'auth_ping',
        timestamp: Date.now()
      });
      debug('Broadcasted auth ping to all tabs');
    }
  } catch (error) {
    debug('Error broadcasting auth ping:', error);
  }
}

/**
 * Create a React hook for authentication
 * @returns Authentication utilities and state
 */
export function useAuth() {
  return {
    isLoggedIn: isLoggedIn(),
    user: getCurrentUser(),
    login: setLoggedIn,
    logout,
    initAuth,
  };
}

// Add TypeScript declaration for the global DairyLiftAuth object
declare global {
  interface Window {
    DairyLiftAuth?: {
      isLoggedIn: () => boolean;
      getCurrentUser: () => any;
      setLoggedIn: (userData: any) => void;
      logout: () => void;
      updateAuthUI: () => void;
      initAuth: () => void;
    };
  }
}

// Initialize auth system when this module is imported
if (typeof window !== 'undefined') {
  setTimeout(initAuth, 100);
}

export default {
  isLoggedIn,
  getCurrentUser,
  setLoggedIn,
  logout,
  useAuth,
  initAuth,
};
