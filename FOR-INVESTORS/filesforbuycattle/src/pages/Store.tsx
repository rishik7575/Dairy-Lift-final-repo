
import Header from '@/components/Header';
import CattleGrid from '@/components/CattleGrid';

const Store = () => {
  return (
    <div className="min-h-screen bg-dairy-light">
      <Header />
      
      <main className="py-12 px-4">
        <div className="container mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-dairy-dark">Cattle Store</h1>
            <p className="text-gray-600 mt-2">
              Browse our premium cattle selection for investment
            </p>
          </div>
          
          <CattleGrid />
        </div>
      </main>
    </div>
  );
};

export default Store;
