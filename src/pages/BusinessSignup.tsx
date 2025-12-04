import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Mail, Lock, MapPin, ChevronRight, ChevronLeft, Instagram, CheckCircle2, Loader2, Building2, ArrowLeft, Sparkles, PartyPopper, User } from 'lucide-react';
import EstablishmentTypeSelector from '@/components/business/EstablishmentTypeSelector';
import { ESTABLISHMENT_TYPES, LYON_CITIES } from '@/data/establishmentTypes';
import { supabase } from '@/integrations/supabase/client';
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
      className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-xl"
      animate={{ 
        y: [0, -5, 0],
      }}
      transition={{ 
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    >
      <span className="text-3xl font-black text-white" style={{ fontFamily: 'system-ui' }}>W</span>
    </motion.div>
  </motion.div>
);

// Step indicator component
const StepIndicator = ({ currentStep }: { currentStep: number }) => (
  <div className="flex items-center justify-center gap-3 mb-6">
    <div className="flex items-center gap-2">
      <motion.div 
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
          currentStep >= 1 
            ? 'bg-white text-orange-500' 
            : 'bg-white/20 text-white/60'
        }`}
        animate={currentStep === 1 ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.5 }}
      >
        <Building2 className="w-5 h-5" />
      </motion.div>
      <span className={`text-sm font-medium ${currentStep >= 1 ? 'text-white' : 'text-white/60'}`}>
        Établissement
      </span>
    </div>
    
    <div className={`w-12 h-0.5 ${currentStep >= 2 ? 'bg-white' : 'bg-white/30'}`} />
    
    <div className="flex items-center gap-2">
      <motion.div 
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
          currentStep >= 2 
            ? 'bg-white text-purple-500' 
            : 'bg-white/20 text-white/60'
        }`}
        animate={currentStep === 2 ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.5 }}
      >
        <Lock className="w-5 h-5" />
      </motion.div>
      <span className={`text-sm font-medium ${currentStep >= 2 ? 'text-white' : 'text-white/60'}`}>
        Compte
      </span>
    </div>
  </div>
);

