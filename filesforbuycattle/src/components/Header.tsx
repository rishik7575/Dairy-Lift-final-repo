
import { useState, useEffect } from 'react';
import { Menu, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Sidebar from './Sidebar';
// import { Link } from 'react-router-dom'; // Not needed anymore as we use direct links
import { isLoggedIn, initAuth } from '@/lib/auth';

const Header = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Initialize auth system
    initAuth();

    // Check authentication status when component mounts
    setIsAuthenticated(isLoggedIn());

    // Listen for storage events (for cross-tab synchronization)
    const handleStorageChange = () => {
      setIsAuthenticated(isLoggedIn());
    };

    // Listen for custom auth change events
    const handleAuthChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && typeof customEvent.detail.isLoggedIn === 'boolean') {
        setIsAuthenticated(customEvent.detail.isLoggedIn);
      } else {
        setIsAuthenticated(isLoggedIn());
      }
    };

    // Listen for auth ready events
    const handleAuthReady = () => {
      console.log('Auth ready event received in Header component');
      setIsAuthenticated(isLoggedIn());
    };

    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('dairyLiftAuthChanged', handleAuthChange);
    document.addEventListener('dairyLiftAuthReady', handleAuthReady);

    // Check auth status periodically
    const intervalId = setInterval(() => {
      const currentAuthStatus = isLoggedIn();
      if (currentAuthStatus !== isAuthenticated) {
        setIsAuthenticated(currentAuthStatus);
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('dairyLiftAuthChanged', handleAuthChange);
      document.removeEventListener('dairyLiftAuthReady', handleAuthReady);
      clearInterval(intervalId);
    };
  }, [isAuthenticated]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            aria-label="Menu"
            className="lg:flex md:flex sm:flex"
          >
            <Menu className="h-6 w-6 text-dairy-dark" />
          </Button>

          <a href="../home_page.html" className="flex items-center">
            <h1 className="text-2xl font-bold text-dairy-green">
              Dairy-<span className="text-dairy-orange">Lift</span>
            </h1>
          </a>
        </div>

        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-6">
            <a href="../home_page.html" className="text-dairy-dark hover:text-dairy-green font-medium">Home</a>
            <a href="../store.html" className="text-dairy-dark hover:text-dairy-green font-medium">Store</a>
            <a href="../dashboard.html" className="text-dairy-dark hover:text-dairy-green font-medium">Dashboard</a>
            <a href="../YourCattle.html" className="text-dairy-dark hover:text-dairy-green font-medium">Your Cattle</a>
            <a href="../help/home.html" className="text-dairy-dark hover:text-dairy-green font-medium">Help</a>
          </nav>

          {/* Authentication Button */}
          {isAuthenticated ? (
            <a
              href="../profile.html"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              title="Your Profile"
              id="profile-icon-link" // Add ID to match the one in auth.js
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Profile icon clicked in header, redirecting to profile.html');
                window.location.href = "../profile.html";

                // Also try with a timeout as a fallback
                setTimeout(() => {
                  window.location.href = "../profile.html";
                }, 100);
              }}
              style={{ cursor: 'pointer', zIndex: 1000 }}
              data-fixed="true"
            >
              <User className="h-5 w-5" />
            </a>
          ) : (
            <a
              href="../login.html"
              className="flex items-center justify-center px-4 py-2 rounded-md bg-primary text-white hover:bg-primary/90 transition-colors"
            >
              Login
            </a>
          )}
        </div>
      </div>

      <Sidebar isOpen={sidebarOpen} onClose={toggleSidebar} isAuthenticated={isAuthenticated} />
    </header>
  );
};

export default Header;
