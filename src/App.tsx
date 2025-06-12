
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";

import Home from "./pages/Home";
import Auth from "./pages/Auth";
import UserApp from "./pages/UserApp";
import Search from "./pages/Search";
import EventDetails from "./pages/EventDetails";
import BusinessDashboard from "./pages/BusinessDashboard";
import BusinessEventDetails from "./pages/BusinessEventDetails";
import UserProfile from "./pages/UserProfile";
import UserHistory from "./pages/UserHistory";
import AdminDashboard from "./pages/AdminDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/app" element={<UserApp />} />
          <Route path="/search" element={<Search />} />
          <Route path="/event/:id" element={<EventDetails />} />
          <Route path="/business" element={<BusinessDashboard />} />
          <Route path="/business/event/:id" element={<BusinessEventDetails />} />
          <Route path="/profil" element={<UserProfile />} />
          <Route path="/historique" element={<UserHistory />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
