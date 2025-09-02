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

    console.debug('ProtectedRoute check:', {
      userId: user?.id,
      userType,
      isBusinessUser,
      requireBusiness,
      requireUser,
      pathname: location.pathname
    });

    // If not authenticated at all, redirect to auth
    if (!user) {
      console.debug('ProtectedRoute: No user, redirecting to auth');
      navigate('/auth', { 
        state: { from: location.pathname },
        replace: true 
      });
      return;
    }

    // Allow all authenticated users access to /app and /explore
    if (location.pathname.startsWith('/app') || location.pathname.startsWith('/explore')) {
      console.debug('ProtectedRoute: Allowing access to /app or /explore for all authenticated users');
      return;
    }

    // If business route required but user is not business AND not admin
    if (requireBusiness && !isBusinessUser && userType !== 'admin') {
      console.debug('ProtectedRoute: Business route required but user is not business/admin, redirecting to signup');
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
      console.debug('ProtectedRoute: User route required but user is business, redirecting to /business');
      navigate('/business', { replace: true });
      return;
    }

    console.debug('ProtectedRoute: Access granted');
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

  if (requireUser && isBusinessUser && !location.pathname.startsWith('/app') && !location.pathname.startsWith('/explore')) {
    return null; // Will redirect via useEffect
  }

  return <>{children}</>;
};

export default ProtectedRoute;