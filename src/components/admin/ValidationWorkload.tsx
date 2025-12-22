import React from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Clock, CheckCircle, Flame, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkloadCardProps {
  label: string;
  count: number;
  icon: React.ReactNode;
  variant: 'danger' | 'warning' | 'success' | 'info';
  onClick?: () => void;
  isActive?: boolean;
}

const WorkloadCard = ({ label, count, icon, variant, onClick, isActive }: WorkloadCardProps) => {
  const variantStyles = {
    danger: 'bg-red-50 border-red-200 hover:bg-red-100 text-red-700',
    warning: 'bg-orange-50 border-orange-200 hover:bg-orange-100 text-orange-700',
    success: 'bg-green-50 border-green-200 hover:bg-green-100 text-green-700',
    info: 'bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700',
  };

  const countStyles = {
    danger: 'text-red-600',
    warning: 'text-orange-600',
    success: 'text-green-600',
    info: 'text-blue-600',
  };

  return (
    <Card 
      className={cn(
        'p-4 border cursor-pointer transition-all',
        variantStyles[variant],
        isActive && 'ring-2 ring-offset-2',
        isActive && variant === 'danger' && 'ring-red-500',
        isActive && variant === 'warning' && 'ring-orange-500',
        isActive && variant === 'success' && 'ring-green-500',
        isActive && variant === 'info' && 'ring-blue-500'
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <div className={cn('text-2xl font-bold', countStyles[variant])}>
            {count}
          </div>
          <div className="text-sm font-medium truncate">
            {label}
          </div>
        </div>
      </div>
    </Card>
  );
};

interface ValidationWorkloadProps {
  stats: {
    manualReviewEvents: number;
    scraperErrorsCount: number;
    pendingEvents: number;
    activeEvents: number;
    rejectedEvents: number;
  } | undefined;
  isLoading: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
  todayValidated?: number;
}

export const ValidationWorkload = ({
  stats,
  isLoading,
  activeTab,
  onTabChange,
  todayValidated = 0
}: ValidationWorkloadProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    );
  }

  const urgentCount = (stats?.manualReviewEvents || 0) + (stats?.scraperErrorsCount || 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <WorkloadCard
        label="Urgents"
        count={urgentCount}
        icon={<Flame className="w-6 h-6 text-red-500" />}
        variant="danger"
        onClick={() => onTabChange('urgent')}
        isActive={activeTab === 'urgent'}
      />
      <WorkloadCard
        label="À valider"
        count={stats?.pendingEvents || 0}
        icon={<Clock className="w-6 h-6 text-orange-500" />}
        variant="warning"
        onClick={() => onTabChange('pending')}
        isActive={activeTab === 'pending'}
      />
      <WorkloadCard
        label="Actifs"
        count={stats?.activeEvents || 0}
        icon={<CheckCircle className="w-6 h-6 text-green-500" />}
        variant="success"
        onClick={() => onTabChange('history')}
        isActive={activeTab === 'history'}
      />
      <WorkloadCard
        label="Aujourd'hui"
        count={todayValidated}
        icon={<TrendingUp className="w-6 h-6 text-blue-500" />}
        variant="info"
      />
    </div>
  );
};

export default ValidationWorkload;
