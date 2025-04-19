
import { cattleBreeds } from '@/data/cattleData';
import CattleCard from './CattleCard';

const CattleGrid = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {cattleBreeds.map((cattle) => (
        <CattleCard key={cattle.id} cattle={cattle} />
      ))}
    </div>
  );
};

export default CattleGrid;
