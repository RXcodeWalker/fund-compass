import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import FundDetail from "./pages/FundDetail.tsx";
import Compare from "./pages/Compare.tsx";
import Recommend from "./pages/Recommend.tsx";
import Portfolio from "./pages/Portfolio.tsx";
import ManagerDetail from "./pages/ManagerDetail.tsx";
import Pricing from "./pages/Pricing.tsx";
import UpgradeSuccess from "./pages/UpgradeSuccess.tsx";
import { CompareProvider } from "@/hooks/useCompare";
import { PortfolioProvider } from "@/hooks/usePortfolio";
import { SubscriptionProvider } from "@/hooks/useSubscription";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SubscriptionProvider>
          <PortfolioProvider>
            <CompareProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/fund/:id" element={<FundDetail />} />
                <Route path="/compare" element={<Compare />} />
                <Route path="/recommend" element={<Recommend />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/manager/:id" element={<ManagerDetail />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/upgrade-success" element={<UpgradeSuccess />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </CompareProvider>
          </PortfolioProvider>
        </SubscriptionProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
