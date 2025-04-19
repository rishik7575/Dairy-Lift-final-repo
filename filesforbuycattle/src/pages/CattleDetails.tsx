
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CattleBreed, cattleBreeds, getRecommendedCattle } from "@/data/cattleData";
import Header from '@/components/Header';
import RecommendationCarousel from "@/components/RecommendationCarousel";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

const CattleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cattle, setCattle] = useState<CattleBreed | null>(null);
  const [recommended, setRecommended] = useState<CattleBreed[]>([]);

  useEffect(() => {
    const foundCattle = cattleBreeds.find(c => c.id === id);
    if (foundCattle) {
      setCattle(foundCattle);
      setRecommended(getRecommendedCattle(foundCattle));
    } else {
      navigate('/store');
    }
  }, [id, navigate]);

  const handleInvestClick = () => {
    navigate('/payment', { state: { cattle } });
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  if (!cattle) {
    return (
      <div className="min-h-screen bg-dairy-light flex items-center justify-center">
        <p className="text-xl">Loading cattle details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dairy-light">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          className="mb-6 flex items-center text-dairy-dark"
          onClick={handleBackClick}
        >
          <ChevronLeft className="mr-1" />
          Back to browsing
        </Button>

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="md:flex">
            {/* Left: Cattle Image */}
            <div className="md:w-1/2 h-[400px] relative">
              <img 
                src={cattle.imageUrl} 
                alt={`${cattle.breed} ${cattle.type}`} 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 bg-dairy-yellow text-dairy-dark font-semibold py-1 px-3 rounded-full">
                {cattle.type}
              </div>
            </div>
            
            {/* Right: Cattle Details */}
            <div className="md:w-1/2 p-6 md:p-8">
              <h1 className="text-3xl font-bold text-dairy-dark mb-2">{cattle.name}</h1>
              <p className="text-xl text-dairy-green font-medium mb-4">{cattle.breed} {cattle.type}</p>

              <p className="text-gray-700 mb-6">{cattle.shortDescription}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <DetailItem label="Age" value={cattle.age} />
                  <DetailItem label="Health Status" value={cattle.healthStatus} />
                  <DetailItem label="Vaccinated" value={cattle.isVaccinated ? "Yes" : "No"} />
                  <DetailItem label="Location" value={cattle.location} />
                </div>
                <div className="space-y-4">
                  {cattle.lactationCycle && (
                    <DetailItem label="Lactation Cycle" value={cattle.lactationCycle} />
                  )}
                  {cattle.milkProduction && (
                    <DetailItem label="Daily Milk Production" value={`${cattle.milkProduction} liters`} />
                  )}
                  <DetailItem 
                    label="Price" 
                    value={`₹${cattle.price.toLocaleString()}`} 
                    important
                  />
                  <DetailItem 
                    label="Monthly Est. Income" 
                    value={`₹${cattle.monthlyEstimatedIncome.toLocaleString()}`} 
                    important
                  />
                </div>
              </div>
              
              <Button 
                className="w-full py-6 bg-dairy-green hover:bg-dairy-green/90 text-white text-lg"
                onClick={handleInvestClick}
              >
                Invest Now
              </Button>
            </div>
          </div>
        </div>
        
        {recommended.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold text-dairy-dark mb-6">Recommended for you</h2>
            <RecommendationCarousel recommendations={recommended} />
          </div>
        )}
      </div>
    </div>
  );
};

const DetailItem = ({ 
  label, 
  value, 
  important = false 
}: { 
  label: string, 
  value: string, 
  important?: boolean 
}) => (
  <div>
    <p className="text-sm text-gray-500">{label}</p>
    <p className={`font-medium ${important ? 'text-dairy-green text-lg' : 'text-dairy-dark'}`}>
      {value}
    </p>
  </div>
);

export default CattleDetails;
