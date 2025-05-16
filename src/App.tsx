import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from "./pages/Index";
import FarmVisit from "./pages/FarmVisit";
import NotFound from "./pages/NotFound";
import HomePage from './pages/HomePage'; // Ensure the path to HomePage is correct

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Router>
        <Switch>
          <Route exact path="/" component={HomePage} />
          <Route path="/home_page.html" component={Index} />
          <Route path="*" component={NotFound} />
        </Switch>
      </Router>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
