
import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://avaakcvenjjydbxopwti.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2YWFrY3ZlbmpqeWRieG9wd3RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4OTQzMjIsImV4cCI6MjA2MzQ3MDMyMn0.qeN6jRNwhhvkwpEZ-aTyQipLPA2KyUmW9prJ_-t4tOs';
const supabase = createClient(supabaseUrl, supabaseKey);

const ScheduleVisit = () => {
  const [date, setDate] = useState<Date>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Form validation
    if (!date || !name || !email) {
      toast({
        title: "Please check your information",
        description: "Name, email, and visit date are required.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create farm visit request
      const visitRequest = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        visit_date: date.toISOString(),
        message: message.trim() || null,
        status: 'pending'
      };

      const { data: requestData, error: requestError } = await supabase
        .from('farm_visit_requests')
        .insert([visitRequest])
        .select()
        .single();

      if (requestError) {
        console.error('Error creating farm visit request:', requestError);
        throw requestError;
      }

      // Create notification for admin dashboard
      const notification = {
        type: 'farm_visit_request',
        title: 'New Farm Visit Request',
        description: `${name} has requested a farm visit on ${format(date, "PPP")}`,
        priority: 'high',
        status: 'pending',
        related_id: requestData.id
      };

      const { error: notificationError } = await supabase
        .from('notifications')
        .insert([notification]);

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
        throw notificationError;
      }

      // Success
      toast({
        title: "Visit scheduled successfully!",
        description: `Your farm visit has been scheduled for ${format(date, "PPP")}. You will receive a confirmation email shortly.`,
      });

      // Reset form
      setDate(undefined);
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");

    } catch (error) {
      console.error('Error submitting farm visit request:', error);
      toast({
        title: "Error scheduling visit",
        description: "There was an error scheduling your farm visit. Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="schedule-section" className="py-16 bg-gradient-to-b from-white to-farm-earth-light/30">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-serif text-farm-green">
            Schedule Your Farm Visit
          </h2>
          <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
            Take a guided tour of our operations, see our sustainable practices in action, and learn about investment opportunities.
          </p>
        </div>
        <div className="mx-auto max-w-md">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Book Your Visit</CardTitle>
              <CardDescription>
                Choose a date and time that works for you. We offer tours Monday through Saturday.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Smith"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Select Visit Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        disabled={(date) => {
                          // Disable past dates and Sundays (day index 0)
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today || date.getDay() === 0;
                        }}
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Additional Notes (optional)</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us about any specific areas you're interested in..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleSubmit}
                className="w-full bg-farm-green hover:bg-farm-green-dark"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Scheduling..." : "Schedule Visit"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ScheduleVisit;
