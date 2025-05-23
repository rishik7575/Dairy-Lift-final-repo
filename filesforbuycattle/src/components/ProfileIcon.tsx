import { useState } from 'react';
import { User } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface ProfileIconProps {
  className?: string;
}

const ProfileIcon = ({ className = '' }: ProfileIconProps) => {
  const { isLoggedIn, user, isLoading } = useAuth();
  const [imageError, setImageError] = useState(false);

  const handleProfileClick = () => {
    // Navigate to profile page (relative to buycattle folder)
    console.log('React ProfileIcon clicked, attempting navigation...');

    try {
      // Try global navigation function first
      if ((window as any).navigateToProfile) {
        console.log('Using global navigation function');
        (window as any).navigateToProfile();
      } else {
        console.log('Global function not available, using direct navigation');
        window.location.href = '../profile.html';
      }
    } catch (error) {
      console.error('Navigation error in React component:', error);
      // Final fallback
      try {
        window.location.assign('../profile.html');
      } catch (fallbackError) {
        console.error('Fallback navigation also failed:', fallbackError);
      }
    }
  };

  const handleLoginClick = () => {
    // Navigate to login page (relative to buycattle folder)
    console.log('Login button clicked, navigating to login.html');
    window.location.href = '../login.html';
  };

  // Show loading state while auth is being checked
  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-500 ${className}`}>
        <div className="w-4 h-4 border-2 border-gray-300 border-t-dairy-green rounded-full animate-spin"></div>
        Loading...
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <button
        onClick={handleLoginClick}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-dairy-green border border-dairy-green rounded-md hover:bg-dairy-green hover:text-white transition-colors ${className}`}
      >
        <User className="h-4 w-4" />
        Sign In
      </button>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleProfileClick();
      }}
      className={`p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer ${className}`}
      title={`Profile: ${user?.email || user?.username || 'User'}`}
      type="button"
    >
      {!imageError ? (
        <img
          src="../image/profileicone.png"
          alt="Profile"
          className="w-8 h-8 rounded-full object-cover pointer-events-none"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-dairy-green flex items-center justify-center">
          <User className="h-5 w-5 text-white" />
        </div>
      )}
    </button>
  );
};

export default ProfileIcon;
