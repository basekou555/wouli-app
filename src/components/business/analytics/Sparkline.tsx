import React from 'react';

interface SparklineProps {
  data: number[];
  className?: string;
  color?: string;
}

const Sparkline: React.FC<SparklineProps> = ({ 
  data, 
  className = 'h-8', 
  color = 'hsl(var(--primary))' 
}) => {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = range === 0 ? 50 : ((max - value) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className={`w-full ${className}`}>
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-80"
        />
        {/* Gradient fill */}
        <defs>
          <linearGradient id={`sparkline-gradient-${Math.random()}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
        </defs>
        <polyline
          points={`0,100 ${points} 100,100`}
          fill={`url(#sparkline-gradient-${Math.random()})`}
          stroke="none"
        />
      </svg>
    </div>
  );
};

export default Sparkline;