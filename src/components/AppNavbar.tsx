
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, Compass, Home, PlusCircle, User, Search, Heart, MessageSquare } from 'lucide-react';

const AppNavbar = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: 'Accueil', path: '/dashboard', icon: Home },
    { name: 'Explorer', path: '/explore', icon: Compass },
    { name: 'Créer', path: '/events/create', icon: PlusCircle },
    { name: 'Activités', path: '/notifications', icon: Heart },
    { name: 'Messages', path: '/messages', icon: MessageSquare },
    { name: 'Profil', path: '/profile', icon: User },
  ];

  return (
    <>
      {/* Mobile Top Bar - Instagram Style */}
      <div className="fixed top-0 left-0 right-0 z-50 md:hidden bg-white shadow-sm px-4 py-3 flex justify-between items-center border-b border-gray-200">
        <Link to="/dashboard" className="flex items-center space-x-2">
          <span className="text-xl font-semibold text-gradient">Wouli</span>
        </Link>
        <div className="flex items-center space-x-4">
          <button className="text-gray-800">
            <Search className="h-5 w-5" />
          </button>
          <button className="text-gray-800 relative">
            <Heart className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-instagram-pink text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">3</span>
          </button>
          <button className="text-gray-800 relative">
            <MessageSquare className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-instagram-pink text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">2</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-40 bg-white transition-transform duration-300 ease-in-out md:hidden ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="pt-16 px-6">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className="flex items-center space-x-4 py-4 border-b border-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              <item.icon className="h-6 w-6 text-instagram-purple" />
              <span className="text-lg font-medium">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Desktop Sidebar - Instagram Style */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 bg-white border-r border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gradient">Wouli</span>
          </Link>
        </div>
        <nav className="flex-1 pt-5 px-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center space-x-4 py-3 px-4 rounded-xl mb-1 transition-colors ${
                location.pathname === item.path 
                  ? 'bg-purple-50 text-purple-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <item.icon className={`h-6 w-6 ${location.pathname === item.path ? 'text-purple-700' : 'text-gray-500'}`} />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-purple-600 via-pink-500 to-orange-400 p-0.5">
              <div className="h-full w-full rounded-full bg-white p-0.5">
                <div className="h-full w-full rounded-full bg-gray-200 overflow-hidden">
                  <img src="https://picsum.photos/200?random=profile" alt="Profile" className="h-full w-full object-cover" />
                </div>
              </div>
            </div>
            <div>
              <p className="font-medium text-sm">Marie Dupont</p>
              <p className="text-xs text-gray-500">@mariedupont</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navbar - Instagram Style */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-200 flex justify-around items-center">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex flex-col items-center py-3 ${
              location.pathname === item.path ? 'text-instagram-purple' : 'text-gray-500'
            }`}
          >
            <item.icon className={`h-6 w-6 ${location.pathname === item.path ? 'text-instagram-purple' : 'text-gray-500'}`} />
            <span className="text-xs mt-1">{item.name}</span>
          </Link>
        ))}
      </nav>
    </>
  );
};

export default AppNavbar;
