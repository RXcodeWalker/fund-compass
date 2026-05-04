import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "./pages/Landing.tsx";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import FundDetail from "./pages/FundDetail.tsx";
import Compare from "./pages/Compare.tsx";
import Recommend from "./pages/Recommend.tsx";
import Portfolio from "./pages/Portfolio.tsx";
import ManagerDetail from "./pages/ManagerDetail.tsx";
import Pricing from "./pages/Pricing.tsx";
import UpgradeSuccess from "./pages/UpgradeSuccess.tsx";
import Analytics from "./pages/Analytics.tsx";
import ScenarioSimulator from "./pages/ScenarioSimulator.tsx";
import { CompareProvider } from "@/hooks/useCompare";
import { PortfolioProvider } from "@/hooks/usePortfolio";
import { SubscriptionProvider } from "@/hooks/useSubscription";
import { GrowthProvider } from "@/hooks/useGrowth";
import { FeedbackProvider } from "@/hooks/useFeedback";
import { ScenariosProvider } from "@/hooks/useScenarios";
import { FeedbackWidget } from "@/components/funds/FeedbackWidget";

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
              <GrowthProvider>
                <FeedbackProvider>
                  <ScenariosProvider>
                    <Routes>
                      <Route path="/" element={<Landing />} />
                      <Route path="/funds" element={<Index />} />
                      <Route path="/fund/:id" element={<FundDetail />} />
                      <Route path="/compare" element={<Compare />} />
                      <Route path="/compare/:ids" element={<Compare />} />
                      <Route path="/recommend" element={<Recommend />} />
                      <Route path="/portfolio" element={<Portfolio />} />
                      <Route path="/manager/:id" element={<ManagerDetail />} />
                      <Route path="/pricing" element={<Pricing />} />
                      <Route path="/upgrade-success" element={<UpgradeSuccess />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/scenarios" element={<ScenarioSimulator />} />
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                    <FeedbackWidget />
                  </ScenariosProvider>
                </FeedbackProvider>
              </GrowthProvider>
            </CompareProvider>
          </PortfolioProvider>
        </SubscriptionProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
