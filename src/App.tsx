
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import UserApp from "./pages/UserApp";
import Profile from "./pages/Profile";
import EventDetails from "./pages/EventDetails";
import EventPreview from "./pages/EventPreview";
import Explore from "./pages/Explore";
import Search from "./pages/Search";
import UserProfile from "./pages/UserProfile";
import UserHistory from "./pages/UserHistory";
import NotFound from "./pages/NotFound";
import BusinessDashboard from "./pages/BusinessDashboard";
import BusinessEvents from "./pages/BusinessEvents";
import BusinessEventDetails from "./pages/BusinessEventDetails";
import BusinessEventEdit from "./pages/BusinessEventEdit";
import ProfileSettings from "./pages/ProfileSettings";
import UserProfileSettings from "./pages/UserProfileSettings";
import BusinessSignup from "./pages/BusinessSignup";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthRedirect from "./components/AuthRedirect";

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
                <Route path="/auth" element={
                  <AuthRedirect>
                    <Auth />
                  </AuthRedirect>
                } />
                <Route path="/business/signup" element={
                  <AuthRedirect>
                    <BusinessSignup />
                  </AuthRedirect>
                } />
                
                {/* User Routes */}
                <Route path="/app" element={
                  <ProtectedRoute>
                    <UserApp />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/profil" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/event/:id" element={
                  <ProtectedRoute>
                    <EventDetails />
                  </ProtectedRoute>
                } />
                <Route path="/events/:id" element={
                  <ProtectedRoute>
                    <EventPreview />
                  </ProtectedRoute>
                } />
                <Route path="/explore" element={<Navigate to="/search" replace />} />
                <Route path="/search" element={
                  <ProtectedRoute>
                    <Search />
                  </ProtectedRoute>
                } />
                <Route path="/user/:id" element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                } />
                <Route path="/history" element={
                  <ProtectedRoute>
                    <UserHistory />
                  </ProtectedRoute>
                } />
                <Route path="/profile-settings" element={
                  <ProtectedRoute>
                    <ProfileSettings />
                  </ProtectedRoute>
                } />
                <Route path="/user-settings" element={
                  <ProtectedRoute>
                    <UserProfileSettings />
                  </ProtectedRoute>
                } />
                
                {/* Business Routes - Protected */}
                <Route path="/business" element={
                  <ProtectedRoute requireBusiness={true}>
                    <BusinessDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/business/events" element={
                  <ProtectedRoute requireBusiness={true}>
                    <BusinessEvents />
                  </ProtectedRoute>
                } />
                <Route path="/business/analytics" element={
                  <ProtectedRoute requireBusiness={true}>
                    <BusinessDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/business/settings" element={
                  <ProtectedRoute requireBusiness={true}>
                    <BusinessDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/business/event/:id" element={
                  <ProtectedRoute requireBusiness={true}>
                    <BusinessEventDetails />
                  </ProtectedRoute>
                } />
                <Route path="/business/event/:id/edit" element={
                  <ProtectedRoute requireBusiness={true}>
                    <BusinessEventEdit />
                  </ProtectedRoute>
                } />
                
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
