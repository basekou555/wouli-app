import React from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { BusinessSidebar } from './BusinessSidebar';
import { BusinessAnalyticsProvider } from '@/contexts/BusinessAnalyticsContext';
import { useBusinessConfig } from '@/hooks/useBusinessConfig';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface BusinessLayoutProps {
  children: React.ReactNode;
}

export function BusinessLayout({ children }: BusinessLayoutProps) {
  const { config, loading, error } = useBusinessConfig();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" text="Chargement du tableau de bord..." />
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <ErrorMessage 
          message="Impossible de charger la configuration" 
          variant="destructive"
        />
      </div>
    );
  }

  return (
    <BusinessAnalyticsProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <BusinessSidebar />
          
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <header className="h-14 border-b border-border bg-card flex items-center px-4">
              <SidebarTrigger className="mr-4" />
              <div className="flex-1">
                <h1 className="font-semibold text-lg text-foreground">
                  {config.client_name}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {config.client_type} • {config.location}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="ml-4"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-6">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </BusinessAnalyticsProvider>
  );
}