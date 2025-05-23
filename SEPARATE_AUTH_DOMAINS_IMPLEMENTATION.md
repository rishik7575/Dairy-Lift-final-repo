# Separate Authentication Domains Implementation

## Overview

The Dairy-Lift project now implements **completely separate authentication systems** for the main website and the FOR-INVESTORS folder. This ensures that user authentication in one domain does not interfere with the other, treating them as independent websites.

## Architecture

### 🏠 Main Website Domain
- **Files Included:** All files in the root directory + `filesforbuycattle/` folder
- **Auth Script:** `js/auth.js`
- **Storage Key:** `dairyLift_main_auth`
- **Broadcast Channel:** `dairyLift_main_auth_channel`
- **Event Names:** `dairyLiftMainAuthChanged`, `dairyLiftMainAuthLoaded`

### 💼 Investor Website Domain
- **Files Included:** All files in `FOR-INVESTORS/` folder + `FOR-INVESTORS/filesforbuycattle/`
- **Auth Script:** `FOR-INVESTORS/js/auth.js`
- **Storage Key:** `dairyLift_investor_auth`
- **Broadcast Channel:** `dairyLift_investor_auth_channel`
- **Event Names:** `dairyLiftInvestorAuthChanged`, `dairyLiftInvestorAuthLoaded`

## Key Features

### ✅ Complete Domain Isolation
- **Separate Storage:** Each domain uses different localStorage keys
- **Independent Sessions:** Users can be logged into one domain without affecting the other
- **Isolated Broadcast Channels:** Cross-tab synchronization only works within the same domain
- **Domain-Specific Events:** Custom events are scoped to their respective domains

### ✅ Cross-Tab Synchronization (Within Domain)
- **Main Domain:** All main website tabs sync authentication state
- **Investor Domain:** All investor website tabs sync authentication state
- **No Cross-Domain Sync:** Main and investor tabs do NOT sync with each other

### ✅ Profile Icon Management
- **Automatic Path Detection:** Profile icons use correct relative paths based on current location
- **Domain-Specific Updates:** Profile icons only update within their respective domains
- **Fallback Support:** SVG fallbacks if profile images fail to load

## File Structure

```
Dairy-Lift-final-repo/
├── js/auth.js                                    # Main domain auth
├── image/profileicone.png                        # Main domain profile icon
├── filesforbuycattle/
│   ├── image/profileicone.png                    # Main domain buycattle profile icon
│   └── index.html                                # Includes ../js/auth.js
├── FOR-INVESTORS/
│   ├── js/auth.js                                # Investor domain auth
│   ├── image/profileicone.png                    # Investor domain profile icon
│   └── filesforbuycattle/
│       ├── image/profileicone.png                # Investor domain buycattle profile icon
│       └── index.html                            # Includes ../js/auth.js
└── test/test-separate-auth-domains.html          # Test file
```

## Implementation Details

### Storage Keys
- **Main Domain:** `dairyLift_main_auth` + `dairyLift_main_auth_timestamp`
- **Investor Domain:** `dairyLift_investor_auth` + `dairyLift_investor_auth_timestamp`

### Broadcast Channels
- **Main Domain:** `dairyLift_main_auth_channel`
- **Investor Domain:** `dairyLift_investor_auth_channel`

### Message Format
```javascript
{
  type: 'auth_changed',
  domain: 'main' | 'investor',
  isLoggedIn: boolean,
  timestamp: number
}
```

### Profile Icon Paths
- **Main Website:** `image/profileicone.png`
- **Main BuyCattle:** `../image/profileicone.png`
- **Investor Website:** `image/profileicone.png`
- **Investor BuyCattle:** `../image/profileicone.png`

## Usage Examples

### Main Domain Login
```javascript
// In main website files
window.setLoggedIn({
  username: 'john_doe',
  email: 'john@example.com'
});
```

