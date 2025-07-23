import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';

interface AuthRedirectProps {
  children: React.ReactNode;
}

const AuthRedirect = ({ children }: AuthRedirectProps) => {
  const { user, userType, loading, isBusinessUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    // If user is authenticated, redirect based on their type
    if (user && userType) {
      if (isBusinessUser) {
        navigate('/business', { replace: true });
      } else {
        navigate('/app', { replace: true });
      }
    }
  }, [user, userType, loading, isBusinessUser, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" text="Vérification de votre profil..." />
      </div>
    );
  }

  // If authenticated, don't show auth pages (will redirect via useEffect)
  if (user && userType) {
    return null;
  }

  return <>{children}</>;
};

export default AuthRedirect;