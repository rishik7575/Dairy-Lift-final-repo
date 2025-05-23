
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-dairy-light">
      <div className="text-center px-4">
        <h1 className="text-4xl md:text-6xl font-bold text-dairy-dark mb-4">404</h1>
        <p className="text-2xl text-dairy-green font-semibold mb-6">Page Not Found</p>
        <p className="text-gray-600 max-w-md mx-auto mb-8">
          We can't seem to find the page you're looking for. Let's get you back to browsing cattle.
        </p>
        <Button asChild className="bg-dairy-green hover:bg-dairy-green/90 text-white">
          <Link to="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
