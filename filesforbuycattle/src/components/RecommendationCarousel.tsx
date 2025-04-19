
import { CattleBreed } from '@/data/cattleData';
import { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';

interface RecommendationCarouselProps {
  recommendations: CattleBreed[];
}

const RecommendationCarousel = ({ recommendations }: RecommendationCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === recommendations.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? recommendations.length - 1 : prevIndex - 1
    );
  };

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <div className="flex overflow-x-auto pb-4 space-x-4 scrollbar-hide">
        {recommendations.map((cattle) => (
          <div 
            key={cattle.id}
            className="flex-none w-[260px] bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="h-32 overflow-hidden">
              <img 
                src={cattle.imageUrl} 
                alt={cattle.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-dairy-dark">{cattle.name}</h4>
                  <p className="text-xs text-dairy-green">{cattle.breed} {cattle.type}</p>
                </div>
                <p className="text-sm font-bold text-dairy-green">
                  ₹{cattle.price.toLocaleString()}
                </p>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">{cattle.location}</span>
                {cattle.milkProduction && (
                  <span className="text-xs bg-dairy-yellow/20 text-dairy-dark px-2 py-0.5 rounded-full">
                    {cattle.milkProduction} L/day
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {recommendations.length > 1 && (
        <>
          <Button 
            variant="outline" 
            size="icon" 
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white shadow-md opacity-80 hover:opacity-100"
            onClick={prevSlide}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-white shadow-md opacity-80 hover:opacity-100"
            onClick={nextSlide}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
};

export default RecommendationCarousel;
