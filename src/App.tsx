import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import { RatingModal } from "@/components/rating/RatingModal";
import { useRatingModal } from "@/hooks/useRatingModal";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import UserApp from "./pages/UserApp";
import EventPreview from "./pages/EventPreview";
import Explore from "./pages/Explore";
import UserProfile from "./pages/UserProfile";
import UserHistory from "./pages/UserHistory";
import NotFound from "./pages/NotFound";
import BusinessDashboard from "./pages/BusinessDashboard";
import BusinessEvents from "./pages/BusinessEvents";
import BusinessEventDetails from "./pages/BusinessEventDetails";
import BusinessEventEdit from "./pages/BusinessEventEdit";
import BusinessProfileSettings from "./pages/BusinessProfileSettings";
import UserProfileSettings from "./pages/UserProfileSettings";
import BusinessSignup from "./pages/BusinessSignup";
import Friends from "./pages/Friends";
import UserProfileView from "./pages/UserProfileView";
import AdminDashboard from "./pages/AdminDashboard";
import AdminValidationPage from "./pages/AdminValidationPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthRedirect from "./components/AuthRedirect";
import { AdminRoute } from "./components/AdminRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function AppContent() {
  const { modalState, submitRating, skipRating, canSkip, progress } = useRatingModal();

  return (
    <>
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
                    <UserProfile />
                  </ProtectedRoute>
                } />
                <Route path="/profil" element={<Navigate to="/profile" replace />} />
                <Route path="/event/:id" element={<Navigate to="/events/:id" replace />} />
                <Route path="/events/:id" element={
                  <ProtectedRoute>
                    <EventPreview />
                  </ProtectedRoute>
                } />
                <Route path="/explore" element={
                  <ProtectedRoute>
                    <Explore />
                  </ProtectedRoute>
                } />
                <Route path="/search" element={<Navigate to="/explore" replace />} />
                <Route path="/user/:id" element={
                  <ProtectedRoute>
                    <UserProfileView />
                  </ProtectedRoute>
                } />
                <Route path="/history" element={
                  <ProtectedRoute>
                    <UserHistory />
                  </ProtectedRoute>
                } />
                <Route path="/profile-settings" element={
                  <ProtectedRoute>
                    <BusinessProfileSettings />
                  </ProtectedRoute>
                } />
                <Route path="/user-settings" element={
                  <ProtectedRoute>
                    <UserProfileSettings />
                  </ProtectedRoute>
                } />
                <Route path="/friends" element={
                  <ProtectedRoute>
                    <Friends />
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
                
                {/* Admin Routes */}
                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } />
                <Route path="/admin/validation" element={
                  <AdminRoute>
                    <AdminValidationPage />
                  </AdminRoute>
                } />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            
            <RatingModal
              isOpen={modalState.isOpen}
              event={modalState.event}
              isBlocking={modalState.isBlocking}
              canSkip={canSkip}
              progress={progress}
              onSubmit={submitRating}
              onSkip={skipRating}
            />
          </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppContent />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
