
import Header from '@/components/Header';

const Investments = () => {
  return (
    <div className="min-h-screen bg-dairy-light">
      <Header />
      
      <main className="py-12 px-4">
        <div className="container mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-dairy-dark">Your Investments</h1>
            <p className="text-gray-600 mt-2">
              Track and manage your cattle investments
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <div className="text-center py-12">
              <h2 className="text-2xl font-medium text-dairy-dark mb-4">Sign in to view your investments</h2>
              <p className="text-gray-600 mb-6">
                Create an account or sign in to track your investments and income
              </p>
              <div className="flex justify-center gap-4">
                <button className="px-6 py-2 bg-dairy-green text-white rounded-lg hover:bg-dairy-green/90 transition">
                  Sign In
                </button>
                <button className="px-6 py-2 border border-dairy-green text-dairy-green rounded-lg hover:bg-dairy-green/10 transition">
                  Create Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Investments;
