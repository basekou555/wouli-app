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
      <CardContent className="space-y-6">
        {/* Visualisation graphique en entonnoir */}
        <div className="flex justify-center">
          <svg width="280" height="200" viewBox="0 0 280 200" className="overflow-visible">
            {stages.map((stage, index) => {
              const stageHeight = 40;
              const y = index * (stageHeight + 10);
              const widthRatio = (stage.value / maxValue);
              const maxWidth = 200;
              const stageWidth = Math.max(maxWidth * widthRatio, 40);
              const x = (280 - stageWidth) / 2;
              
              return (
                <g key={stage.name}>
                  {/* Forme de l'entonnoir */}
                  <rect
                    x={x}
                    y={y}
                    width={stageWidth}
                    height={stageHeight}
                    fill={stage.color || colors[index % colors.length]}
                    rx="4"
                    className="transition-all duration-500 hover:opacity-80"
                    opacity="0.8"
                  />
                  
                  {/* Texte sur la forme */}
                  <text
                    x={140}
                    y={y + stageHeight / 2 + 5}
                    textAnchor="middle"
                    className="text-sm font-medium fill-white"
                    style={{ fontSize: '12px' }}
                  >
                    {stage.value}
                  </text>
                  
                  {/* Label à côté */}
                  <text
                    x={x + stageWidth + 10}
                    y={y + stageHeight / 2 + 5}
                    className="text-xs fill-current text-muted-foreground"
                    style={{ fontSize: '11px' }}
                  >
                    {stage.name}
                  </text>
                  
                  {/* Ligne de connexion vers l'étape suivante */}
                  {index < stages.length - 1 && (
                    <line
                      x1={140}
                      y1={y + stageHeight}
                      x2={140}
                      y2={y + stageHeight + 10}
                      stroke="hsl(var(--muted-foreground))"
                      strokeWidth="2"
                      opacity="0.3"
                    />
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Affichage détaillé en barres */}
        <div className="space-y-3">
          {stages.map((stage, index) => {
            const percentage = maxValue > 0 ? (stage.value / maxValue) * 100 : 0;
            const conversionRate = index > 0 ? ((stage.value / stages[index - 1].value) * 100) : 100;
            
            return (
              <div key={`${stage.name}-detail`} className="space-y-1">
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
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
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
        </div>
      </CardContent>
    </Card>
  );
};

export default FunnelChart;