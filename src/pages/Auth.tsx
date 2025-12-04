import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, ArrowLeft, Building2, Info, Mail, Lock, User, Loader2, Sparkles, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

// Animated background particles
const FloatingParticle = ({ delay, duration, x, size }: { delay: number; duration: number; x: number; size: number }) => (
  <motion.div
    className="absolute rounded-full bg-white/10"
    style={{ width: size, height: size, left: `${x}%` }}
    initial={{ y: '100vh', opacity: 0 }}
    animate={{ 
      y: '-100px',
      opacity: [0, 0.6, 0.6, 0],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: 'linear',
    }}
  />
);

// Animated W Logo
const AnimatedLogo = () => (
  <motion.div 
    className="relative"
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
  >
    <motion.div
      className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-xl"
      animate={{ 
        y: [0, -5, 0],
      }}
      transition={{ 
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    >
      <span className="text-4xl font-black text-white" style={{ fontFamily: 'system-ui' }}>W</span>
    </motion.div>
  </motion.div>
);

const Auth = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ email: '', password: '', username: '' });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const { signIn, signUp, user, userType, isBusinessUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const message = location.state?.message;
  const messageType = location.state?.type;

  useEffect(() => {
    if (user && userType && !authLoading) {
      setTimeout(() => {
        if (isBusinessUser) {
          navigate('/business', { replace: true });
        } else {
          navigate('/app', { replace: true });
        }
      }, 100);
    }
  }, [user, userType, isBusinessUser, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(loginData.email, loginData.password);
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signUp(signupData.email, signupData.password, signupData.username);
    setLoading(false);
  };

  // Generate particles
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    delay: Math.random() * 10,
    duration: 8 + Math.random() * 6,
    x: Math.random() * 100,
    size: 4 + Math.random() * 8,
  }));

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden relative"
      style={{
        background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #F97316 100%)',
      }}
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <FloatingParticle key={p.id} {...p} />
        ))}
      </div>

      {/* Back to home button */}
      <motion.div 
        className="absolute top-4 left-4 z-10"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Link to="/">
          <Button variant="ghost" className="text-white hover:bg-white/20">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Accueil
          </Button>
        </Link>
      </motion.div>

      {/* Logo & Title */}
      <motion.div 
        className="flex flex-col items-center mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <AnimatedLogo />
        <h1 className="mt-4 text-3xl font-bold text-white">Wouli</h1>
        <p className="text-white/80 text-sm mt-1">Découvre les meilleurs événements à Lyon</p>
      </motion.div>

      {/* Message Alert */}
      {message && (
        <motion.div 
          className="w-full max-w-md mb-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Alert className={`backdrop-blur-xl border ${messageType === 'success' ? 'border-green-400/50 bg-green-500/20 text-white' : 'border-blue-400/50 bg-blue-500/20 text-white'}`}>
            <Info className="h-4 w-4" />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Main Card */}
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="backdrop-blur-xl bg-white/90 rounded-2xl shadow-2xl border border-white/50 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-2 h-14 bg-gray-100/80 rounded-none p-0">
              <TabsTrigger 
                value="login" 
                className="h-full rounded-none data-[state=active]:bg-white data-[state=active]:shadow-none font-semibold text-base"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Connexion
              </TabsTrigger>
              <TabsTrigger 
                value="signup"
                className="h-full rounded-none data-[state=active]:bg-white data-[state=active]:shadow-none font-semibold text-base"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Inscription
              </TabsTrigger>
            </TabsList>
            
            <div className="p-6">
              <AnimatePresence mode="wait">
                <TabsContent value="login" className="mt-0">
                  <motion.form 
                    onSubmit={handleLogin} 
                    className="space-y-4"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="flex items-center gap-2 font-medium">
                        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <Mail className="w-3.5 h-3.5 text-white" />
                        </div>
                        Email
                      </Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="ton@email.com"
                        value={loginData.email}
                        onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                        className="h-12 bg-white/80 border-gray-200 focus:border-purple-400 focus:ring-purple-400/20"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="flex items-center gap-2 font-medium">
                        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center">
                          <Lock className="w-3.5 h-3.5 text-white" />
                        </div>
                        Mot de passe
                      </Label>
                      <div className="relative">
                        <Input
                          id="login-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={loginData.password}
                          onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                          className="h-12 bg-white/80 border-gray-200 focus:border-pink-400 focus:ring-pink-400/20 pr-12"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                        </Button>
                      </div>
                    </div>
                    
                    <motion.div whileTap={{ scale: 0.98 }}>
                      <Button 
                        type="submit" 
                        className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg shadow-purple-500/25" 
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Connexion...
                          </>
                        ) : (
                          <>
                            <LogIn className="mr-2 h-5 w-5" />
                            Se connecter
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </motion.form>
                </TabsContent>
                
                <TabsContent value="signup" className="mt-0">
                  <motion.form 
                    onSubmit={handleSignup} 
                    className="space-y-4"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="space-y-2">
                      <Label htmlFor="signup-username" className="flex items-center gap-2 font-medium">
                        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                          <User className="w-3.5 h-3.5 text-white" />
                        </div>
                        Nom d'utilisateur
                      </Label>
                      <Input
                        id="signup-username"
                        type="text"
                        placeholder="ton_pseudo"
                        value={signupData.username}
                        onChange={(e) => setSignupData(prev => ({ ...prev, username: e.target.value }))}
                        className="h-12 bg-white/80 border-gray-200 focus:border-orange-400 focus:ring-orange-400/20"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="flex items-center gap-2 font-medium">
                        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                          <Mail className="w-3.5 h-3.5 text-white" />
                        </div>
                        Email
                      </Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="ton@email.com"
                        value={signupData.email}
                        onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                        className="h-12 bg-white/80 border-gray-200 focus:border-pink-400 focus:ring-pink-400/20"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="flex items-center gap-2 font-medium">
                        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
                          <Lock className="w-3.5 h-3.5 text-white" />
                        </div>
                        Mot de passe
                      </Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={signupData.password}
                          onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                          className="h-12 bg-white/80 border-gray-200 focus:border-purple-400 focus:ring-purple-400/20 pr-12"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">Minimum 6 caractères</p>
                    </div>
                    
                    <motion.div whileTap={{ scale: 0.98 }}>
                      <Button 
                        type="submit" 
                        className="w-full h-12 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold shadow-lg shadow-orange-500/25" 
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Inscription...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-5 w-5" />
                            Créer mon compte
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </motion.form>
                </TabsContent>
              </AnimatePresence>
              
              {/* Separator */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-muted-foreground font-medium">Professionnels</span>
                </div>
              </div>
              
              {/* Business CTA */}
              <motion.div whileTap={{ scale: 0.98 }}>
                <Link to="/business/signup">
                  <Button 
                    variant="outline" 
                    className="w-full h-12 border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50 font-medium"
                  >
                    <Building2 className="h-5 w-5 mr-2 text-purple-600" />
                    <span className="text-purple-700">Créer un compte établissement</span>
                  </Button>
                </Link>
              </motion.div>
              <p className="text-xs text-center text-muted-foreground mt-3">
                Restaurant, bar, club ou organisateur d'événements ?
              </p>
            </div>
          </Tabs>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
