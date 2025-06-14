
import { useState, useCallback } from 'react';
import { validateForm, ValidationRule, ValidationResult } from '@/utils/validation';

interface UseFormValidationProps {
  initialData: Record<string, any>;
  rules: Record<string, ValidationRule>;
}

export const useFormValidation = ({ initialData, rules }: UseFormValidationProps) => {
  const [data, setData] = useState(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const updateField = useCallback((field: string, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const touchField = useCallback((field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const validate = useCallback((): ValidationResult => {
    const result = validateForm(data, rules);
    setErrors(result.errors);
    return result;
  }, [data, rules]);

  const reset = useCallback(() => {
    setData(initialData);
    setErrors({});
    setTouched({});
  }, [initialData]);

  return {
    data,
    errors,
    touched,
    updateField,
    touchField,
    validate,
    reset,
    isValid: Object.keys(errors).length === 0
  };
};
