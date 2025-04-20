
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
    <div className="fixed top-0 left-0 z-50 p-4">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="bg-white/80 hover:bg-white shadow-md rounded-md"
          >
            <Menu className="w-6 h-6 text-farm-green" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="bg-white w-[300px] border-r border-farm-earth-light">
          <SheetHeader>
            <SheetTitle className="text-2xl font-serif text-farm-green">Farm Vista</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-4 mt-8">
            <Button 
              variant="ghost" 
              className="justify-start text-lg font-medium hover:bg-farm-earth-light/20 hover:text-farm-green"
              onClick={() => handleNavigation("Home")}
            >
              Home
            </Button>
            <Button 
              variant="ghost" 
              className="justify-start text-lg font-medium hover:bg-farm-earth-light/20 hover:text-farm-green"
              onClick={() => handleNavigation("About")}
            >
              About Our Farm
            </Button>
            <Button 
              variant="ghost" 
              className="justify-start text-lg font-medium hover:bg-farm-earth-light/20 hover:text-farm-green"
              onClick={() => handleNavigation("Investments")}
            >
              Investment Opportunities
            </Button>
            <Button 
              variant="ghost" 
              className="justify-start text-lg font-medium hover:bg-farm-earth-light/20 hover:text-farm-green"
              onClick={() => handleNavigation("Schedule Visit")}
            >
              Schedule Visit
            </Button>
            <Button 
              variant="ghost" 
              className="justify-start text-lg font-medium hover:bg-farm-earth-light/20 hover:text-farm-green"
              onClick={() => handleNavigation("Contact")}
            >
              Contact Us
            </Button>
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <Button 
              variant="default"
              className="w-full bg-farm-green hover:bg-farm-green-dark"
              onClick={() => {
                toast({
                  title: "Login Feature",
                  description: "This would open a login form in a full implementation.",
                });
                setIsOpen(false);
              }}
            >
              Investor Login
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Navigation;
