
import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Sidebar from './Sidebar';
import { Link } from 'react-router-dom';

const Header = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
          
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-dairy-green">
              Dairy-<span className="text-dairy-orange">Lift</span>
            </h1>
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-dairy-dark hover:text-dairy-green font-medium">Home</Link>
            <Link to="/store" className="text-dairy-dark hover:text-dairy-green font-medium">Store</Link>
            <Link to="/investments" className="text-dairy-dark hover:text-dairy-green font-medium">Investments</Link>
            <Link to="/about" className="text-dairy-dark hover:text-dairy-green font-medium">About</Link>
            <Link to="/contact" className="text-dairy-dark hover:text-dairy-green font-medium">Contact</Link>
          </nav>
          
          <Button variant="outline" className="hidden md:inline-flex border-dairy-green text-dairy-green hover:bg-dairy-green hover:text-white">
            Sign In
          </Button>
          
          <Button className="hidden md:inline-flex bg-dairy-green hover:bg-dairy-green/90 text-white">
            Get Started
          </Button>
        </div>
      </div>
      
      <Sidebar isOpen={sidebarOpen} onClose={toggleSidebar} />
    </header>
  );
};

export default Header;
