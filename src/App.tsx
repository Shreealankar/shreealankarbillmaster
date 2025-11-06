import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { PasswordProtection } from "@/components/PasswordProtection";
import { Layout } from "@/components/Layout";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Billing from "./pages/Billing";
import Customers from "./pages/Customers";
import Bookings from "./pages/Bookings";
import Borrowings from "./pages/Borrowings";
import PriceCalculator from "./pages/PriceCalculator";
import Reports from "./pages/Reports";
import Vendors from "./pages/Vendors";
import Schemes from "./pages/Schemes";
import RepairJobs from "./pages/RepairJobs";
import ActivityLogs from "./pages/ActivityLogs";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <PasswordProtection>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/products" element={<Products />} />
                <Route path="/billing" element={<Billing />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/bookings" element={<Bookings />} />
                <Route path="/borrowings" element={<Borrowings />} />
                <Route path="/price-calculator" element={<PriceCalculator />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/vendors" element={<Vendors />} />
                <Route path="/schemes" element={<Schemes />} />
                <Route path="/repair-jobs" element={<RepairJobs />} />
                <Route path="/activity-logs" element={<ActivityLogs />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </TooltipProvider>
      </PasswordProtection>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
