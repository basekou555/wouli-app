
import React from 'react';
import BottomNavigation from './BottomNavigation';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ProposeEventModal from './events/ProposeEventModal';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [isProposeOpen, setIsProposeOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Content area with proper centering */}
      <main className="pb-20 pt-4 px-4">
        <div className="max-w-2xl mx-auto">
          {children}
        </div>
      </main>

      {/* Floating "Proposer" button (above bottom nav) */}
      <div className="fixed right-4 bottom-24 md:right-6 md:bottom-28 z-40">
        <Button size="lg" onClick={() => setIsProposeOpen(true)} className="shadow-lg">
          <Plus className="h-4 w-4" />
          Proposer
        </Button>
      </div>

      {/* Bottom navigation for mobile */}
      <BottomNavigation />

      {/* Propose Event Modal */}
      <ProposeEventModal open={isProposeOpen} onOpenChange={setIsProposeOpen} />
    </div>
  );
};

export default AppLayout;
