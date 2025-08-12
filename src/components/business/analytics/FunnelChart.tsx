import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FunnelStage {
  name: string;
  value: number;
  color?: string;
}

interface FunnelChartProps {
  stages: FunnelStage[];
  title?: string;
  className?: string;
}

const FunnelChart: React.FC<FunnelChartProps> = ({ 
  stages, 
  title = "Entonnoir de conversion",
  className = '' 
}) => {
  if (!stages || stages.length === 0) return null;

  const maxValue = Math.max(...stages.map(s => s.value));
  const colors = ['hsl(var(--primary))', 'hsl(var(--primary-foreground))', 'hsl(var(--accent))'];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {stages.map((stage, index) => {
          const percentage = maxValue > 0 ? (stage.value / maxValue) * 100 : 0;
          const conversionRate = index > 0 ? ((stage.value / stages[index - 1].value) * 100) : 100;
          
          return (
            <div key={stage.name} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{stage.name}</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{stage.value}</span>
                  {index > 0 && (
                    <span className="text-xs text-muted-foreground">
                      ({conversionRate.toFixed(1)}%)
                    </span>
                  )}
                </div>
              </div>
              <div className="relative">
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ease-out`}
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: stage.color || colors[index % colors.length]
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default FunnelChart;