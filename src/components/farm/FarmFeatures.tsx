
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Leaf, Settings, TrendingUp } from "lucide-react";

const features = [
  {
    title: "Sustainable Practices",
    description: "Our farm implements regenerative agriculture techniques that enhance soil health and reduce environmental impact.",
    icon: Leaf,
    bgClass: "bg-gradient-to-br from-green-50 to-emerald-50"
  },
  {
    title: "Modern Technology",
    description: "We utilize precision farming technology to optimize water usage and monitor crop health in real-time.",
    icon: Settings,
    bgClass: "bg-gradient-to-br from-blue-50 to-cyan-50"
  },
  {
    title: "Investment Potential",
    description: "Explore opportunities to invest in our expanding operations with competitive returns and land appreciation.",
    icon: TrendingUp,
    bgClass: "bg-gradient-to-br from-amber-50 to-yellow-50"
  },
  {
    title: "Guided Tours",
    description: "Experience personalized tours with our agricultural experts and witness our operations firsthand.",
    icon: Calendar,
    bgClass: "bg-gradient-to-br from-purple-50 to-pink-50"
  }
];

const FarmFeatures = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="py-24 bg-gradient-to-b from-white to-farm-earth-light/10">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl font-serif text-farm-green">
            Why Visit Farm Vista
          </h2>
          <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
            Experience the future of farming and discover potential investment opportunities
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <Card 
              key={i} 
              className={`overflow-hidden transition-all duration-300 hover:shadow-xl ${feature.bgClass} border-none`}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <CardHeader className="pb-2">
                <div className="h-12 w-12 rounded-lg bg-farm-green/10 flex items-center justify-center mb-4">
                  <feature.icon className={`w-6 h-6 text-farm-green transition-transform duration-300 ${hoveredIndex === i ? 'scale-125' : ''}`} />
                </div>
                <CardTitle className="text-farm-green text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FarmFeatures;
