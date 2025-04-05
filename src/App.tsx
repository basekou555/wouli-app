
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
<<<<<<< HEAD
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import EventCreate from "./pages/EventCreate";
import EventDetails from "./pages/EventDetails";
import Profile from "./pages/Profile";
import Explore from "./pages/Explore";
import Messages from "./pages/Messages";
=======
import Index from "./pages/Index"; // Changed
import NotFound from "./pages/NotFound"; // Changed
import Dashboard from "./pages/Dashboard"; // Changed
import EventCreate from "./pages/EventCreate"; // Changed
import EventDetails from "./pages/EventDetails"; // Changed
import Profile from "./pages/Profile"; // Changed
import Explore from "./pages/Explore"; // Changed
import Messages from "./pages/Messages"; // Changed
import { AuthProvider, useAuth } from "./context/AuthContext"; // Added
>>>>>>> 59ea0b0 (Add chat and discussion features)

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
<<<<<<< HEAD
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/events/create" element={<EventCreate />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/messages" element={<Messages />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
=======
      <Sonner />    
      <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route
                path="/"
                element={<Index />} // We'll handle auth redirection in the Index component
              />
              <Route
                path="/dashboard"
                element={<ProtectedRoute element={<Dashboard />} />}
              />
              <Route
                path="/events/create"
                element={<ProtectedRoute element={<EventCreate />} />}
              />
              <Route
                path="/events/:id"
                element={<ProtectedRoute element={<EventDetails />} />}
              />
              <Route
                path="/profile"
                element={<ProtectedRoute element={<Profile />} />}
              />
              <Route
                path="/explore"
                element={<ProtectedRoute element={<Explore />} />}
              />
              <Route
                path="/messages"
                element={<ProtectedRoute element={<Messages />} />}
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
>>>>>>> 59ea0b0 (Add chat and discussion features)
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

const ProtectedRoute: React.FC<{ element: React.ReactNode }> = ({ element }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Basic loading indicator
  }

  return user ? <>{element}</> : <Navigate to="/" />; // Redirect to home if not authenticated
};
