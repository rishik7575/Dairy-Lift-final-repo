
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import CattleGrid from '@/components/CattleGrid';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="min-h-screen bg-dairy-light">
      <Header />
      
      <main>
        <Hero />
        
        <section className="py-12 px-4">
          <div className="container mx-auto">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-dairy-dark">Featured Cattle Breeds</h2>
              <p className="text-gray-600 mt-2">
                Choose from our selection of high-quality cattle for investment
              </p>
            </div>
            <CattleGrid />
          </div>
        </section>
        
        <section className="py-12 px-4 bg-white">
          <div className="container mx-auto">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-dairy-dark">Why Choose Dairy-Lift?</h2>
              <p className="text-gray-600 mt-2">
                We offer the best breeds with superior returns
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard 
                title="Premium Breeds" 
                description="All our cattle are carefully selected for optimal milk production and health."
                iconClass="bg-dairy-yellow/20"
              />
              <FeatureCard 
                title="Expert Maintenance" 
                description="Our team of veterinarians ensures the cattle remain in excellent health."
                iconClass="bg-dairy-green/20"
              />
              <FeatureCard 
                title="Guaranteed Returns" 
                description="Enjoy predictable monthly returns from your cattle investment."
                iconClass="bg-dairy-orange/20"
              />
            </div>
          </div>
        </section>
        
        <section className="py-12 px-4 bg-dairy-green/5">
          <div className="container mx-auto">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-dairy-dark">How It Works</h2>
              <p className="text-gray-600 mt-2">
                Start your dairy investment journey in three simple steps
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-dairy-green text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-bold text-dairy-dark mb-2">Choose Your Cattle</h3>
                <p className="text-gray-600">
                  Browse our selection and pick the cattle that matches your investment goals.
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-dairy-green text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-bold text-dairy-dark mb-2">Complete Investment</h3>
                <p className="text-gray-600">
                  Finalize your investment with our secure payment options.
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-dairy-green text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-bold text-dairy-dark mb-2">Receive Regular Income</h3>
                <p className="text-gray-600">
                  Enjoy monthly income deposited directly to your bank account.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-dairy-dark text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Dairy-Lift</h3>
              <p className="text-gray-300">
                Premium cattle investment platform for sustainable returns.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-300 hover:text-dairy-yellow">Home</Link></li>
                <li><Link to="/store" className="text-gray-300 hover:text-dairy-yellow">Store</Link></li>
                <li><Link to="/investments" className="text-gray-300 hover:text-dairy-yellow">Investments</Link></li>
                <li><Link to="/about" className="text-gray-300 hover:text-dairy-yellow">About</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><Link to="/contact" className="text-gray-300 hover:text-dairy-yellow">Contact</Link></li>
                <li><Link to="/faq" className="text-gray-300 hover:text-dairy-yellow">FAQs</Link></li>
                <li><Link to="/terms" className="text-gray-300 hover:text-dairy-yellow">Terms & Conditions</Link></li>
                <li><Link to="/privacy" className="text-gray-300 hover:text-dairy-yellow">Privacy Policy</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <address className="not-italic text-gray-300">
                <p>1234 Dairy Road,</p>
                <p>Cattle Farm, CF 12345</p>
                <p className="mt-2">Email: info@dairy-lift.com</p>
                <p>Phone: +1 (123) 456-7890</p>
              </address>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Dairy-Lift. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ 
  title, 
  description, 
  iconClass 
}: { 
  title: string; 
  description: string; 
  iconClass: string; 
}) => (
  <div className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
    <div className={`w-12 h-12 rounded-full ${iconClass} flex items-center justify-center mb-4`}>
      <div className="w-6 h-6 bg-dairy-green rounded-full"></div>
    </div>
    <h3 className="text-xl font-bold text-dairy-dark mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default Index;