### Investor Domain Login
```javascript
// In FOR-INVESTORS files
window.setLoggedIn({
  username: 'investor_jane',
  email: 'jane@investor.com'
});
```

### Check Authentication Status
```javascript
// Main domain
const isMainLoggedIn = window.isLoggedIn(); // Uses main auth

// Investor domain
const isInvestorLoggedIn = window.isLoggedIn(); // Uses investor auth
```

## Testing

### Manual Testing
1. Open `test/test-separate-auth-domains.html`
2. Test logging into main domain only
3. Test logging into investor domain only
4. Test logging into both domains simultaneously
5. Test independent logout functionality

### Expected Behavior
- ✅ Users can be logged into main domain without affecting investor domain
- ✅ Users can be logged into investor domain without affecting main domain
- ✅ Users can be logged into both domains simultaneously
- ✅ Logging out of one domain does not affect the other
- ✅ Profile icons appear/disappear only in their respective domains

## Benefits

### 🔒 Security
- **Isolated Sessions:** Prevents cross-domain session interference
- **Separate Storage:** Each domain manages its own authentication data
- **Domain Boundaries:** Clear separation between main and investor user bases

### 🚀 Flexibility
- **Independent Updates:** Auth systems can be updated independently
- **Different User Types:** Main users vs investor users can have different authentication flows
- **Scalability:** Easy to add more domains in the future

### 🎯 User Experience
- **Clear Separation:** Users understand they're in different sections of the website
- **Consistent Behavior:** Authentication works consistently within each domain
- **No Confusion:** No unexpected logouts or login state changes

## Troubleshooting

### Common Issues
1. **Profile Icon Not Showing:** Check if correct auth.js is included in HTML
2. **Cross-Domain Sync:** This is intentionally disabled - working as designed
3. **Storage Conflicts:** Clear browser storage if testing with old auth system

### Debug Information
- **Main Auth:** Look for `[DairyLiftAuth-Main]` in console logs
- **Investor Auth:** Look for `[DairyLiftAuth-Investor]` in console logs
- **Storage Keys:** Check localStorage for `dairyLift_main_auth` and `dairyLift_investor_auth`

## React Integration

### BuyCattle React Applications
Both main and investor BuyCattle folders now include React components that integrate with the auth system:

**Components Added:**
- `useAuth` hook: Integrates React state with auth.js system
- `ProfileIcon` component: Shows profile icon or login button based on auth state
- Updated `Header` and `Sidebar` components to use ProfileIcon

**Features:**
- ✅ Real-time auth state updates in React components
- ✅ Profile icon displays when logged in
- ✅ Login button displays when logged out
- ✅ Cross-tab synchronization within domain
- ✅ Automatic navigation to profile/login pages

### React Hook Usage
```typescript
import { useAuth } from '@/hooks/use-auth';

const { isLoggedIn, user, login, logout } = useAuth();
```

## Testing

### Test Files Created
1. **`test/test-separate-auth-domains.html`** - Basic domain separation test
2. **`test/test-buycattle-profile-sync.html`** - Comprehensive React integration test

### Manual Testing Steps
1. Open the comprehensive test page
2. Login to main domain using the test buttons
3. Open BuyCattle links in new tabs
4. Verify profile icons appear in React headers
5. Test cross-tab synchronization
6. Test domain isolation (main vs investor)

## Migration Notes

### From Previous System
- **Old Key:** `dairyLift_auth` (no longer used)
- **New Keys:** `dairyLift_main_auth` and `dairyLift_investor_auth`
- **Backward Compatibility:** None - this is a breaking change by design

### React Applications
- **Built Applications:** Profile icons now work in production builds
- **Development Mode:** Profile icons work in development servers
- **Auth Integration:** React components automatically sync with auth.js

### Future Considerations
- Additional domains can be added using the same pattern
- Each new domain should have its own storage key and broadcast channel
- Profile icon paths should be updated for new domain structures
- React components can be extended with additional auth features
