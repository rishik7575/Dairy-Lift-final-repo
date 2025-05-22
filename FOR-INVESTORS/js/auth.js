/**
 * Authentication utilities for Dairy-Lift
 * Handles user authentication state and UI updates
 */

// Key for storing authentication state in localStorage
const AUTH_KEY = 'dairyLift_auth';

// Debug mode - set to true to enable console logs
const DEBUG = true;

/**
 * Log debug messages if debug mode is enabled
 */
function debug(...args) {
  if (DEBUG) {
    console.log('[DairyLiftAuth]', ...args);
  }
}

/**
 * Check if a user is currently logged in
 * @returns {boolean} True if user is logged in, false otherwise
 */
function isLoggedIn() {
  const authData = localStorage.getItem(AUTH_KEY);
  return authData !== null;
}

/**
 * Get the current user's data
 * @returns {Object|null} User data object or null if not logged in
 */
function getCurrentUser() {
  const authData = localStorage.getItem(AUTH_KEY);
  return authData ? JSON.parse(authData) : null;
}

/**
 * Set user as logged in
 * @param {Object} userData - User data to store
 */
function setLoggedIn(userData) {
  debug('Setting user as logged in', userData);

  // Store auth data in localStorage
  localStorage.setItem(AUTH_KEY, JSON.stringify(userData));

  // Also store a timestamp to track when the auth state was last updated
  localStorage.setItem(AUTH_KEY + '_timestamp', Date.now().toString());

  // Force UI update immediately
  updateAuthUI();

  // Force UI update after a short delay
  setTimeout(updateAuthUI, 100);

  // Force UI update after a longer delay to ensure all components have loaded
  setTimeout(updateAuthUI, 500);

  // Dispatch a custom event that other scripts can listen for
  try {
    const event = new CustomEvent('dairyLiftAuthChanged', {
      detail: { isLoggedIn: true, user: userData, timestamp: Date.now() }
    });
    document.dispatchEvent(event);
    debug('Dispatched dairyLiftAuthChanged event');
  } catch (error) {
    debug('Error dispatching dairyLiftAuthChanged event:', error);
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
function logout() {
  debug('Logging out user');

  // Remove auth data from localStorage
  localStorage.removeItem(AUTH_KEY);

  // Also update the timestamp to track when the auth state was last updated
  localStorage.setItem(AUTH_KEY + '_timestamp', Date.now().toString());

  // Force UI update immediately
  updateAuthUI();

  // Dispatch a custom event that other scripts can listen for
  try {
    const event = new CustomEvent('dairyLiftAuthChanged', {
      detail: { isLoggedIn: false, user: null, timestamp: Date.now() }
    });
    document.dispatchEvent(event);
    debug('Dispatched dairyLiftAuthChanged event for logout');
  } catch (error) {
    debug('Error dispatching dairyLiftAuthChanged event for logout:', error);
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

  // Determine the correct redirect URL based on the current page
  let redirectUrl = 'home_page.html';
  if (window.location.pathname.includes('filesforbuycattle')) {
    redirectUrl = '../home_page.html';
  }

  // Redirect to home page after logout
  window.location.href = redirectUrl;
}

/**
 * Create a profile icon element
 * @returns {HTMLElement} The profile icon element
 */
function createProfileIcon() {
  // Create profile icon link
  const profileLink = document.createElement('a');

  // Determine the correct href based on the current page
  if (window.location.pathname.includes('filesforbuycattle')) {
    profileLink.href = '../profile.html';
  } else {
    profileLink.href = 'profile.html';
  }

  profileLink.className = 'btn btn-icon profile-icon';
  profileLink.setAttribute('title', 'Your Profile');
  profileLink.setAttribute('id', 'profile-icon-link');

  // Add inline styles to ensure visibility
  profileLink.style.display = 'flex';
  profileLink.style.alignItems = 'center';
  profileLink.style.justifyContent = 'center';
  profileLink.style.width = '40px';
  profileLink.style.height = '40px';
  profileLink.style.borderRadius = '50%';
  profileLink.style.backgroundColor = 'rgba(173, 110, 245, 0.2)';
  profileLink.style.color = '#ad6ef5';
  profileLink.style.transition = 'all 0.3s ease';
  profileLink.style.marginLeft = '10px';
  profileLink.style.zIndex = '1000';
  profileLink.style.position = 'relative';
  profileLink.style.cursor = 'pointer';
  profileLink.style.border = '2px solid rgba(173, 110, 245, 0.3)';
  profileLink.style.overflow = 'hidden';

  // Add hover effect
  profileLink.onmouseover = function() {
    this.style.backgroundColor = 'rgba(173, 110, 245, 0.3)';
    this.style.transform = 'scale(1.05)';
    this.style.boxShadow = '0 0 10px rgba(173, 110, 245, 0.3)';
    this.style.borderColor = 'rgba(173, 110, 245, 0.5)';
  };

  profileLink.onmouseout = function() {
    this.style.backgroundColor = 'rgba(173, 110, 245, 0.2)';
    this.style.transform = 'scale(1)';
    this.style.boxShadow = 'none';
    this.style.borderColor = 'rgba(173, 110, 245, 0.3)';
  };

  // Add click event listener
  profileLink.onclick = function(e) {
    e.preventDefault();
    debug('Profile icon clicked, redirecting to profile page');

    // Determine the correct URL based on the current page
    let profileUrl = 'profile.html';
    if (window.location.pathname.includes('filesforbuycattle')) {
      profileUrl = '../profile.html';
    }

    // Navigate to the profile page
    window.location.href = profileUrl;
  };

  // Create the profile image element
  const profileImage = document.createElement('img');

  // Determine the correct image path based on the current page
  let imagePath = 'image/profileicone.png';
  if (window.location.pathname.includes('filesforbuycattle')) {
    imagePath = '../image/profileicone.png';
  }

  profileImage.src = imagePath;
  profileImage.alt = 'Profile';
  profileImage.style.width = '100%';
  profileImage.style.height = '100%';
  profileImage.style.objectFit = 'cover';
  profileImage.style.borderRadius = '50%';

  // Add error handling for image loading
  profileImage.onerror = function() {
    debug('Profile image failed to load, falling back to SVG icon');

    // Remove the image and create SVG fallback
    profileLink.removeChild(this);

    const profileIcon = document.createElement('svg');
    profileIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    profileIcon.setAttribute('width', '20');
    profileIcon.setAttribute('height', '20');
    profileIcon.setAttribute('viewBox', '0 0 24 24');
    profileIcon.setAttribute('fill', 'none');
    profileIcon.setAttribute('stroke', 'currentColor');
    profileIcon.setAttribute('stroke-width', '2');
    profileIcon.setAttribute('stroke-linecap', 'round');
    profileIcon.setAttribute('stroke-linejoin', 'round');

    // Add the SVG path for user icon
    profileIcon.innerHTML = `
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    `;

    profileLink.appendChild(profileIcon);
  };

  // Append image to link
  profileLink.appendChild(profileImage);

  return profileLink;
}

/**
 * Update the UI based on authentication state
 * Converts login button to profile icon if user is logged in
 */
function updateAuthUI() {
  const isUserLoggedIn = isLoggedIn();
  debug('Updating UI, user logged in:', isUserLoggedIn);

  if (isUserLoggedIn) {
    // Check if we already have a profile icon
    const existingProfileIcon = document.getElementById('profile-icon-link');
    if (existingProfileIcon) {
      debug('Profile icon already exists, skipping update');
      return; // Already updated
    }

    // Try different selectors for login buttons
    const loginButtonSelectors = [
      'a[href="login.html"].btn.btn-primary',
      '.navbar-actions a[href="login.html"]',
      'a.btn.btn-primary[href="login.html"]',
      '.navbar a[href="login.html"]',
      'a[href="login.html"]',
      '.btn-primary[href="login.html"]',
      'a.btn[href="login.html"]',
      // Additional selectors for relative paths
      'a[href="./login.html"]',
      'a[href="../login.html"]',
      // Additional selectors for Buy Cattle React app
      'a[href="../login.html"].flex',
      'a[href="../login.html"].btn',
      'a[href="../login.html"].rounded-md'
    ];

    let loginButtons = [];

    // Try each selector until we find login buttons
    for (const selector of loginButtonSelectors) {
      const buttons = document.querySelectorAll(selector);
      if (buttons.length > 0) {
        debug('Found login buttons with selector:', selector, buttons.length);
        loginButtons = Array.from(buttons);
        break;
      }
    }

    // Replace login buttons with profile icon
    if (loginButtons.length > 0) {
      debug('Replacing login buttons with profile icon');
      loginButtons.forEach(loginButton => {
        const profileLink = createProfileIcon();

        // Adjust the href based on the current page
        if (window.location.pathname.includes('filesforbuycattle')) {
          profileLink.href = '../profile.html';
        }

        // Replace login button with profile icon
        if (loginButton.parentNode) {
          loginButton.parentNode.replaceChild(profileLink, loginButton);
          debug('Replaced login button with profile icon');
        }
      });
    } else {
      debug('No login buttons found, trying to add profile icon to navbar-actions');

      // Update navbar-actions if it exists but doesn't have a login button
      const navbarActions = document.querySelector('.navbar-actions');
      if (navbarActions) {
        // Check if navbar-actions already has a profile icon
        if (!navbarActions.querySelector('#profile-icon-link')) {
          const profileLink = createProfileIcon();

          // Adjust the href based on the current page
          if (window.location.pathname.includes('filesforbuycattle')) {
            profileLink.href = '../profile.html';
          }

          navbarActions.appendChild(profileLink);
          debug('Added profile icon to navbar-actions');
        }
      } else {
        debug('No navbar-actions found');

        // Try to find the header and add the profile icon there
        const header = document.querySelector('header');
        if (header) {
          debug('Found header, creating navbar-actions');
          const navbarActions = document.createElement('div');
          navbarActions.className = 'navbar-actions';
          navbarActions.style.display = 'flex';
          navbarActions.style.alignItems = 'center';
          navbarActions.style.gap = '1rem';

          const profileLink = createProfileIcon();

          // Adjust the href based on the current page
          if (window.location.pathname.includes('filesforbuycattle')) {
            profileLink.href = '../profile.html';
          }

          navbarActions.appendChild(profileLink);

          // Find a good place to insert the navbar-actions
          const navbarContent = header.querySelector('.navbar-content');
          if (navbarContent) {
            navbarContent.appendChild(navbarActions);
            debug('Added navbar-actions to navbar-content');
          } else {
            // Try to find a good place in the header
            const headerChildren = header.children;
            if (headerChildren.length > 0) {
              const lastChild = headerChildren[headerChildren.length - 1];
              if (lastChild.tagName === 'DIV') {
                lastChild.appendChild(navbarActions);
                debug('Added navbar-actions to last div in header');
              } else {
                header.appendChild(navbarActions);
                debug('Added navbar-actions to header');
              }
            } else {
              header.appendChild(navbarActions);
              debug('Added navbar-actions to header');
            }
          }
        } else {
          // Last resort: add to body
          debug('No header found, adding to body');
          const fixedProfileIcon = createProfileIcon();

          // Adjust the href based on the current page
          if (window.location.pathname.includes('filesforbuycattle')) {
            fixedProfileIcon.href = '../profile.html';
          }

          fixedProfileIcon.style.position = 'fixed';
          fixedProfileIcon.style.top = '20px';
          fixedProfileIcon.style.right = '20px';
          fixedProfileIcon.style.zIndex = '9999';
          document.body.appendChild(fixedProfileIcon);
        }
      }
    }

    // Also update mobile menu if it exists
    const mobileLoginLinks = document.querySelectorAll('.mobile-nav-link[href="login.html"], .mobile-nav-link[href="./login.html"], .mobile-nav-link[href="../login.html"]');
    if (mobileLoginLinks.length > 0) {
      debug('Updating mobile login links');
      mobileLoginLinks.forEach(link => {
        // Adjust the href based on the current page
        if (window.location.pathname.includes('filesforbuycattle')) {
          link.href = '../profile.html';
        } else {
          link.href = 'profile.html';
        }

        const spanElement = link.querySelector('span');
        if (spanElement) {
          spanElement.textContent = 'Your Profile';
        }
      });
    }

    // Update login/register link in mobile menu
    const mobileLoginRegisterLinks = document.querySelectorAll('.mobile-nav-link-primary[href="login.html"], .mobile-nav-link-primary[href="./login.html"], .mobile-nav-link-primary[href="../login.html"]');
    if (mobileLoginRegisterLinks.length > 0) {
      debug('Updating mobile login/register links');
      mobileLoginRegisterLinks.forEach(link => {
        // Adjust the href based on the current page
        if (window.location.pathname.includes('filesforbuycattle')) {
          link.href = '../profile.html';
        } else {
          link.href = 'profile.html';
        }

        const spanElement = link.querySelector('span');
        if (spanElement) {
          spanElement.textContent = 'Your Profile';
        }

        // Update the icon if it exists
        const svgElement = link.querySelector('svg');
        if (svgElement) {
          svgElement.innerHTML = `
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          `;
        }
      });
    }
  } else {
    // User is not logged in, make sure profile icon is not showing
    const profileIcon = document.getElementById('profile-icon-link');
    if (profileIcon) {
      debug('User not logged in, removing profile icon');
      // Try to replace with login button
      const loginButton = document.createElement('a');

      // Adjust the href based on the current page
      if (window.location.pathname.includes('filesforbuycattle')) {
        loginButton.href = '../login.html';
      } else {
        loginButton.href = 'login.html';
      }

      loginButton.className = 'btn btn-primary';
      loginButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
        Login
      `;

      if (profileIcon.parentNode) {
        profileIcon.parentNode.replaceChild(loginButton, profileIcon);
      }
    }
  }
}

/**
 * Initialize authentication UI
 * This function should be called when the DOM is loaded
 */
function initAuth() {
  debug('Initializing authentication');

  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    // Force immediate UI update
    updateAuthUI();

    // Add event listener for DOM content loaded
    if (document.readyState === 'loading') {
      debug('Document still loading, adding DOMContentLoaded listener');
      document.addEventListener('DOMContentLoaded', function() {
        debug('DOMContentLoaded fired, updating UI');
        updateAuthUI();

        // Force another update after a short delay to ensure all elements are loaded
        setTimeout(updateAuthUI, 500);

        // Force another update after a longer delay
        setTimeout(updateAuthUI, 1000);
      });
    } else {
      // DOM already loaded, update UI immediately and after delays
      debug('Document already loaded, updating UI immediately');
      updateAuthUI();
      setTimeout(updateAuthUI, 500);
      setTimeout(updateAuthUI, 1000);
    }

    // Set up BroadcastChannel for cross-tab communication
    try {
      if (window.BroadcastChannel) {
        const bc = new BroadcastChannel('dairyLift_auth_channel');
        bc.onmessage = function(event) {
          if (event.data && event.data.type === 'auth_changed') {
            debug('Received auth change broadcast:', event.data);

            // Force UI update
            updateAuthUI();

            // Force another update after a short delay
            setTimeout(updateAuthUI, 300);

            // Force another update after a longer delay
            setTimeout(updateAuthUI, 800);
          }
        };
        debug('Set up BroadcastChannel for auth synchronization');
      }
    } catch (error) {
      debug('Error setting up BroadcastChannel:', error);
    }

    // Add event listener for storage changes (for cross-tab synchronization)
    window.addEventListener('storage', function(event) {
      if (event.key === AUTH_KEY || event.key === AUTH_KEY + '_timestamp') {
        debug('Storage event detected for AUTH_KEY, updating UI');

        // Force UI update
        updateAuthUI();

        // Force another update after a short delay
        setTimeout(updateAuthUI, 300);

        // Force another update after a longer delay
        setTimeout(updateAuthUI, 800);
      }
    });

    // Add a custom event listener for auth changes
    document.addEventListener('dairyLiftAuthChanged', function(event) {
      debug('Auth changed event detected, updating UI');

      // Force UI update
      updateAuthUI();

      // Force another update after a short delay
      setTimeout(updateAuthUI, 300);

      // Force another update after a longer delay
      setTimeout(updateAuthUI, 800);
    });

    // Add a mutation observer to detect DOM changes and update the UI
    // This helps with single-page applications or dynamic content
    const observer = new MutationObserver(function(mutations) {
      debug('DOM mutation detected, checking if we need to update UI');

      // Check for login buttons with various href patterns
      const loginButtonSelectors = [
        'a[href="login.html"]',
        'a[href="./login.html"]',
        'a[href="../login.html"]'
      ];

      let loginButtonFound = false;

      for (const selector of loginButtonSelectors) {
        const loginButtons = document.querySelectorAll(selector);
        if (loginButtons.length > 0) {
          loginButtonFound = true;
          break;
        }
      }

      if (loginButtonFound && isLoggedIn()) {
        debug('Login button detected while user is logged in, updating UI');

        // Force UI update
        updateAuthUI();

        // Force another update after a short delay
        setTimeout(updateAuthUI, 300);
      }
    });

    // Start observing the document with the configured parameters
    observer.observe(document.body, { childList: true, subtree: true });

    // Set a periodic check to ensure the UI is updated
    // This helps with pages that load content dynamically
    setInterval(function() {
      if (isLoggedIn()) {
        const profileIcon = document.getElementById('profile-icon-link');
        if (!profileIcon) {
          debug('Periodic check: profile icon not found, updating UI');

          // Force UI update
          updateAuthUI();
        }
      }
    }, 500); // Check more frequently (every 500ms)

    // Force an update after page load
    window.addEventListener('load', function() {
      debug('Window load event, forcing UI update');

      // Force UI update
      updateAuthUI();

      // Force another update after a short delay
      setTimeout(updateAuthUI, 500);

      // Force another update after a longer delay
      setTimeout(updateAuthUI, 1000);

      // Force another update after an even longer delay
      setTimeout(updateAuthUI, 2000);
    });

    // Force an update when the user becomes visible (tab focus)
    document.addEventListener('visibilitychange', function() {
      if (!document.hidden) {
        debug('Page became visible, forcing UI update');

        // Force UI update
        updateAuthUI();

        // Force another update after a short delay
        setTimeout(updateAuthUI, 500);
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
}

// Export functions for use in other scripts
window.DairyLiftAuth = {
  isLoggedIn,
  getCurrentUser,
  setLoggedIn,
  logout,
  updateAuthUI,
  initAuth
};

// Also expose individual functions globally for backward compatibility
window.isLoggedIn = isLoggedIn;
window.getCurrentUser = getCurrentUser;
window.setLoggedIn = setLoggedIn;
window.logout = logout;
window.updateAuthUI = updateAuthUI;
window.initAuth = initAuth;

// Initialize authentication when the script loads
// Use a small delay to ensure the DOM is ready
setTimeout(function() {
  debug('Initializing authentication with delay');
  initAuth();

  // Dispatch a custom event to notify that auth.js is loaded
  try {
    const event = new CustomEvent('dairyLiftAuthLoaded', {
      detail: { isReady: true }
    });
    document.dispatchEvent(event);
    debug('Dispatched dairyLiftAuthLoaded event');
  } catch (error) {
    debug('Error dispatching dairyLiftAuthLoaded event:', error);
  }
}, 100);
