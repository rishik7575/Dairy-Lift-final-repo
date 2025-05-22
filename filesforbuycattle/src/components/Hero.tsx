
import { Button } from './ui/button';

const Hero = () => {
  return (
    <div className="relative bg-dairy-light overflow-hidden">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold text-dairy-dark mb-4">
            Invest in Premium Cattle,
            <span className="text-dairy-green"> Secure Your Future</span>
          </h1>
          <p className="text-lg text-gray-700 mb-8">
            Dairy-Lift connects investors with high-quality cattle breeds to create
            sustainable passive income. Choose from our carefully selected breeds for
            optimal returns.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button className="bg-dairy-green hover:bg-dairy-green/90 text-white">
              View Breeds
            </Button>
            <Button variant="outline" className="border-dairy-green text-dairy-green hover:bg-dairy-green hover:text-white">
              Learn More
            </Button>
          </div>
        </div>
      </div>
      <div className="absolute right-0 bottom-0 -z-10 opacity-20 select-none">
        <svg width="420" height="350" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill="#4F9C67" d="M47.9,-61.5C60.3,-51.2,67.4,-34.4,71.8,-16.8C76.3,0.8,78.1,19.2,71.5,33.8C64.9,48.4,49.9,59.2,34.3,63.7C18.6,68.2,2.2,66.4,-16.9,65C-36,63.5,-57.9,62.5,-70.8,50.8C-83.7,39.2,-87.7,17,-84,0.6C-80.2,-15.8,-68.6,-27.7,-55.7,-38.1C-42.8,-48.5,-28.4,-57.5,-12.9,-63.2C2.6,-68.9,18,-71.9,31.7,-69.1C45.4,-66.4,57.4,-58.1,64.5,-46.7" transform="translate(100 100)" />
        </svg>
      </div>
    </div>
  );
};

export default Hero;
