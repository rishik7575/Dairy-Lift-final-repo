
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';

const Contact = () => {
  return (
    <div className="min-h-screen bg-dairy-light">
      <Header />
      
      <main className="py-12 px-4">
        <div className="container mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-dairy-dark">Contact Us</h1>
            <p className="text-gray-600 mt-2 max-w-xl mx-auto">
              Have questions about investing in cattle? Our team is here to help.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h2 className="text-2xl font-semibold text-dairy-dark mb-6">Send us a message</h2>
              
              <form className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-dairy-green focus:border-dairy-green"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-dairy-green focus:border-dairy-green"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-dairy-green focus:border-dairy-green"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input 
                    type="tel" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-dairy-green focus:border-dairy-green"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea 
                    rows={4} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-dairy-green focus:border-dairy-green"
                  ></textarea>
                </div>
                
                <Button className="w-full bg-dairy-green hover:bg-dairy-green/90 text-white">
                  Send Message
                </Button>
              </form>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h2 className="text-2xl font-semibold text-dairy-dark mb-6">Contact Information</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-dairy-green mb-2">Address</h3>
                  <address className="not-italic text-gray-700">
                    <p>1234 Dairy Road,</p>
                    <p>Cattle Farm, CF 12345</p>
                    <p>United States</p>
                  </address>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-dairy-green mb-2">Phone</h3>
                  <p className="text-gray-700">+1 (123) 456-7890</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-dairy-green mb-2">Email</h3>
                  <p className="text-gray-700">info@dairy-lift.com</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-dairy-green mb-2">Business Hours</h3>
                  <p className="text-gray-700">Monday - Friday: 9:00 AM - 5:00 PM</p>
                  <p className="text-gray-700">Saturday: 10:00 AM - 2:00 PM</p>
                  <p className="text-gray-700">Sunday: Closed</p>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t">
                <h3 className="text-lg font-medium text-dairy-dark mb-4">Follow Us</h3>
                <div className="flex space-x-4">
                  <a href="#" className="w-10 h-10 bg-dairy-green/10 rounded-full flex items-center justify-center hover:bg-dairy-green/20 transition">FB</a>
                  <a href="#" className="w-10 h-10 bg-dairy-green/10 rounded-full flex items-center justify-center hover:bg-dairy-green/20 transition">IN</a>
                  <a href="#" className="w-10 h-10 bg-dairy-green/10 rounded-full flex items-center justify-center hover:bg-dairy-green/20 transition">TW</a>
                  <a href="#" className="w-10 h-10 bg-dairy-green/10 rounded-full flex items-center justify-center hover:bg-dairy-green/20 transition">IG</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contact;
