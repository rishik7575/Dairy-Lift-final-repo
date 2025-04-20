
import Navigation from "@/components/farm/Navigation";
import HeroSection from "@/components/farm/HeroSection";
import FarmFeatures from "@/components/farm/FarmFeatures";
import Testimonials from "@/components/farm/Testimonials";
import ScheduleVisit from "@/components/farm/ScheduleVisit";
import Footer from "@/components/farm/Footer";
import { Toaster } from "@/components/ui/toaster";

const FarmVisit = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <HeroSection />
      <FarmFeatures />
      <Testimonials />
      <ScheduleVisit />
      <Footer />
      <Toaster />
    </div>
  );
};

export default FarmVisit;
