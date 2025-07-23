import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Building, Mail, Lock, MapPin, User, Palette } from 'lucide-react';

const BusinessSignup = () => {
  const navigate = useNavigate();
  const { businessSignUp, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    clientName: '',
    clientType: '',
    location: '',
    brandColor: '#FF7A1F'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const businessTypes = [
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'bar', label: 'Bar / Pub' },
    { value: 'club', label: 'Club de nuit' },
    { value: 'culturel', label: 'Lieu culturel' },
    { value: 'sport', label: 'Salle de sport' },
    { value: 'organisateur', label: 'Organisateur d\'événements' },
    { value: 'autre', label: 'Autre' }
  ];

  const validateForm = () => {
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

    if (!formData.username) {
      newErrors.username = 'Nom d\'utilisateur requis';
    }

    if (!formData.clientName) {
      newErrors.clientName = 'Nom de l\'établissement requis';
    }

    if (!formData.clientType) {
      newErrors.clientType = 'Type d\'établissement requis';
    }

    if (!formData.location) {
      newErrors.location = 'Localisation requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const { error } = await businessSignUp(formData.email, formData.password, {
        username: formData.username,
        clientName: formData.clientName,
        clientType: formData.clientType,
        location: formData.location,
        brandColor: formData.brandColor
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">
            Créer un compte établissement
          </CardTitle>
          <CardDescription>
            Rejoignez Wouli et connectez-vous avec vos clients Lyon
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Nom d'utilisateur
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="mon_etablissement_lyon"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className={errors.username ? 'border-destructive' : ''}
              />
              {errors.username && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.username}
                </p>
              )}
            </div>

            {/* Business Name */}
            <div className="space-y-2">
              <Label htmlFor="clientName" className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                Nom de l'établissement
              </Label>
              <Input
                id="clientName"
                type="text"
                placeholder="Mon Restaurant Lyon"
                value={formData.clientName}
                onChange={(e) => handleInputChange('clientName', e.target.value)}
                className={errors.clientName ? 'border-destructive' : ''}
              />
              {errors.clientName && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.clientName}
                </p>
              )}
            </div>

            {/* Business Type */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                Type d'établissement
              </Label>
              <Select
                value={formData.clientType}
                onValueChange={(value) => handleInputChange('clientType', value)}
              >
                <SelectTrigger className={errors.clientType ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Sélectionnez votre type d'établissement" />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.clientType && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.clientType}
                </p>
              )}
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Adresse complète
              </Label>
              <Input
                id="location"
                type="text"
                placeholder="123 Rue de la République, 69002 Lyon"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className={errors.location ? 'border-destructive' : ''}
              />
              {errors.location && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.location}
                </p>
              )}
            </div>

            {/* Brand Color */}
            <div className="space-y-2">
              <Label htmlFor="brandColor" className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Couleur de marque (optionnel)
              </Label>
              <div className="flex gap-2">
                <Input
                  id="brandColor"
                  type="color"
                  value={formData.brandColor}
                  onChange={(e) => handleInputChange('brandColor', e.target.value)}
                  className="w-16 h-10 p-1 border"
                />
                <Input
                  type="text"
                  value={formData.brandColor}
                  onChange={(e) => handleInputChange('brandColor', e.target.value)}
                  placeholder="#FF7A1F"
                  className="flex-1"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || isSubmitting}
            >
              {isSubmitting ? 'Création du compte...' : 'Créer mon compte établissement'}
            </Button>
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