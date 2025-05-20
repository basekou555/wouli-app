
import React, { useState } from "react";
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
  Menu,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";

const AppNavbar = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

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
    <nav className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-30">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 md:h-16">
          <div className="flex items-center">
            {isMobile && (
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="mr-2">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[240px] sm:w-[300px] pt-10">
                  <SheetHeader>
                    <SheetTitle className="text-left mb-4 flex items-center">
                      <Link to="/" className="font-bold text-xl text-purple-600" onClick={() => setOpen(false)}>
                        Wouli
                      </Link>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col space-y-1 mt-4">
                    {navLinks.map((link) => (
                      <SheetClose asChild key={link.href}>
                        <Link
                          to={link.href}
                          className={`flex items-center px-3 py-3 text-sm rounded-md ${
                            location.pathname === link.href
                              ? "bg-purple-50 text-purple-600"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <span className="mr-3">{link.icon}</span>
                          {link.title}
                        </Link>
                      </SheetClose>
                    ))}
                    <div className="pt-4 mt-4 border-t border-gray-100">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          handleLogout();
                          setOpen(false);
                        }}
                        className="w-full"
                      >
                        Déconnexion
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            )}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="font-bold text-xl text-purple-600">
                Wouli
              </Link>
            </div>
            <div className="hidden md:ml-6 md:flex md:space-x-2 lg:space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`inline-flex items-center px-2 lg:px-3 py-2 text-sm font-medium rounded-md ${
                    location.pathname === link.href
                      ? "text-purple-600 border-b-2 border-purple-500"
                      : "text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300"
                  }`}
                >
                  <span className="mr-1.5 lg:mr-2">{link.icon}</span>
                  {link.title}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden md:flex md:items-center">
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
          {isMobile && (
            <div className="flex items-center">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={user?.photoURL || ""}
                  alt={user?.displayName || ""}
                />
                <AvatarFallback>
                  {user?.displayName?.[0] || user?.email?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>
      </div>

      {/* Mobile bottom menu */}
      <div className="md:hidden border-t border-gray-200 bg-white fixed bottom-0 left-0 right-0 z-30">
        <div className="flex justify-around py-1.5">
          {navLinks.slice(0, 5).map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`inline-flex flex-col items-center px-2 py-1.5 text-[10px] font-medium ${
                location.pathname === link.href
                  ? "text-purple-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="mb-0.5">{link.icon}</span>
              <span>{link.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default AppNavbar;
