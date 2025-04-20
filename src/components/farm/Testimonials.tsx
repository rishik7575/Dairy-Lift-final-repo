
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

const testimonials = [
  {
    name: "Michael Thompson",
    role: "Investor since 2021",
    content: "Visiting Farm Vista gave me the confidence to invest. Seeing their sustainable practices firsthand was impressive.",
    avatar: "MT"
  },
  {
    name: "Sarah Johnson",
    role: "Agricultural Consultant",
    content: "The tour provided valuable insights into how traditional farming can adopt modern techniques while staying environmentally conscious.",
    avatar: "SJ"
  },
  {
    name: "David Chen",
    role: "Investment Partner",
    content: "The transparency and detailed farm tour convinced me to increase my investment. Their operation is truly innovative.",
    avatar: "DC"
  }
];

const Testimonials = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-serif text-farm-green">
            What Our Visitors Say
          </h2>
          <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
            Hear from investors and agricultural professionals who have toured our farm
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item, i) => (
            <Card key={i} className="overflow-hidden hover:shadow-lg transition-shadow glass-card">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar>
                    <AvatarFallback className="bg-farm-earth-light text-farm-earth-dark">{item.avatar}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{item.content}"</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
