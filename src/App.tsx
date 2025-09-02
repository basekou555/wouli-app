
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Auth from './pages/Auth';
import Profile from './pages/Profile';

import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ErrorBoundary from './components/ErrorBoundary';
import Friends from './pages/Friends';
import Explore from './pages/Explore';
// Replaced missing CreateEvent page with existing EventCreation component
import EventCreation from './components/EventCreation';
import EventDetails from './pages/EventDetails';
import BusinessEvents from './pages/BusinessEvents';
import BusinessDashboard from './pages/BusinessDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import UserApp from './pages/UserApp';

const queryClient = new QueryClient();

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-background">
          <Toaster />
          <ErrorBoundary>
            <BrowserRouter>
              <Routes>
                {/* Routes d'authentification */}
                <Route path="/auth" element={<Auth />} />

                {/* Routes publiques */}
                <Route path="/" element={<Navigate to="/app" replace />} />

                {/* Interface utilisateur */}
                <Route
                  path="/app"
                  element={
                    <ProtectedRoute requireUser>
                      <UserApp />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/event/:eventId"
                  element={
                    <ProtectedRoute requireUser>
                      <EventDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/explore"
                  element={
                    <ProtectedRoute requireUser>
                      <Explore />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/create"
                  element={
                    <ProtectedRoute requireUser>
                      <EventCreation />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile-settings"
                  element={
                    <ProtectedRoute requireUser>
                      {/* Reuse Profile page if specific settings page is not needed */}
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute requireUser>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/friends"
                  element={
                    <ProtectedRoute requireUser>
                      <Friends />
                    </ProtectedRoute>
                  }
                />

                {/* Interface business */}
                <Route
                  path="/business"
                  element={
                    <ProtectedRoute requireBusiness>
                      <BusinessDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/business/events"
                  element={
                    <ProtectedRoute requireBusiness>
                      <BusinessEvents />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/app" replace />} />
              </Routes>
            </BrowserRouter>
          </ErrorBoundary>
        </div>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;

