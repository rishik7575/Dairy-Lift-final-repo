
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CattleBreed, getRecommendedCattle } from "@/data/cattleData";
import RecommendationCarousel from "./RecommendationCarousel";

interface CattleDetailsModalProps {
  cattle: CattleBreed;
  isOpen: boolean;
  onClose: () => void;
}

const CattleDetailsModal = ({ cattle, isOpen, onClose }: CattleDetailsModalProps) => {
  const navigate = useNavigate();
  const recommended = getRecommendedCattle(cattle);

  const handleInvestClick = () => {
    onClose();
    navigate('/payment', { state: { cattle } });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        <div className="relative h-64 overflow-hidden">
          <img 
            src={cattle.imageUrl} 
            alt={`${cattle.breed} ${cattle.type}`} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent">
            <div className="absolute bottom-4 left-4 right-4">
              <h2 className="text-2xl font-bold text-white">{cattle.name}</h2>
              <p className="text-dairy-yellow font-medium">{cattle.breed} {cattle.type}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="space-y-3">
              <DetailItem label="Age" value={cattle.age} />
              <DetailItem label="Health Status" value={cattle.healthStatus} />
              <DetailItem label="Vaccinated" value={cattle.isVaccinated ? "Yes" : "No"} />
              <DetailItem label="Location" value={cattle.location} />
            </div>
            <div className="space-y-3">
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

          <div className="border-t pt-4">
            <h3 className="text-lg font-bold text-dairy-dark mb-2">About</h3>
            <p className="text-gray-700">{cattle.shortDescription}</p>
          </div>

          <div className="flex justify-end mt-6 gap-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button 
              className="bg-dairy-green hover:bg-dairy-green/90 text-white"
              onClick={handleInvestClick}
            >
              Invest Now
            </Button>
          </div>
        </div>

        {recommended.length > 0 && (
          <div className="p-6 bg-dairy-light border-t">
            <h3 className="text-lg font-bold text-dairy-dark mb-4">Recommended for you</h3>
            <RecommendationCarousel recommendations={recommended} />
          </div>
        )}
      </DialogContent>
    </Dialog>
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

export default CattleDetailsModal;
