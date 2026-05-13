import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Home, Search, User, Calendar, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
const AppNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const {
    user
  } = useAuth();
  const navigation = [{
    name: 'Accueil',
    href: '/app',
    icon: Home
  }, {
    name: 'Explorer',
    href: '/explore',
    icon: Search
  }, {
    name: 'Profil',
    href: '/profil',
    icon: User
  }, {
    name: 'Historique',
    href: '/historique',
    icon: Calendar
  }];
  const isActive = (path: string) => location.pathname === path;
  return <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/app" className="text-xl font-bold text-primary">
            Wouli
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isMenuOpen && <div className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setIsMenuOpen(false)} />}

      {/* Sidebar navigation */}
      
    </>;
};
export default AppNavbar;