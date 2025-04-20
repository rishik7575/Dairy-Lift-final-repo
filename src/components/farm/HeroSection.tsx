
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

const HeroSection = () => {
  return (
    <div className="relative h-[85vh] min-h-[600px] w-full overflow-hidden">
      <div className="absolute inset-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="object-cover w-full h-full"
          poster="https://images.unsplash.com/photo-1472396961693-142e6e269027?q=80&w=1600&h=900&auto=format&fit=crop"
        >
          <source src="https://player.vimeo.com/external/517629292.hd.mp4?s=b4e62007567995e0c87fb0b6641ca4c7de2f8c7f&profile_id=175" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60" />
      <div className="relative z-10 h-full flex flex-col justify-end items-center text-center pb-20 px-4 sm:px-6 lg:px-8">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 font-serif animate-fade-in tracking-tight">
          Experience Farm Vista
        </h1>
        <p className="text-xl md:text-2xl text-white/90 max-w-3xl mb-8 animate-fade-in leading-relaxed" style={{ animationDelay: "0.2s" }}>
          Discover our sustainable farming practices and explore investment opportunities in the heart of nature
        </p>
        <div className="space-y-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <Button 
            className="bg-farm-green hover:bg-farm-green-dark text-white px-8 py-6 text-lg shadow-lg rounded-full transition-all duration-300 hover:scale-105"
            onClick={() => {
              document.getElementById('schedule-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Schedule Your Visit
          </Button>
          <div className="flex items-center justify-center mt-12">
            <ArrowDown className="w-6 h-6 text-white animate-bounce" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
