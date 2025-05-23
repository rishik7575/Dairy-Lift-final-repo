/**
 * Simple Authentication for FOR-INVESTORS Domain
 * Separate from main website
 */

const AUTH_KEY = 'dairyLift_investor_auth';

function debug(...args) {
  console.log('[InvestorAuth]', ...args);
}

function isLoggedIn() {
  return localStorage.getItem(AUTH_KEY) !== null;
}

function getCurrentUser() {
  const authData = localStorage.getItem(AUTH_KEY);
  return authData ? JSON.parse(authData) : null;
}

function setLoggedIn(userData) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(userData));
  updateAuthUI();

  // Notify other tabs
  window.dispatchEvent(new CustomEvent('investorAuthChanged', {
    detail: { isLoggedIn: true, user: userData }
  }));
}

function logout() {
  localStorage.removeItem(AUTH_KEY);
  updateAuthUI();

  // Notify other tabs
  window.dispatchEvent(new CustomEvent('investorAuthChanged', {
    detail: { isLoggedIn: false, user: null }
  }));
}

function updateAuthUI() {
  const loggedIn = isLoggedIn();

  if (loggedIn) {
    replaceLoginButtonsWithProfileIcon();
  } else {
    showLoginButtons();
  }
}

function replaceLoginButtonsWithProfileIcon() {
  // Find login buttons and replace with profile icon
  const selectors = [
    'a[href*="login"]',
    'a[href="login.html"]',
    'a[href="../login.html"]'
  ];

  selectors.forEach(selector => {
    const buttons = document.querySelectorAll(selector);
    buttons.forEach(button => {
      if (!button.id || button.id !== 'profile-icon') {
        const profileIcon = createProfileIcon();
        if (button.parentNode) {
          button.parentNode.replaceChild(profileIcon, button);
        }
      }
    });
  });
}

function showLoginButtons() {
  // Remove profile icons and show login buttons
  const profileIcons = document.querySelectorAll('#profile-icon');
  profileIcons.forEach(icon => {
    const loginButton = createLoginButton();
    if (icon.parentNode) {
      icon.parentNode.replaceChild(loginButton, icon);
    }
  });
}

function createProfileIcon() {
  const profileLink = document.createElement('a');
  profileLink.id = 'profile-icon';
  profileLink.href = getProfilePath();
  profileLink.style.cssText = 'display: inline-block; width: 32px; height: 32px;';

  const img = document.createElement('img');
  img.src = getImagePath();
  img.alt = 'Profile';
  img.style.cssText = 'width: 100%; height: 100%; border-radius: 50%; object-fit: cover;';

  profileLink.appendChild(img);
  return profileLink;
}

function createLoginButton() {
  const loginButton = document.createElement('a');
  loginButton.href = getLoginPath();
  loginButton.className = 'btn btn-primary';
  loginButton.textContent = 'Login';
  return loginButton;
}

function getProfilePath() {
  if (window.location.pathname.includes('filesforbuycattle')) {
    return '../profile.html';
  }
  return 'profile.html';
}

function getLoginPath() {
  if (window.location.pathname.includes('filesforbuycattle')) {
    return '../login.html';
  }
  return 'login.html';
}

function getImagePath() {
  if (window.location.pathname.includes('filesforbuycattle')) {
    return '../image/profileicone.png';
  }
  return 'image/profileicone.png';
}

// Cross-tab synchronization
window.addEventListener('storage', function(event) {
  if (event.key === AUTH_KEY) {
    updateAuthUI();
  }
});

// Listen for auth changes
window.addEventListener('investorAuthChanged', function(event) {
  updateAuthUI();
});

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  updateAuthUI();

  // Dispatch auth loaded event for compatibility
  try {
    const event = new CustomEvent('dairyLiftAuthLoaded', {
      detail: { isReady: true, domain: 'investor' }
    });
    document.dispatchEvent(event);
    console.log('Auth loaded event dispatched');
  } catch (error) {
    console.error('Error dispatching auth loaded event:', error);
  }
});

// Create DairyLiftAuth namespace for compatibility
window.DairyLiftAuth = {
  isLoggedIn: isLoggedIn,
  getCurrentUser: getCurrentUser,
  setLoggedIn: setLoggedIn,
  logout: logout,
  updateAuthUI: updateAuthUI,
  initAuth: function() {
    console.log('Auth initialized');
    updateAuthUI();
  }
};

// Expose functions globally
window.isLoggedIn = isLoggedIn;
window.getCurrentUser = getCurrentUser;
window.setLoggedIn = setLoggedIn;
window.logout = logout;
window.updateAuthUI = updateAuthUI;
