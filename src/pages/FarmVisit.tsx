
import Navigation from "@/components/farm/Navigation";
import HeroSection from "@/components/farm/HeroSection";
import FarmFeatures from "@/components/farm/FarmFeatures";
import Testimonials from "@/components/farm/Testimonials";
import ScheduleVisit from "@/components/farm/ScheduleVisit";
import Footer from "@/components/farm/Footer";
import { Toaster } from "@/components/ui/toaster";

const FarmVisit = () => {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navigation />
      <div className="space-y-1">
        <HeroSection />
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-farm-earth-light/5 to-transparent pointer-events-none" />
          <FarmFeatures />
        </div>
        <Testimonials />
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-t from-farm-earth-light/5 to-transparent pointer-events-none" />
          <ScheduleVisit />
        </div>
        <Footer />
      </div>
      <Toaster />
    </div>
  );
};

export default FarmVisit;
