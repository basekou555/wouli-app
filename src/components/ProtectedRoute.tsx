import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireBusiness?: boolean;
  requireUser?: boolean;
}

const ProtectedRoute = ({ children, requireBusiness = false, requireUser = false }: ProtectedRouteProps) => {
  const { user, userType, loading, isBusinessUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;

    // If not authenticated at all, redirect to auth
    if (!user) {
      navigate('/auth', { 
        state: { from: location.pathname },
        replace: true 
      });
      return;
    }

    // If business route required but user is not business AND not admin
    if (requireBusiness && !isBusinessUser && userType !== 'admin') {
      navigate('/business/signup', { 
        state: { 
          message: 'Vous devez créer un compte établissement pour accéder à cette page.',
          type: 'info'
        },
        replace: true 
      });
      return;
    }

    // If user route required but user is business
    if (requireUser && isBusinessUser) {
      navigate('/business', { replace: true });
      return;
    }
  }, [user, userType, loading, requireBusiness, requireUser, navigate, location.pathname, isBusinessUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" text="Vérification des autorisations..." />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  if (requireBusiness && !isBusinessUser && userType !== 'admin') {
    return null; // Will redirect via useEffect
  }

  if (requireUser && isBusinessUser) {
    return null; // Will redirect via useEffect
  }

  return <>{children}</>;
};

export default ProtectedRoute;