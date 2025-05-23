
import Header from '@/components/Header';

const About = () => {
  return (
    <div className="min-h-screen bg-dairy-light">
      <Header />
      
      <main className="py-12 px-4">
        <div className="container mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-dairy-dark">About Dairy-Lift</h1>
            <p className="text-gray-600 mt-2 max-w-xl mx-auto">
              A premium cattle investment platform connecting investors with quality dairy cattle
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-sm mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-semibold text-dairy-dark mb-4">Our Mission</h2>
                <p className="text-gray-700 mb-4">
                  At Dairy-Lift, we're committed to revolutionizing cattle investment by creating a platform 
                  that connects investors with high-quality dairy cattle, providing sustainable returns while
                  supporting ethical dairy farming practices.
                </p>
                <p className="text-gray-700">
                  We believe in transparency, quality, and creating value for both investors and the 
                  dairy farming community. By carefully selecting the best breeds and maintaining 
                  stringent health standards, we ensure optimal returns for our investors.
                </p>
              </div>
              <div className="rounded-lg overflow-hidden h-64">
                <img 
                  src="https://images.unsplash.com/photo-1465379944081-7f47de8d74ac?auto=format&fit=crop&w=800" 
                  alt="Dairy farm with cattle" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-dairy-green/20 rounded-full flex items-center justify-center mb-4">
                <span className="text-dairy-green text-xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold text-dairy-dark mb-2">Quality Focus</h3>
              <p className="text-gray-700">
                We carefully select each animal based on breed quality, health records, 
                and milk production history to ensure optimal returns.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-dairy-yellow/20 rounded-full flex items-center justify-center mb-4">
                <span className="text-dairy-orange text-xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold text-dairy-dark mb-2">Ethical Practices</h3>
              <p className="text-gray-700">
                All our partner farms maintain the highest standards of animal welfare and 
                sustainable farming practices for healthy, productive cattle.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-dairy-orange/20 rounded-full flex items-center justify-center mb-4">
                <span className="text-dairy-green text-xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold text-dairy-dark mb-2">Transparent Returns</h3>
              <p className="text-gray-700">
                We provide clear monthly reports on milk production, health status, and 
                returns, ensuring complete transparency for our investors.
              </p>
            </div>
          </div>
          
          <div className="bg-dairy-green/5 p-8 rounded-lg">
            <h2 className="text-2xl font-semibold text-dairy-dark mb-6 text-center">Our Team</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="text-center">
                  <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4"></div>
                  <h3 className="font-semibold text-dairy-dark">Team Member {i}</h3>
                  <p className="text-dairy-green text-sm">Position</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;
