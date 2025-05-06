
import { useState } from "react";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleNavigation = (page: string) => {
    setIsOpen(false);
    toast({
      title: `Navigating to ${page}`,
      description: "This would navigate to a new page in a full implementation.",
    });
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/50 to-transparent">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all duration-300"
            >
              <Menu className="w-6 h-6 text-white" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] bg-white/95 backdrop-blur-md border-r border-farm-earth-light">
            <SheetHeader>
              <SheetTitle className="text-2xl font-serif text-farm-green">Farm Vista</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-4 mt-8">
              {["Home", "About", "Investment Opportunities", "Schedule Visit", "Contact"].map((item) => (
                <Button 
                  key={item}
                  variant="ghost" 
                  className="justify-start text-lg font-medium hover:bg-farm-earth-light/20 hover:text-farm-green transition-all duration-300"
                  onClick={() => handleNavigation(item)}
                >
                  {item}
                </Button>
              ))}
            </div>
            <div className="absolute bottom-8 left-4 right-4">
              <Button 
                className="w-full bg-farm-green hover:bg-farm-green-dark transition-all duration-300"
                onClick={() => {
                  toast({
                    title: "Investor Portal",
                    description: "This would open the investor login portal in a full implementation.",
                  });
                  setIsOpen(false);
                }}
              >
                Investor Login
              </Button>
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex-1" />
        <Button 
          variant="outline" 
          className="hidden md:flex bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm rounded-full transition-all duration-300"
          onClick={() => {
            document.getElementById('schedule-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          Schedule a Visit
        </Button>
      </div>
    </div>
  );
};

export default Navigation;
