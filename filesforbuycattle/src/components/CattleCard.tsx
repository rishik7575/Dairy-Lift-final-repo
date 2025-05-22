
import { useNavigate } from 'react-router-dom';
import { CattleBreed } from '@/data/cattleData';
import { Button } from '@/components/ui/button';

interface CattleCardProps {
  cattle: CattleBreed;
}

const CattleCard = ({ cattle }: CattleCardProps) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/cattle/${cattle.id}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 animate-fade-in">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={cattle.imageUrl} 
          alt={`${cattle.breed} ${cattle.type}`} 
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute top-2 right-2 bg-dairy-yellow text-dairy-dark font-semibold text-xs py-1 px-2 rounded-full">
          {cattle.type}
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-dairy-dark">{cattle.name}</h3>
          <span className="font-bold text-dairy-green">
            ₹{cattle.price.toLocaleString()}
          </span>
        </div>
        
        <p className="text-sm font-medium text-dairy-green mb-2">{cattle.breed}</p>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{cattle.shortDescription}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-xs font-medium text-gray-500">{cattle.location}</span>
          </div>
          
          <Button 
            onClick={handleViewDetails}
            className="bg-dairy-green hover:bg-dairy-green/90 text-white"
          >
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CattleCard;
