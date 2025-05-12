
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SignIn from '../components/SignIn';
import SignUp from '../components/SignUp';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const isMobile = useIsMobile();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400">
        <div className="text-white text-xl font-semibold animate-pulse">Chargement...</div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" />;
  } else {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f]">
        {/* Hero section with logo and background image */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-30" 
            style={{ 
              backgroundImage: 'url(https://images.unsplash.com/photo-1531058020387-3be344556be6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80)',
              filter: 'blur(3px)'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent" />
        </div>

        <header className="relative z-10 py-4 md:py-6 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl md:text-4xl font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              Wouli
            </h1>
          </div>
        </header>

        <div className="relative z-10 flex-grow flex items-center justify-center px-3 md:px-4">
          <div className="w-full max-w-md">
            <div className="bg-black/70 backdrop-blur-md rounded-lg shadow-2xl overflow-hidden border border-white/10">
              <div className="p-4 sm:p-8">
                <h2 className="text-xl sm:text-3xl font-bold text-white text-center mb-4 md:mb-6">
                  {activeTab === 'signin' ? 'Bienvenue' : 'Rejoignez-nous'}
                </h2>
                
                <div className="flex justify-center mb-6 md:mb-8">
                  <div className="inline-flex bg-gray-800/50 rounded-full p-1">
                    <Button
                      variant="ghost"
                      className={`rounded-full px-4 md:px-6 py-1.5 md:py-2 text-sm transition-all ${
                        activeTab === 'signin'
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : 'text-gray-300 hover:text-white'
                      }`}
                      onClick={() => setActiveTab('signin')}
                    >
                      Connexion
                    </Button>
                    <Button
                      variant="ghost"
                      className={`rounded-full px-4 md:px-6 py-1.5 md:py-2 text-sm transition-all ${
                        activeTab === 'signup'
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : 'text-gray-300 hover:text-white'
                      }`}
                      onClick={() => setActiveTab('signup')}
                    >
                      Inscription
                    </Button>
                  </div>
                </div>
                
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {activeTab === 'signin' ? <SignIn /> : <SignUp />}
                </motion.div>
              </div>
            </div>
            
            <p className="text-center mt-4 md:mt-6 text-gray-300 text-xs md:text-sm">
              Découvrez un nouveau moyen de partager des moments
              <br />
              avec vos amis et votre entourage.
            </p>
          </div>
        </div>
        
        <footer className="relative z-10 py-3 md:py-4 text-center text-gray-400 text-xs">
          <p>&copy; {new Date().getFullYear()} Wouli. Tous droits réservés.</p>
        </footer>
      </div>
    );
  }
};

export default Index;
