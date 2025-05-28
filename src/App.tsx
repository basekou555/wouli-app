
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

import Home from "./pages/Home";
import UserApp from "./pages/UserApp";
import BusinessDashboard from "./pages/BusinessDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/app" element={<UserApp />} />
        <Route path="/business" element={<BusinessDashboard />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
