
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <div className="relative h-[60vh] min-h-[500px] w-full overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1472396961693-142e6e269027?q=80&w=1600&h=900&auto=format&fit=crop')",
          filter: "brightness(0.85)"
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />
      <div className="relative z-10 h-full flex flex-col justify-end items-center text-center pb-16 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 font-serif animate-fade-in">
          Experience Farm Vista
        </h1>
        <p className="text-xl text-white/90 max-w-2xl mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          Schedule a visit to see our sustainable farming operations and explore investment opportunities
        </p>
        <Button 
          className="bg-farm-green hover:bg-farm-green-dark text-white px-8 py-6 text-lg shadow-lg animate-fade-in"
          style={{ animationDelay: "0.4s" }}
          onClick={() => {
            document.getElementById('schedule-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          Schedule Your Visit
        </Button>
      </div>
    </div>
  );
};

export default HeroSection;
