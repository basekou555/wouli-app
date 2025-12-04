import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Mail, Lock, MapPin, ChevronRight, ChevronLeft, Instagram, CheckCircle2, Loader2 } from 'lucide-react';
import EstablishmentTypeSelector from '@/components/business/EstablishmentTypeSelector';
import { ESTABLISHMENT_TYPES, LYON_CITIES } from '@/data/establishmentTypes';
import { supabase } from '@/integrations/supabase/client';

const BusinessSignup = () => {
  const navigate = useNavigate();
  const { businessSignUp, loading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1
    establishmentName: '',
    establishmentType: '',
    location: '',
    instagramHandle: '',
    // Step 2
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
        // Check if events exist for this Instagram handle
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
    <div className="space-y-6">
      {/* Establishment Name */}
      <div className="space-y-2">
        <Label htmlFor="establishmentName">
          Nom de votre établissement
        </Label>
        <Input
          id="establishmentName"
          type="text"
          placeholder="Mon Restaurant Lyon"
          value={formData.establishmentName}
          onChange={(e) => handleInputChange('establishmentName', e.target.value)}
          className={errors.establishmentName ? 'border-destructive' : ''}
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
        <Label className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Ville
        </Label>
        <Select
          value={formData.location}
          onValueChange={(value) => handleInputChange('location', value)}
        >
          <SelectTrigger className={errors.location ? 'border-destructive' : ''}>
            <SelectValue placeholder="Sélectionnez votre ville" />
          </SelectTrigger>
          <SelectContent>
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
        <Label htmlFor="instagramHandle" className="flex items-center gap-2">
          <Instagram className="w-4 h-4" />
          Compte Instagram
          <span className="text-xs text-muted-foreground">(optionnel)</span>
        </Label>
        <div className="relative">
          <Input
            id="instagramHandle"
            type="text"
            placeholder="@monestablissement"
            value={formData.instagramHandle}
            onChange={(e) => handleInputChange('instagramHandle', e.target.value)}
            className={instagramStatus === 'found' ? 'border-green-500 pr-10' : ''}
          />
          {instagramStatus === 'checking' && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
          )}
          {instagramStatus === 'found' && (
            <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
          )}
        </div>
        {instagramStatus === 'found' ? (
          <p className="text-xs text-green-500 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3 h-3" />
            {eventsCount} événement{eventsCount > 1 ? 's' : ''} trouvé{eventsCount > 1 ? 's' : ''} — sera{eventsCount > 1 ? 'ont' : ''} importé{eventsCount > 1 ? 's' : ''} automatiquement !
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Permet de récupérer automatiquement vos événements déjà référencés sur Wouli
          </p>
        )}
      </div>

      <Button
        onClick={handleNextStep}
        className="w-full"
        type="button"
      >
        Continuer
        <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="flex items-center gap-2">
          <Mail className="w-4 h-4" />
          Email professionnel
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="contact@monestablissement.fr"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className={errors.email ? 'border-destructive' : ''}
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
        <Label htmlFor="password" className="flex items-center gap-2">
          <Lock className="w-4 h-4" />
          Mot de passe
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          className={errors.password ? 'border-destructive' : ''}
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
        <Label htmlFor="confirmPassword" className="flex items-center gap-2">
          <Lock className="w-4 h-4" />
          Confirmer le mot de passe
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
          className={errors.confirmPassword ? 'border-destructive' : ''}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors.confirmPassword}
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <Button 
          onClick={handlePrevStep}
          variant="outline"
          className="flex-1"
          type="button"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <Button 
          type="submit" 
          className="flex-1" 
          disabled={loading || isSubmitting}
        >
          {isSubmitting ? 'Création...' : 'Créer mon compte'}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">
            Créer un compte établissement
          </CardTitle>
          <CardDescription>
            Étape {currentStep} sur 2 - {currentStep === 1 ? 'Informations établissement' : 'Accès au compte'}
          </CardDescription>
          
          {/* Progress bar */}
          <div className="flex gap-2 mt-4">
            <div className={`h-2 flex-1 rounded-full ${currentStep >= 1 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`h-2 flex-1 rounded-full ${currentStep >= 2 ? 'bg-primary' : 'bg-muted'}`} />
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Déjà un compte ?{' '}
              <Link to="/auth" className="text-primary hover:underline">
                Se connecter
              </Link>
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Vous êtes un particulier ?{' '}
              <Link to="/auth" className="text-primary hover:underline">
                Inscription utilisateur
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessSignup;