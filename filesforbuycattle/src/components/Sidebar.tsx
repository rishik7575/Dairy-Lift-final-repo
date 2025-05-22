
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
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
              <Link 
                to="/" 
                className="block p-2 rounded hover:bg-dairy-light hover:text-dairy-green transition-colors"
                onClick={onClose}
              >
                Home
              </Link>
            </li>
            <li>
              <Link 
                to="/store" 
                className="block p-2 rounded hover:bg-dairy-light hover:text-dairy-green transition-colors"
                onClick={onClose}
              >
                Store
              </Link>
            </li>
            <li>
              <Link 
                to="/investments" 
                className="block p-2 rounded hover:bg-dairy-light hover:text-dairy-green transition-colors"
                onClick={onClose}
              >
                Investments
              </Link>
            </li>
            <li>
              <Link 
                to="/about" 
                className="block p-2 rounded hover:bg-dairy-light hover:text-dairy-green transition-colors"
                onClick={onClose}
              >
                About
              </Link>
            </li>
            <li>
              <Link 
                to="/contact" 
                className="block p-2 rounded hover:bg-dairy-light hover:text-dairy-green transition-colors"
                onClick={onClose}
              >
                Contact
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
