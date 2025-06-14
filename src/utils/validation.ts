
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  email?: boolean;
  url?: boolean;
  phone?: boolean;
  custom?: (value: any) => string | null;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateField = (value: any, rules: ValidationRule): string | null => {
  if (rules.required && (!value || value.toString().trim() === '')) {
    return 'Ce champ est requis';
  }

  if (!value) return null;

  const stringValue = value.toString();

  if (rules.minLength && stringValue.length < rules.minLength) {
    return `Minimum ${rules.minLength} caractères requis`;
  }

  if (rules.maxLength && stringValue.length > rules.maxLength) {
    return `Maximum ${rules.maxLength} caractères autorisés`;
  }

  if (rules.email && !isValidEmail(stringValue)) {
    return 'Format d\'email invalide';
  }

  if (rules.url && !isValidUrl(stringValue)) {
    return 'Format d\'URL invalide';
  }

  if (rules.phone && !isValidPhone(stringValue)) {
    return 'Format de téléphone invalide';
  }

  if (rules.custom) {
    return rules.custom(value);
  }

  return null;
};

export const validateForm = (
  data: Record<string, any>,
  rules: Record<string, ValidationRule>
): ValidationResult => {
  const errors: Record<string, string> = {};

  Object.entries(rules).forEach(([field, rule]) => {
    const error = validateField(data[field], rule);
    if (error) {
      errors[field] = error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^(\+33|0)[1-9](\d{8})$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};
