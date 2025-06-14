
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import UserApp from "./pages/UserApp";
import Profile from "./pages/Profile";
import EventDetails from "./pages/EventDetails";
import Explore from "./pages/Explore";
import Search from "./pages/Search";
import UserProfile from "./pages/UserProfile";
import UserHistory from "./pages/UserHistory";
import NotFound from "./pages/NotFound";
import BusinessDashboard from "./pages/BusinessDashboard";
import BusinessEventDetails from "./pages/BusinessEventDetails";
import ProfileSettings from "./pages/ProfileSettings";
import UserProfileSettings from "./pages/UserProfileSettings";
import DemoSetup from "./pages/DemoSetup";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/app" element={<UserApp />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profil" element={<Profile />} />
                <Route path="/event/:id" element={<EventDetails />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/search" element={<Search />} />
                <Route path="/user/:id" element={<UserProfile />} />
                <Route path="/history" element={<UserHistory />} />
                <Route path="/business" element={<BusinessDashboard />} />
                <Route path="/business/event/:id" element={<BusinessEventDetails />} />
                <Route path="/profile-settings" element={<ProfileSettings />} />
                <Route path="/user-settings" element={<UserProfileSettings />} />
                <Route path="/demo-setup" element={<DemoSetup />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
