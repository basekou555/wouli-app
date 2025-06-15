
import { supabase } from '@/integrations/supabase/client';
import { secureLog } from '@/utils/security';

interface AuthSecurityConfig {
  maxFailedAttempts: number;
  lockoutDuration: number; // en minutes
  passwordMinLength: number;
  requireMFA: boolean;
}

class AuthSecurityService {
  private config: AuthSecurityConfig = {
    maxFailedAttempts: 5,
    lockoutDuration: 15,
    passwordMinLength: 8,
    requireMFA: false
  };

  private failedAttempts = new Map<string, { count: number; lastAttempt: number }>();

  // Vérifier si un utilisateur est verrouillé
  isUserLocked(email: string): boolean {
    const attempts = this.failedAttempts.get(email);
    if (!attempts) return false;

    const lockoutEnd = attempts.lastAttempt + (this.config.lockoutDuration * 60 * 1000);
    const isLocked = attempts.count >= this.config.maxFailedAttempts && Date.now() < lockoutEnd;

    if (isLocked) {
      secureLog('User account locked due to failed attempts', { email, attempts: attempts.count });
    }

    return isLocked;
  }

  // Enregistrer une tentative de connexion échouée
  recordFailedAttempt(email: string): void {
    const now = Date.now();
    const attempts = this.failedAttempts.get(email) || { count: 0, lastAttempt: 0 };

    // Reset du compteur si plus de 15 minutes depuis la dernière tentative
    if (now - attempts.lastAttempt > this.config.lockoutDuration * 60 * 1000) {
      attempts.count = 0;
    }

    attempts.count++;
    attempts.lastAttempt = now;
    this.failedAttempts.set(email, attempts);

    secureLog('Failed login attempt recorded', { 
      email, 
      attemptCount: attempts.count,
      isLocked: this.isUserLocked(email)
    });
  }

  // Reset des tentatives après une connexion réussie
  resetFailedAttempts(email: string): void {
    this.failedAttempts.delete(email);
    secureLog('Failed attempts reset for successful login', { email });
  }

  // Valider la force du mot de passe
  validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < this.config.passwordMinLength) {
      errors.push(`Le mot de passe doit contenir au moins ${this.config.passwordMinLength} caractères`);
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une lettre majuscule');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une lettre minuscule');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un chiffre');
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un caractère spécial');
    }

    // Vérifier contre les mots de passe communs
    const commonPasswords = ['password', '123456', 'admin', 'qwerty', 'azerty'];
    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push('Ce mot de passe est trop commun');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Connexion sécurisée avec vérifications
  async secureSignIn(email: string, password: string): Promise<{ error: any; needsMFA?: boolean }> {
    try {
      // Vérifier si l'utilisateur est verrouillé
      if (this.isUserLocked(email)) {
        return {
          error: {
            message: `Compte temporairement verrouillé. Réessayez dans ${this.config.lockoutDuration} minutes.`
          }
        };
      }

      // Tentative de connexion
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        this.recordFailedAttempt(email);
        secureLog('Login attempt failed', { email, error: error.message });
        return { error };
      }

      // Connexion réussie
      this.resetFailedAttempts(email);
      secureLog('Login successful', { email, userId: data.user?.id });

      return { error: null };

    } catch (error) {
      secureLog('Unexpected error during login', { email, error });
      return { error };
    }
  }

  // Inscription sécurisée avec validation
  async secureSignUp(email: string, password: string, username: string): Promise<{ error: any }> {
    try {
      // Valider la force du mot de passe
      const passwordValidation = this.validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        return {
          error: {
            message: passwordValidation.errors.join('\n')
          }
        };
      }

      // Configuration de redirection sécurisée
      const redirectUrl = `${window.location.origin}/`;

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            username
          }
        }
      });

      if (error) {
        secureLog('Signup attempt failed', { email, error: error.message });
        return { error };
      }

      secureLog('Signup successful', { email });
      return { error: null };

    } catch (error) {
      secureLog('Unexpected error during signup', { email, error });
      return { error };
    }
  }
}

export const authSecurityService = new AuthSecurityService();
