
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, Compass, Home, PlusCircle, User } from 'lucide-react';

const AppNavbar = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: 'Accueil', path: '/dashboard', icon: Home },
    { name: 'Explorer', path: '/explore', icon: Compass },
    { name: 'Créer', path: '/events/create', icon: PlusCircle },
    { name: 'Mes Events', path: '/profile', icon: Calendar },
    { name: 'Profil', path: '/profile', icon: User },
  ];

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 md:hidden bg-white shadow-sm px-4 py-3 flex justify-between items-center">
        <Link to="/dashboard" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-wouli-blue">Wouli</span>
        </Link>
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 text-wouli-gray-800"
        >
          <div className="w-6 flex flex-col items-end space-y-1.5">
            <span className={`block h-0.5 bg-wouli-gray-800 transition-all duration-300 ${isMenuOpen ? 'w-6 translate-y-2 rotate-45' : 'w-6'}`}></span>
            <span className={`block h-0.5 bg-wouli-gray-800 transition-all duration-300 ${isMenuOpen ? 'opacity-0' : 'w-4'}`}></span>
            <span className={`block h-0.5 bg-wouli-gray-800 transition-all duration-300 ${isMenuOpen ? 'w-6 -translate-y-2 -rotate-45' : 'w-6'}`}></span>
          </div>
        </button>
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
              <item.icon className="h-6 w-6 text-wouli-blue" />
              <span className="text-lg font-medium">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 bg-white border-r border-gray-200 shadow-sm">
        <div className="p-6">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-wouli-blue">Wouli</span>
          </Link>
        </div>
        <nav className="flex-1 pt-5">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center space-x-4 py-3 px-6 transition-colors ${
                location.pathname === item.path 
                  ? 'text-wouli-blue font-medium bg-blue-50'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <item.icon className={`h-5 w-5 ${location.pathname === item.path ? 'text-wouli-blue' : 'text-gray-500'}`} />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
        <div className="p-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">© 2024 Wouli</p>
        </div>
      </aside>

      {/* Mobile Bottom Navbar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-200 flex justify-around items-center">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex flex-col items-center py-3 ${
              location.pathname === item.path ? 'text-wouli-blue' : 'text-gray-500'
            }`}
          >
            <item.icon className={`h-6 w-6 ${location.pathname === item.path ? 'text-wouli-blue' : 'text-gray-500'}`} />
            <span className="text-xs mt-1">{item.name}</span>
          </Link>
        ))}
      </nav>
    </>
  );
};

export default AppNavbar;
