import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Mail, Lock, MapPin, ChevronRight, ChevronLeft } from 'lucide-react';
import EstablishmentTypeSelector from '@/components/business/EstablishmentTypeSelector';
import { ESTABLISHMENT_TYPES, LYON_CITIES } from '@/data/establishmentTypes';

const BusinessSignup = () => {
  const navigate = useNavigate();
  const { businessSignUp, loading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1
    establishmentName: '',
    establishmentType: '',
    location: '',
    // Step 2
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.establishmentName) {
      newErrors.establishmentName = 'Nom de l\'établissement requis';
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
        username: formData.establishmentName.toLowerCase().replace(/\s+/g, '_'),
        clientName: formData.establishmentName,
        clientType: formData.establishmentType,
        location: formData.location,
        brandColor: '#FF7A1F'
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
        />
        {errors.establishmentName && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors.establishmentName}
          </p>
        )}
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