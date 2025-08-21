
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Clock, 
  BarChart3, 
  Users, 
  ArrowLeft 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const AdminMenu = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const menuItems = [
    {
      path: '/admin/validation',
      label: 'Validation',
      icon: Clock,
      description: 'Événements en attente'
    },
    {
      path: '/admin',
      label: 'Dashboard',
      icon: BarChart3,
      description: 'Vue d\'ensemble'
    },
    {
      path: '/admin/users',
      label: 'Utilisateurs',
      icon: Users,
      description: 'Gestion des comptes',
      disabled: true
    }
  ];

  return (
    <nav className="bg-card border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Title */}
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">
              Wouli Admin
            </h1>
            <Badge variant="secondary" className="text-xs">
              {profile?.username}
            </Badge>
          </div>

          {/* Menu Items */}
          <div className="flex items-center gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    } ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`
                  }
                  onClick={(e) => item.disabled && e.preventDefault()}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </div>

          {/* Back to App */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'app
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default AdminMenu;
