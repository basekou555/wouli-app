
import React from 'react';
import { Button } from "@/components/ui/button";

interface SubmitSectionProps {
  loading: boolean;
}

const SubmitSection = ({ loading }: SubmitSectionProps) => {
  return (
    <div className="pt-6">
      <Button 
        type="submit" 
        className="w-full" 
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="mr-2">Création en cours...</span>
            <div className="h-4 w-4 border-2 border-current border-r-transparent rounded-full animate-spin"></div>
          </>
        ) : (
          'Créer l\'événement'
        )}
      </Button>
    </div>
  );
};

export default SubmitSection;
