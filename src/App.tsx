
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

import Home from "./pages/Home";
import UserApp from "./pages/UserApp";
import Search from "./pages/Search";
import BusinessDashboard from "./pages/BusinessDashboard";
import UserProfile from "./pages/UserProfile";
import UserHistory from "./pages/UserHistory";
import AdminDashboard from "./pages/AdminDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/app" element={<UserApp />} />
        <Route path="/search" element={<Search />} />
        <Route path="/business" element={<BusinessDashboard />} />
        <Route path="/mes-evenements" element={<UserProfile />} />
        <Route path="/historique" element={<UserHistory />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
