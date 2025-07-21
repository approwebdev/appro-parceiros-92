import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Central from "./pages/Central";
import MenuApp from "./pages/MenuApp";
import SalonFinder from "./pages/SalonFinder";
import Auth from "./pages/AuthNew";
import AdminPanel from "./pages/AdminPanel";
import SalonPanel from "./pages/SalonPanelNew";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<SalonFinder />} />
            <Route path="/central" element={<Central />} />
            <Route path="/menu/:slug" element={<MenuApp />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/salon-panel" element={<SalonPanel />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
