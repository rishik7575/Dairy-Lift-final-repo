
import { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom'; // Not needed anymore as we use direct links
import { User, LogIn, LogOut, Home, ShoppingCart, BarChart2, HelpCircle, Grid } from 'lucide-react';
import { logout, isLoggedIn, initAuth } from '@/lib/auth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated?: boolean;
}

const Sidebar = ({ isOpen, onClose, isAuthenticated: propIsAuthenticated = false }: SidebarProps) => {
  // Use local state to ensure we're always in sync with localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(propIsAuthenticated);

  useEffect(() => {
    // Initialize auth system
    initAuth();

    // Update local state when prop changes
    setIsAuthenticated(propIsAuthenticated);

    // Also check localStorage directly
    const authStatus = isLoggedIn();
    if (authStatus !== isAuthenticated) {
      setIsAuthenticated(authStatus);
    }

    // Listen for auth changes
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
      console.log('Auth ready event received in Sidebar component');
      setIsAuthenticated(isLoggedIn());
    };

    // Listen for storage events
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'dairyLift_auth') {
        setIsAuthenticated(isLoggedIn());
      }
    };

    document.addEventListener('dairyLiftAuthChanged', handleAuthChange);
    document.addEventListener('dairyLiftAuthReady', handleAuthReady);
    window.addEventListener('storage', handleStorageChange);

    // Check auth status periodically
    const intervalId = setInterval(() => {
      const currentAuthStatus = isLoggedIn();
      if (currentAuthStatus !== isAuthenticated) {
        setIsAuthenticated(currentAuthStatus);
      }
    }, 1000);

    return () => {
      document.removeEventListener('dairyLiftAuthChanged', handleAuthChange);
      document.removeEventListener('dairyLiftAuthReady', handleAuthReady);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, [propIsAuthenticated, isAuthenticated]);
  // Close sidebar when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (isOpen && target.id === 'sidebar-overlay') {
        onClose();
      }
    };

    document.addEventListener('click', handleOutsideClick);

    // Prevent scrolling when sidebar is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('click', handleOutsideClick);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          id="sidebar-overlay"
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold text-dairy-green">
            Dairy-<span className="text-dairy-orange">Lift</span>
          </h2>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <a
                href="../home_page.html"
                className="flex items-center p-2 rounded hover:bg-dairy-light hover:text-dairy-green transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Close the sidebar
                  onClose();
                  // Navigate to home_page.html
                  console.log('Home link clicked in sidebar, redirecting to home_page.html');
                  window.location.href = "../home_page.html";

                  // Also try with a timeout as a fallback
                  setTimeout(() => {
                    window.location.href = "../home_page.html";
                  }, 100);
                }}
                style={{ cursor: 'pointer', fontWeight: 'bold' }}
                title="Home Page"
                data-fixed="true"
              >
                <Home className="h-4 w-4 mr-2" />
                Home
              </a>
            </li>
            <li>
              <a
                href="../store.html"
                className="flex items-center p-2 rounded hover:bg-dairy-light hover:text-dairy-green transition-colors"
                onClick={onClose}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Store
              </a>
            </li>
            <li>
              <a
                href="../cartstore.html"
                className="flex items-center p-2 rounded hover:bg-dairy-light hover:text-dairy-green transition-colors"
                onClick={onClose}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Cart
              </a>
            </li>
            <li>
              <a
                href="../watchliststore.html"
                className="flex items-center p-2 rounded hover:bg-dairy-light hover:text-dairy-green transition-colors"
                onClick={onClose}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Watchlist
              </a>
            </li>
            <li>
              <a
                href="../dashboard.html"
                className="flex items-center p-2 rounded hover:bg-dairy-light hover:text-dairy-green transition-colors"
                onClick={onClose}
              >
                <BarChart2 className="h-4 w-4 mr-2" />
                Dashboard
              </a>
            </li>
            <li>
              <a
                href="../YourCattle.html"
                className="flex items-center p-2 rounded hover:bg-dairy-light hover:text-dairy-green transition-colors"
                onClick={onClose}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Your Cattle
              </a>
            </li>
            <li>
              <a
                href="../visit-farm.html"
                className="flex items-center p-2 rounded hover:bg-dairy-light hover:text-dairy-green transition-colors"
                onClick={onClose}
              >
                <Grid className="h-4 w-4 mr-2" />
                Visit Farm
              </a>
            </li>
            <li>
              <a
                href="../help/home.html"
                className="flex items-center p-2 rounded hover:bg-dairy-light hover:text-dairy-green transition-colors"
                onClick={onClose}
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Help
              </a>
            </li>

            {/* Authentication Links */}
            <li className="pt-4 mt-4 border-t border-gray-200">
              {isAuthenticated ? (
                <>
                  <a
                    href="../profile.html"
                    className="flex items-center p-2 rounded hover:bg-dairy-light hover:text-dairy-green transition-colors"
                    onClick={onClose}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Your Profile
                  </a>
                  <button
                    onClick={() => {
                      logout();
                      onClose();
                    }}
                    className="flex items-center w-full text-left p-2 rounded hover:bg-dairy-light hover:text-red-500 transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <a
                  href="../login.html"
                  className="flex items-center p-2 rounded hover:bg-dairy-light hover:text-dairy-green transition-colors"
                  onClick={onClose}
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Login / Register
                </a>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
