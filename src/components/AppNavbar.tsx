
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  MessageSquare,
  Search,
  User,
  Home,
  Edit,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

const AppNavbar = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });
    } catch (error) {
      console.log(error);
    }
  };

  const navLinks = [
    {
      title: "Accueil",
      href: "/dashboard",
      icon: <Home className="w-5 h-5" />,
    },
    {
      title: "Explorer",
      href: "/explore",
      icon: <Search className="w-5 h-5" />,
    },
    {
      title: "Messages",
      href: "/messages",
      icon: <MessageSquare className="w-5 h-5" />,
    },
    {
      title: "Événements",
      href: "/events/create",
      icon: <CalendarIcon className="w-5 h-5" />,
    },
    {
      title: "Profil",
      href: "/profile",
      icon: <User className="w-5 h-5" />,
    },
    {
      title: "Contenu",
      href: "/content",
      icon: <Edit className="w-5 h-5" />,
    },
  ];

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="font-bold text-xl text-purple-600">
                Wouli
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    location.pathname === link.href
                      ? "text-purple-600 border-b-2 border-purple-500"
                      : "text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300"
                  }`}
                >
                  <span className="mr-2">{link.icon}</span>
                  {link.title}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="ml-3 relative flex items-center gap-2">
              <Avatar>
                <AvatarImage
                  src={user?.photoURL || ""}
                  alt={user?.displayName || ""}
                />
                <AvatarFallback>
                  {user?.displayName?.[0] || user?.email?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="text-sm hidden md:block">
                <div className="font-medium text-gray-700 truncate max-w-[120px]">
                  {user?.displayName || user?.email?.split("@")[0] || "Utilisateur"}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="ml-2"
              >
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="sm:hidden border-t border-gray-200 bg-gray-50 fixed bottom-0 left-0 right-0 z-10">
        <div className="flex justify-around py-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`inline-flex flex-col items-center px-3 py-2 text-xs font-medium ${
                location.pathname === link.href
                  ? "text-purple-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="mb-1">{link.icon}</span>
              <span>{link.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default AppNavbar;
