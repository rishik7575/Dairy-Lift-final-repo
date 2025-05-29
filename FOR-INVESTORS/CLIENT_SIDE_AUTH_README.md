# Client-Side Authentication System for FOR-INVESTORS

## Overview

This document provides complete setup and usage instructions for the client-side authentication system implemented for the FOR-INVESTORS folder of the Dairy-Lift project. This system operates entirely without database dependencies, using only localStorage for session management.

## Features Implemented

### 🔐 **Authentication Features**
- **User Registration** with client-side validation
- **Secure Login** with password validation
- **localStorage-based sessions** with cross-tab synchronization
- **Independent authentication** from main website
- **No database dependencies** - purely client-side

### 👤 **Profile Management**
- **User profiles** with localStorage persistence
- **Profile picture upload** using base64 encoding
- **Real-time profile updates** across all pages
- **User preferences** and settings persistence

### 🛡️ **Security Features**
- **Form validation** and error handling
- **Session management** with automatic UI updates
- **Cross-tab synchronization** within FOR-INVESTORS domain
- **Secure file uploads** with type and size validation

## Architecture

### Data Storage
All user data is stored in localStorage using these keys:
- `dairyLift_investor_auth` - Current session data
- `dairyLift_investor_users` - All registered users
- `dairyLift_investor_passwords` - User passwords (in production, these would be hashed)

### File Structure
```
FOR-INVESTORS/
├── js/
│   └── auth.js                 # Main authentication logic
├── login.html                  # Login/Registration page
├── profile.html                # User profile management
└── filesforbuycattle/
    └── src/
        └── hooks/
            └── use-auth.ts     # React hook for authentication
```

## Setup Instructions

### Step 1: File Integration
The authentication system is already integrated into the following files:
- `js/auth.js` - Core authentication functions
- `login.html` - Login and registration forms
- `profile.html` - Profile management interface

### Step 2: Usage in HTML Pages
Include the authentication script in your HTML pages:
```html
<script src="js/auth.js"></script>
```

### Step 3: Usage in React Components
Use the provided React hook:
```typescript
import { useAuth } from './hooks/use-auth';

function MyComponent() {
  const { isLoggedIn, user, login, logout } = useAuth();
  
  if (isLoggedIn) {
    return <div>Welcome, {user?.name}!</div>;
  }
  
  return <div>Please log in</div>;
}
```

## API Reference

### Core Functions

#### `signUpWithEmail(email, password, userData)`
Registers a new user with the provided information.

**Parameters:**
- `email` (string) - User's email address
- `password` (string) - User's password (minimum 6 characters)
- `userData` (object) - Additional user data
  - `firstName` (string) - User's first name
  - `lastName` (string) - User's last name
  - `phone` (string, optional) - User's phone number

**Returns:** Promise resolving to `{ success: boolean, message: string, error?: string }`

#### `signInWithEmail(email, password)`
Authenticates a user with email and password.

**Parameters:**
- `email` (string) - User's email address
- `password` (string) - User's password

**Returns:** Promise resolving to `{ success: boolean, data?: User, message: string, error?: string }`

#### `signOut()`
Signs out the current user and clears session data.

**Returns:** Promise resolving to `{ success: boolean, message: string }`

#### `updateUserProfile(userId, profileData)`
Updates user profile information.

**Parameters:**
- `userId` (string) - User's unique identifier
- `profileData` (object) - Profile data to update
  - `first_name` (string) - Updated first name
  - `last_name` (string) - Updated last name
  - `phone` (string) - Updated phone number

**Returns:** Promise resolving to `{ success: boolean, data?: User, message: string, error?: string }`

#### `uploadProfilePicture(userId, file)`
Uploads a profile picture and stores it as base64.

**Parameters:**
- `userId` (string) - User's unique identifier
- `file` (File) - Image file to upload

**Returns:** Promise resolving to `{ success: boolean, url?: string, message: string, error?: string }`

### Utility Functions

#### `isLoggedIn()`
Checks if a user is currently logged in.

**Returns:** `boolean`

#### `getCurrentUser()`
Gets the current user's data.

**Returns:** `User | null`

## Data Models

### User Object
```typescript
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  phone?: string;
  role: string;
  createdAt: string;
  isActive: boolean;
  profilePicture?: string;
  recentActivity: Array<any>;
  preferences: object;
  lastLogin?: string;
}
```

## Security Considerations

### Client-Side Limitations
- **No server-side validation** - All validation happens on the client
- **Data stored in localStorage** - Accessible to any script on the domain
- **Passwords stored in plain text** - In production, implement proper hashing
- **No rate limiting** - Consider implementing client-side rate limiting

### Recommended Enhancements for Production
1. **Server-side validation** and authentication
2. **Password hashing** using bcrypt or similar
3. **JWT tokens** for session management
4. **Rate limiting** for login attempts
5. **HTTPS enforcement** for all authentication endpoints

## Cross-Tab Synchronization

The authentication system automatically synchronizes login state across browser tabs within the FOR-INVESTORS domain using:
- `localStorage` events
- Custom `investorAuthChanged` events

## Error Handling

All authentication functions return standardized response objects:
```javascript
{
  success: boolean,
  message: string,
  data?: any,
  error?: string
}
```

## Browser Compatibility

The authentication system is compatible with:
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Troubleshooting

### Common Issues

1. **User data not persisting**
   - Check if localStorage is enabled
   - Verify domain consistency

2. **Cross-tab sync not working**
   - Ensure all pages include the auth.js script
   - Check for JavaScript errors in console

3. **Profile pictures not loading**
   - Verify file size is under 5MB
   - Check file type is supported (JPEG, PNG, GIF, WebP)

### Debug Mode
Enable debug logging by opening browser console. All authentication operations are logged with the `[InvestorAuth]` prefix.

## Migration from Database System

If migrating from a database-based system:
1. Export existing user data
2. Convert to the localStorage format
3. Update any database-specific code
4. Test all authentication flows

## Support

For issues or questions about the authentication system, check:
1. Browser console for error messages
2. localStorage data integrity
3. File inclusion and script loading
