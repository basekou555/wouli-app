import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface PerformanceGaugeProps {
  score: number;
  className?: string;
}

const PerformanceGauge: React.FC<PerformanceGaugeProps> = ({ score, className = '' }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 200);
    return () => clearTimeout(timer);
  }, [score]);

  const getScoreColor = (value: number) => {
    if (value >= 80) return 'text-success';
    if (value >= 60) return 'text-primary';
    if (value >= 40) return 'text-accent';
    return 'text-destructive';
  };

  const getScoreGradient = (value: number) => {
    if (value >= 80) return 'from-success to-success/70';
    if (value >= 60) return 'from-primary to-primary/70';
    if (value >= 40) return 'from-accent to-accent/70';
    return 'from-destructive to-destructive/70';
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  return (
    <Card className={`bg-background/20 backdrop-blur-md border-white/20 text-white ${className}`}>
      <CardContent className="p-6 text-center">
        <div className="relative w-24 h-24 mx-auto mb-2">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="6"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--accent))" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {animatedScore}
            </span>
          </div>
        </div>
        <div className="text-sm opacity-75">Score Performance</div>
      </CardContent>
    </Card>
  );
};

export default PerformanceGauge;