
import React from 'react';
import { sanitizeHtml } from '@/utils/security';

interface SecureChartProps {
  children?: React.ReactNode;
  data?: any[];
  className?: string;
}

// Composant sécurisé pour les graphiques qui évite dangerouslySetInnerHTML
export const SecureChart: React.FC<SecureChartProps> = ({ 
  children, 
  data = [], 
  className = "" 
}) => {
  // Si nous avons besoin d'afficher du contenu HTML, utilisons une approche sécurisée
  const renderSecureContent = (content: any) => {
    if (typeof content === 'string') {
      // Assainir le contenu HTML au lieu d'utiliser dangerouslySetInnerHTML
      return sanitizeHtml(content);
    }
    return content;
  };

  return (
    <div className={`secure-chart ${className}`}>
      {children}
      {data.map((item, index) => (
        <div key={index} className="chart-item">
          {typeof item === 'object' && item.label && (
            <span className="chart-label">{String(item.label)}</span>
          )}
          {typeof item === 'object' && item.value && (
            <span className="chart-value">{String(item.value)}</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default SecureChart;
