import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import UserHistory from './pages/UserHistory';
import AppLayout from './components/AppLayout';
import EventDetailsPage from './pages/EventDetailsPage';
import BusinessProfilePage from './pages/BusinessProfilePage';
import BusinessEventsPage from './pages/BusinessEventsPage';
import ProfileSettings from './pages/ProfileSettings';
import Explore from './pages/Explore';
import CreateEvent from './pages/CreateEvent';
import { Toaster } from "@/components/ui/toaster"
import { QueryClient } from '@tanstack/react-query';
import Wouli from './pages/Wouli';
import ErrorBoundary from './components/ErrorBoundary';
import Friends from './pages/Friends';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/auth" />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <QueryClient>
        <div className="min-h-screen bg-background">
          <Toaster />
          <ErrorBoundary>
            <BrowserRouter>
              <Routes>
                {/* Routes d'authentification */}
                <Route path="/auth" element={<Auth />} />

                {/* Routes publiques */}
                <Route path="/" element={<Navigate to="/app" />} />
                <Route path="/app" element={<ProtectedRoute><Wouli /></ProtectedRoute>} />
                <Route path="/event/:eventId" element={<ProtectedRoute><EventDetailsPage /></ProtectedRoute>} />
                <Route path="/business/:businessId" element={<ProtectedRoute><BusinessProfilePage /></ProtectedRoute>} />
                <Route path="/business/:businessId/events" element={<ProtectedRoute><BusinessEventsPage /></ProtectedRoute>} />
                <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
                <Route path="/create" element={<ProtectedRoute><CreateEvent /></ProtectedRoute>} />
                <Route path="/profile-settings" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
                <Route path="/history" element={<ProtectedRoute><UserHistory /></ProtectedRoute>} />
                
                {/* Routes utilisateur protégées */}
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                
                <Route path="/friends" element={
                  <ProtectedRoute>
                    <Friends />
                  </ProtectedRoute>
                } />
                
                {/* Route par défaut - redirige vers /app si authentifié, sinon vers /auth */}
                <Route path="*" element={<ProtectedRoute><Wouli /></ProtectedRoute>} />
              </Routes>
            </BrowserRouter>
          </ErrorBoundary>
        </div>
      </QueryClient>
    </AuthProvider>
  );
}

export default App;
