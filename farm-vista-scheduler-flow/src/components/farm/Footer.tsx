
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="bg-farm-green text-white py-12">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">Farm Vista</h3>
            <p className="text-white/80 mb-4">
              Experience sustainable farming practices and explore investment opportunities in modern agriculture.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Button variant="link" className="text-white/80 hover:text-white p-0 h-auto">About Us</Button></li>
              <li><Button variant="link" className="text-white/80 hover:text-white p-0 h-auto">Investment Opportunities</Button></li>
              <li><Button variant="link" className="text-white/80 hover:text-white p-0 h-auto">Schedule a Visit</Button></li>
              <li><Button variant="link" className="text-white/80 hover:text-white p-0 h-auto">Contact</Button></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
            <address className="not-italic text-white/80">
              <p>1234 Farm Vista Lane</p>
              <p>Green Valley, CA 95432</p>
              <p className="mt-2">Email: info@farmvista.com</p>
              <p>Phone: (555) 123-4567</p>
            </address>
          </div>
        </div>
        <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/60 text-sm">
          <p>© {new Date().getFullYear()} Farm Vista. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
