
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const isMobile = useIsMobile();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      await signIn(email, password);
      // On success, redirect is handled by the auth context
    } catch (error: any) {
      setError(error.message || 'Échec de la connexion. Veuillez vérifier vos identifiants.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
      <div className="space-y-1 md:space-y-2">
        <Label htmlFor="signin-email" className="text-white text-sm">Adresse email</Label>
        <div className="relative">
          <Input
            type="email"
            id="signin-email"
            placeholder="email@exemple.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-8 md:pl-10 bg-gray-800/60 border-gray-700 text-white text-sm placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500 h-9 md:h-10"
            required
          />
          <Mail className="absolute left-2.5 md:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 md:h-4 md:w-4 text-gray-400" />
        </div>
      </div>
      
      <div className="space-y-1 md:space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="signin-password" className="text-white text-sm">Mot de passe</Label>
          <a href="#" className="text-[10px] md:text-xs text-purple-400 hover:text-purple-300 hover:underline">
            Mot de passe oublié?
          </a>
        </div>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            id="signin-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-8 md:pl-10 pr-8 md:pr-10 bg-gray-800/60 border-gray-700 text-white text-sm placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500 h-9 md:h-10"
            required
          />
          <Lock className="absolute left-2.5 md:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 md:h-4 md:w-4 text-gray-400" />
          <button 
            type="button" 
            onClick={togglePasswordVisibility}
            className="absolute right-2.5 md:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
          >
            {showPassword ? 
              <EyeOff className="h-3.5 w-3.5 md:h-4 md:w-4" /> : 
              <Eye className="h-3.5 w-3.5 md:h-4 md:w-4" />
            }
          </button>
        </div>
      </div>
      
      {error && (
        <div className="px-3 md:px-4 py-1.5 md:py-2 bg-red-500/20 border border-red-500/50 rounded text-red-200 text-xs md:text-sm">
          {error}
        </div>
      )}
      
      <Button 
        type="submit" 
        className="w-full py-4 md:py-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all text-sm md:text-base"
        disabled={isLoading}
      >
        {isLoading ? 'Connexion en cours...' : 'Se connecter'}
      </Button>
    </form>
  );
};

export default SignIn;
