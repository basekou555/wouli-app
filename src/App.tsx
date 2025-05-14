
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from '@/components/ui/theme-provider';

import { AuthProvider } from './context/AuthContext';

// Pages
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import QuickEvent from './pages/QuickEvent';
import EventCreate from './pages/EventCreate';
import EventDetails from './pages/EventDetails';
import Explore from './pages/Explore';
import Profile from './pages/Profile';
import CreateProfile from './pages/CreateProfile';
import Messages from './pages/Messages';
import ContentCreation from './pages/ContentCreation';
import NotFound from './pages/NotFound';
import Admin from './pages/Admin';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="wouli-theme">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/events/create" element={<EventCreate />} />
              <Route path="/events/quick" element={<QuickEvent />} />
              <Route path="/events/:id" element={<EventDetails />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/profile/:id?" element={<Profile />} />
              <Route path="/create-profile" element={<CreateProfile />} />
              <Route path="/messages/:chatId?" element={<Messages />} />
              <Route path="/content" element={<ContentCreation />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </Router>
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