const BusinessSignup = () => {
  const navigate = useNavigate();
  const { businessSignUp, loading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    establishmentName: '',
    establishmentType: '',
    location: '',
    instagramHandle: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [instagramStatus, setInstagramStatus] = useState<'idle' | 'checking' | 'found' | 'not_found'>('idle');
  const [eventsCount, setEventsCount] = useState(0);

  // Debounced Instagram validation
  useEffect(() => {
    const handle = formData.instagramHandle.replace('@', '').trim().toLowerCase();
    
    if (!handle || handle.length < 3) {
      setInstagramStatus('idle');
      setEventsCount(0);
      return;
    }

    setInstagramStatus('checking');
    
    const timer = setTimeout(async () => {
      try {
        const { count, error } = await supabase
          .from('events')
          .select('id', { count: 'exact', head: true })
          .eq('venue_instagram', handle);

        if (error) throw error;

        if (count && count > 0) {
          setInstagramStatus('found');
          setEventsCount(count);
        } else {
          setInstagramStatus('not_found');
          setEventsCount(0);
        }
      } catch (err) {
        console.error('Instagram check error:', err);
        setInstagramStatus('not_found');
        setEventsCount(0);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.instagramHandle]);

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.establishmentName) {
      newErrors.establishmentName = 'Nom de l\'établissement requis';
    } else if (formData.establishmentName.trim().length < 3) {
      newErrors.establishmentName = 'Le nom doit contenir au moins 3 caractères';
    } else if (formData.establishmentName.trim().length > 30) {
      newErrors.establishmentName = 'Le nom ne doit pas dépasser 30 caractères';
    }

    if (!formData.establishmentType) {
      newErrors.establishmentType = 'Type d\'établissement requis';
    }

    if (!formData.location) {
      newErrors.location = 'Ville requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateValidUsername = (name: string): string => {
    let username = name.toLowerCase().trim().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    if (username.length < 3) {
      username = username.padEnd(3, '_');
    }
    return username.substring(0, 30);
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    if (!formData.password) {
      newErrors.password = 'Mot de passe requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Minimum 6 caractères';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep2()) return;

    setIsSubmitting(true);
    try {
      const { error } = await businessSignUp(formData.email, formData.password, {
        username: generateValidUsername(formData.establishmentName),
        clientName: formData.establishmentName.trim(),
        clientType: formData.establishmentType,
        location: formData.location,
        brandColor: '#FF7A1F',
        instagramHandle: formData.instagramHandle.replace('@', '').trim() || undefined
      });

      if (!error) {
        navigate('/auth', { 
          state: { 
            message: 'Inscription réussie ! Vérifiez votre email pour confirmer votre compte.',
            type: 'success'
          }
        });
      }
    } catch (error) {
      console.error('Erreur inscription business:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const renderStep1 = () => (
    <motion.div 
      className="space-y-5"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Establishment Name */}
      <div className="space-y-2">
        <Label htmlFor="establishmentName" className="flex items-center gap-2 text-foreground font-medium">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
            <Building2 className="w-3.5 h-3.5 text-white" />
          </div>
          Nom de votre établissement
        </Label>
        <Input
          id="establishmentName"
          type="text"
          placeholder="Mon Restaurant Lyon"
          value={formData.establishmentName}
          onChange={(e) => handleInputChange('establishmentName', e.target.value)}
          className={`h-12 bg-white/80 border-white/50 focus:border-orange-400 focus:ring-orange-400/20 ${errors.establishmentName ? 'border-destructive' : ''}`}
          maxLength={30}
        />
        <div className="flex justify-between items-center">
          {errors.establishmentName ? (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.establishmentName}
            </p>
          ) : (
            <span />
          )}
          <span className={`text-xs ${formData.establishmentName.length > 25 ? 'text-destructive' : 'text-muted-foreground'}`}>
            {formData.establishmentName.length}/30
          </span>
        </div>
      </div>

      {/* Establishment Type */}
      <EstablishmentTypeSelector
        types={ESTABLISHMENT_TYPES}
        value={formData.establishmentType}
        onChange={(value) => handleInputChange('establishmentType', value)}
        error={errors.establishmentType}
      />

      {/* Location */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-foreground font-medium">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
            <MapPin className="w-3.5 h-3.5 text-white" />
          </div>
          Ville
        </Label>
        <Select
          value={formData.location}
          onValueChange={(value) => handleInputChange('location', value)}
        >
          <SelectTrigger className={`h-12 bg-white/80 border-white/50 focus:border-pink-400 ${errors.location ? 'border-destructive' : ''}`}>
            <SelectValue placeholder="Sélectionnez votre ville" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {LYON_CITIES.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.location && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors.location}
          </p>
        )}
      </div>

      {/* Instagram Handle */}
      <div className="space-y-2">
        <Label htmlFor="instagramHandle" className="flex items-center gap-2 text-foreground font-medium">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Instagram className="w-3.5 h-3.5 text-white" />
          </div>
          Compte Instagram
          <span className="text-xs text-muted-foreground font-normal">(optionnel)</span>
        </Label>
        <div className="relative">
          <Input
            id="instagramHandle"
            type="text"
            placeholder="@monestablissement"
            value={formData.instagramHandle}
            onChange={(e) => handleInputChange('instagramHandle', e.target.value)}
            className={`h-12 bg-white/80 border-white/50 pr-10 ${instagramStatus === 'found' ? 'border-green-500 ring-2 ring-green-500/20' : 'focus:border-purple-400'}`}
          />
          {instagramStatus === 'checking' && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-muted-foreground" />
          )}
          {instagramStatus === 'found' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            >
              <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
            </motion.div>
          )}
        </div>
        
        <AnimatePresence mode="wait">
          {instagramStatus === 'found' ? (
            <motion.div
              key="found"
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 p-3"
            >
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 0.5, repeat: 2 }}
                >
                  <PartyPopper className="w-5 h-5 text-green-600" />
                </motion.div>
                <div>
                  <p className="text-sm font-semibold text-green-700">
                    {eventsCount} événement{eventsCount > 1 ? 's' : ''} trouvé{eventsCount > 1 ? 's' : ''} !
                  </p>
                  <p className="text-xs text-green-600">
                    Sera{eventsCount > 1 ? 'ont' : ''} importé{eventsCount > 1 ? 's' : ''} automatiquement à la connexion
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.p 
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-muted-foreground"
            >
              Permet de récupérer automatiquement vos événements déjà référencés sur Wouli
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <motion.div whileTap={{ scale: 0.98 }}>
        <Button
          onClick={handleNextStep}
          className="w-full h-12 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold shadow-lg shadow-orange-500/25"
          type="button"
        >
          Continuer
          <ChevronRight className="ml-2 h-5 w-5" />
        </Button>
      </motion.div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div 
      className="space-y-5"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="flex items-center gap-2 text-foreground font-medium">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
            <Mail className="w-3.5 h-3.5 text-white" />
          </div>
          Email professionnel
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="contact@monestablissement.fr"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className={`h-12 bg-white/80 border-white/50 focus:border-purple-400 focus:ring-purple-400/20 ${errors.email ? 'border-destructive' : ''}`}
        />
        {errors.email && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors.email}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password" className="flex items-center gap-2 text-foreground font-medium">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <Lock className="w-3.5 h-3.5 text-white" />
          </div>
          Mot de passe
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          className={`h-12 bg-white/80 border-white/50 focus:border-indigo-400 focus:ring-indigo-400/20 ${errors.password ? 'border-destructive' : ''}`}
        />
        {errors.password && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors.password}
          </p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="flex items-center gap-2 text-foreground font-medium">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
            <Lock className="w-3.5 h-3.5 text-white" />
          </div>
          Confirmer le mot de passe
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
          className={`h-12 bg-white/80 border-white/50 focus:border-violet-400 focus:ring-violet-400/20 ${errors.confirmPassword ? 'border-destructive' : ''}`}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors.confirmPassword}
          </p>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <motion.div whileTap={{ scale: 0.98 }} className="flex-1">
          <Button 
            onClick={handlePrevStep}
            variant="outline"
            className="w-full h-12 bg-white/80 border-white/50 hover:bg-white"
            type="button"
          >
            <ChevronLeft className="mr-2 h-5 w-5" />
            Retour
          </Button>
        </motion.div>
        <motion.div whileTap={{ scale: 0.98 }} className="flex-1">
          <Button 
            type="submit" 
            className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg shadow-purple-500/25" 
            disabled={loading || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Création...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Créer mon compte
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );

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
        background: 'linear-gradient(135deg, #F97316 0%, #EC4899 50%, #8B5CF6 100%)',
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
        <h1 className="mt-4 text-2xl font-bold text-white">Espace Établissement</h1>
        <p className="text-white/80 text-sm mt-1">Boostez la visibilité de vos événements à Lyon</p>
      </motion.div>

      {/* Step Indicator */}
      <StepIndicator currentStep={currentStep} />

      {/* Main Card */}
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="backdrop-blur-xl bg-white/90 rounded-2xl shadow-2xl border border-white/50 p-6">
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
            </AnimatePresence>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex flex-col gap-2 text-center">
              <p className="text-sm text-muted-foreground">
                <Lock className="inline w-3 h-3 mr-1" />
                Déjà un compte ?{' '}
                <Link to="/auth" className="text-purple-600 hover:text-purple-700 font-medium hover:underline">
                  Se connecter
                </Link>
              </p>
              <p className="text-sm text-muted-foreground">
                <User className="inline w-3 h-3 mr-1" />
                Vous êtes un particulier ?{' '}
                <Link to="/auth" className="text-pink-600 hover:text-pink-700 font-medium hover:underline">
                  Inscription utilisateur
                </Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BusinessSignup;
