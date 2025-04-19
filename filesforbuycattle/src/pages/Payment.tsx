
import { useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CattleBreed } from '@/data/cattleData';

const Payment = () => {
  const location = useLocation();
  const cattle = location.state?.cattle as CattleBreed;

  if (!cattle) {
    return (
      <div className="min-h-screen bg-dairy-light">
        <Header />
        <main className="py-12 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-2xl font-bold text-dairy-dark mb-4">No Cattle Selected</h1>
            <p className="text-gray-600 mb-6">Please select a cattle from the store to proceed with investment.</p>
            <Button onClick={() => window.history.back()}>Return to Store</Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dairy-light">
      <Header />
      
      <main className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-dairy-dark">Complete Your Investment</h1>
            <p className="text-gray-600 mt-2">Review your selection and proceed with the investment</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Cattle Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Selected Cattle</CardTitle>
                <CardDescription>Investment Details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="aspect-video relative rounded-lg overflow-hidden">
                    <img 
                      src={cattle.imageUrl} 
                      alt={cattle.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{cattle.name}</h3>
                    <p className="text-dairy-green font-medium">{cattle.breed} {cattle.type}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Age</p>
                        <p className="font-medium">{cattle.age}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Health Status</p>
                        <p className="font-medium">{cattle.healthStatus}</p>
                      </div>
                      {cattle.milkProduction && (
                        <div>
                          <p className="text-gray-500">Daily Milk Production</p>
                          <p className="font-medium">{cattle.milkProduction} liters</p>
                        </div>
                      )}
                      <div>
                        <p className="text-gray-500">Monthly Est. Income</p>
                        <p className="font-medium text-dairy-green">₹{cattle.monthlyEstimatedIncome.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Details */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
                <CardDescription>Complete your investment securely</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 bg-dairy-green/5 rounded-lg border border-dairy-green/20">
                    <h4 className="font-medium mb-2">Investment Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Investment Amount</span>
                        <span className="font-medium">₹{cattle.price.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Processing Fee</span>
                        <span className="font-medium">₹{Math.round(cattle.price * 0.01).toLocaleString()}</span>
                      </div>
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between font-semibold">
                          <span>Total Amount</span>
                          <span className="text-dairy-green">
                            ₹{Math.round(cattle.price * 1.01).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex-col space-y-4">
                <Button 
                  className="w-full bg-dairy-green hover:bg-dairy-green/90 text-white"
                  size="lg"
                >
                  Proceed to Payment
                </Button>
                <p className="text-xs text-center text-gray-500">
                  By proceeding, you agree to our Terms of Service and Privacy Policy
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Payment;
