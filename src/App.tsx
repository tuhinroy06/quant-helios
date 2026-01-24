import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Learn from "./pages/Learn";
import Pricing from "./pages/Pricing";
import NotFound from "./pages/NotFound";

// Dashboard Pages
import Onboarding from "./pages/dashboard/Onboarding";
import Overview from "./pages/dashboard/Overview";
import Strategies from "./pages/dashboard/Strategies";
import StrategyCreate from "./pages/dashboard/StrategyCreate";
import StrategyReview from "./pages/dashboard/StrategyReview";
import Backtest from "./pages/dashboard/Backtest";
import ResultsExplanation from "./pages/dashboard/ResultsExplanation";
import PaperTrading from "./pages/dashboard/PaperTrading";
import FNOSimulator from "./pages/dashboard/FNOSimulator";
import Settings from "./pages/dashboard/Settings";
import LearnDashboard from "./pages/dashboard/LearnDashboard";
import StockRanking from "./pages/dashboard/StockRanking";
import LiveTrading from "./pages/dashboard/LiveTrading";
import Organization from "./pages/dashboard/Organization";
import TradeJournal from "./pages/dashboard/TradeJournal";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/pricing" element={<Pricing />} />

            {/* Protected Dashboard Routes */}
            <Route
              path="/dashboard/onboarding"
              element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/overview"
              element={
                <ProtectedRoute>
                  <Overview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Overview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/strategies"
              element={
                <ProtectedRoute>
                  <Strategies />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/strategies/create"
              element={
                <ProtectedRoute>
                  <StrategyCreate />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/strategies/:id/review"
              element={
                <ProtectedRoute>
                  <StrategyReview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/backtest/:id"
              element={
                <ProtectedRoute>
                  <Backtest />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/results/:id"
              element={
                <ProtectedRoute>
                  <ResultsExplanation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/paper-trading"
              element={
                <ProtectedRoute>
                  <PaperTrading />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/fno"
              element={
                <ProtectedRoute>
                  <FNOSimulator />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/stock-ranking"
              element={
                <ProtectedRoute>
                  <StockRanking />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/live-trading"
              element={
                <ProtectedRoute>
                  <LiveTrading />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/organization"
              element={
                <ProtectedRoute>
                  <Organization />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/journal"
              element={
                <ProtectedRoute>
                  <TradeJournal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/learn"
              element={
                <ProtectedRoute>
                  <LearnDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
