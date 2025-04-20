
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    title: "Sustainable Practices",
    description: "Our farm implements regenerative agriculture techniques that enhance soil health and reduce environmental impact."
  },
  {
    title: "Organic Certification",
    description: "All crops are grown according to certified organic standards, without synthetic pesticides or fertilizers."
  },
  {
    title: "Modern Technology",
    description: "We utilize precision farming technology to optimize water usage and monitor crop health in real-time."
  },
  {
    title: "Investment Potential",
    description: "Explore opportunities to invest in our expanding operations with competitive returns and land appreciation."
  }
];

const FarmFeatures = () => {
  return (
    <section className="py-16 bg-farm-green/5">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-serif text-farm-green">
            Why Visit Farm Vista
          </h2>
          <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
            Experience the future of farming and discover potential investment opportunities
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <Card key={i} className="overflow-hidden hover:shadow-lg transition-shadow glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-farm-green">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FarmFeatures;
