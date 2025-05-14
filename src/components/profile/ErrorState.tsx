
import React from 'react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center h-64 gap-4">
    <div className="text-red-500 font-semibold">{message}</div>
    <Button onClick={onRetry}>Réessayer</Button>
  </div>
);

export default ErrorState;
