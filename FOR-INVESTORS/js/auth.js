/**
 * Client-Side Authentication for FOR-INVESTORS Domain
 * Pure localStorage-based authentication system without database dependencies
 */

const AUTH_KEY = 'dairyLift_investor_auth';
const USERS_KEY = 'dairyLift_investor_users';
const PASSWORDS_KEY = 'dairyLift_investor_passwords';

function debug(...args) {
  console.log('[InvestorAuth]', ...args);
}

// Helper functions for localStorage management
function getStoredUsers() {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
}

function getStoredPasswords() {
  const passwords = localStorage.getItem(PASSWORDS_KEY);
  return passwords ? JSON.parse(passwords) : {};
}

function generateUserId() {
  return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Client-side user registration
async function signUpWithEmail(email, password, userData) {
  try {
    debug('Attempting to register user:', email);

    // Validate input
    if (!email || !password || !userData.firstName || !userData.lastName) {
      throw new Error('All fields are required');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Please enter a valid email address');
    }

    // Check if user already exists
    const existingUsers = getStoredUsers();
    if (existingUsers.find(user => user.email === email)) {
      throw new Error('User with this email already exists');
    }

    // Create user object
    const newUser = {
      id: generateUserId(),
      email: email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      name: `${userData.firstName} ${userData.lastName}`.trim(),
      phone: userData.phone || '',
      role: 'investor',
      createdAt: new Date().toISOString(),
      isActive: true,
      profilePicture: null,
      recentActivity: [],
      preferences: {}
    };

    // Store user
    existingUsers.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(existingUsers));

    // Store password separately (in real app, this would be hashed)
    const passwords = getStoredPasswords();
    passwords[email] = password;
    localStorage.setItem(PASSWORDS_KEY, JSON.stringify(passwords));

    debug('User registered successfully:', email);

    return {
      success: true,
      message: 'Registration successful! You can now login with your credentials.',
      requiresVerification: false
    };
  } catch (error) {
    debug('Registration error:', error);
    return { success: false, error: error.message };
  }
}

async function signInWithEmail(email, password) {
  try {
    debug('Attempting to sign in user:', email);

    // Validate input
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Get stored users and passwords
    const users = getStoredUsers();
    const passwords = getStoredPasswords();

    // Find user by email
    const user = users.find(u => u.email === email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check password
    if (passwords[email] !== password) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    const userInfo = {
      ...user,
      lastLogin: new Date().toISOString()
    };

    // Update user in storage
    const userIndex = users.findIndex(u => u.email === email);
    users[userIndex] = userInfo;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    setLoggedIn(userInfo);

    debug('User signed in successfully:', email);
    return { success: true, data: userInfo, message: 'Login successful!' };
  } catch (error) {
    debug('Sign in error:', error);
    return { success: false, error: error.message };
  }
}

async function signOut() {
  try {
    debug('Signing out user');
    logout();
    return { success: true, message: 'Logged out successfully!' };
  } catch (error) {
    debug('Sign out error:', error);
    return { success: false, error: error.message };
  }
}

// Update user profile with localStorage persistence
async function updateUserProfile(userId, profileData) {
  try {
    debug('Updating user profile:', userId, profileData);

    const users = getStoredUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      throw new Error('User not found');
    }

    // Update user data
    const updatedUser = {
      ...users[userIndex],
      firstName: profileData.first_name,
      lastName: profileData.last_name,
      phone: profileData.phone,
      name: `${profileData.first_name} ${profileData.last_name}`.trim(),
      updatedAt: new Date().toISOString()
    };

    users[userIndex] = updatedUser;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    // Update current session if this is the logged-in user
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      setLoggedIn(updatedUser);
    }

    debug('Profile updated successfully');
    return { success: true, data: updatedUser, message: 'Profile updated successfully!' };
  } catch (error) {
    debug('Profile update error:', error);
    return { success: false, error: error.message };
  }
}

// Client-side profile picture upload using base64
async function uploadProfilePicture(userId, file) {
  try {
    debug('Uploading profile picture for user:', userId);

    // Validate file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please use JPEG, PNG, GIF, or WebP.');
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('File size must be less than 5MB');
    }

    // Convert to base64
    const reader = new FileReader();
    const base64Promise = new Promise((resolve, reject) => {
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const base64Url = await base64Promise;

    // Update user in localStorage
    const users = getStoredUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      throw new Error('User not found');
    }

    users[userIndex].profilePicture = base64Url;
    users[userIndex].updatedAt = new Date().toISOString();
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    // Update current session if this is the logged-in user
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      const updatedUser = { ...currentUser, profilePicture: base64Url };
      setLoggedIn(updatedUser);
    }

    debug('Profile picture uploaded successfully');
    return {
      success: true,
      url: base64Url,
      message: 'Profile picture updated successfully!'
    };

  } catch (error) {
    debug('Profile picture upload error:', error);
    return { success: false, error: error.message };
  }
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

  // Use user's profile picture if available, otherwise use default
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.profilePicture) {
    img.src = currentUser.profilePicture;
  } else {
    img.src = getImagePath();
  }

  img.alt = 'Profile';
  img.style.cssText = 'width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 2px solid #e5e7eb;';

  // Add error handling for profile picture loading
  img.onerror = function() {
    this.src = getImagePath(); // Fallback to default image
  };

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
  // Core functions
  isLoggedIn: isLoggedIn,
  getCurrentUser: getCurrentUser,
  setLoggedIn: setLoggedIn,
  logout: logout,
  updateAuthUI: updateAuthUI,

  // Authentication functions
  signUpWithEmail: signUpWithEmail,
  signInWithEmail: signInWithEmail,
  signOut: signOut,
  updateUserProfile: updateUserProfile,
  uploadProfilePicture: uploadProfilePicture,

  initAuth: function() {
    console.log('Client-side auth initialized');
    updateAuthUI();
    return true;
  }
};

// Expose functions globally for backward compatibility
window.isLoggedIn = isLoggedIn;
window.getCurrentUser = getCurrentUser;
window.setLoggedIn = setLoggedIn;
window.logout = logout;
window.updateAuthUI = updateAuthUI;
window.signUpWithEmail = signUpWithEmail;
window.signInWithEmail = signInWithEmail;
window.signOut = signOut;
window.updateUserProfile = updateUserProfile;
window.uploadProfilePicture = uploadProfilePicture;

// Initialize immediately when script loads
console.log('[InvestorAuth] Script loaded, initializing...');
updateAuthUI();
