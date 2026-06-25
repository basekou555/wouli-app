import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Clock, CheckCircle, Flame, List, Copy, MapPin } from 'lucide-react';
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
  // État inactif : fond teinté clair. État actif : fond plein + texte/icônes en blanc.
  const variantStyles = {
    danger: 'bg-red-50 border-red-200 hover:bg-red-100 text-red-700',
    warning: 'bg-orange-50 border-orange-200 hover:bg-orange-100 text-orange-700',
    success: 'bg-green-50 border-green-200 hover:bg-green-100 text-green-700',
    info: 'bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700',
  };

  const activeStyles = {
    danger: 'bg-red-600 border-red-600 text-white [&_svg]:text-white',
    warning: 'bg-orange-500 border-orange-500 text-white [&_svg]:text-white',
    success: 'bg-green-600 border-green-600 text-white [&_svg]:text-white',
    info: 'bg-blue-600 border-blue-600 text-white [&_svg]:text-white',
  };

  const countStyles = {
    danger: 'text-red-600',
    warning: 'text-orange-600',
    success: 'text-green-600',
    info: 'text-blue-600',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={cn(
        'flex items-center gap-2 rounded-lg border px-3 py-2 transition-all whitespace-nowrap flex-shrink-0 text-left',
        'snap-start', // pour le scroll horizontal mobile
        isActive ? cn(activeStyles[variant], 'shadow-sm') : variantStyles[variant]
      )}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className={cn('text-lg font-bold leading-none', !isActive && countStyles[variant])}>
        {count}
      </span>
      <span className="text-sm font-medium">{label}</span>
    </button>
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
  duplicatesCount?: number;
  venuesCount?: number;
}

export const ValidationWorkload = ({
  stats,
  isLoading,
  activeTab,
  onTabChange,
  duplicatesCount = 0,
  venuesCount = 0
}: ValidationWorkloadProps) => {
  if (isLoading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 lg:grid lg:grid-cols-7 lg:overflow-visible">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <Skeleton key={i} className="h-11 w-28 flex-shrink-0 rounded-lg lg:w-auto" />
        ))}
      </div>
    );
  }

  const urgentCount = (stats?.manualReviewEvents || 0) + (stats?.scraperErrorsCount || 0);
  const totalCount = (stats?.pendingEvents || 0) + (stats?.activeEvents || 0) + (stats?.rejectedEvents || 0) + urgentCount;

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 mb-6 snap-x lg:grid lg:grid-cols-7 lg:overflow-visible">
      <WorkloadCard
        label="Urgents"
        count={urgentCount}
        icon={<Flame className="w-5 h-5 text-red-500" />}
        variant="danger"
        onClick={() => onTabChange('urgent')}
        isActive={activeTab === 'urgent'}
      />
      <WorkloadCard
        label="À valider"
        count={stats?.pendingEvents || 0}
        icon={<Clock className="w-5 h-5 text-orange-500" />}
        variant="warning"
        onClick={() => onTabChange('pending')}
        isActive={activeTab === 'pending'}
      />
      <WorkloadCard
        label="Actifs"
        count={stats?.activeEvents || 0}
        icon={<CheckCircle className="w-5 h-5 text-green-500" />}
        variant="success"
        onClick={() => onTabChange('active')}
        isActive={activeTab === 'active'}
      />
      <WorkloadCard
        label="Rejetés"
        count={stats?.rejectedEvents || 0}
        icon={<AlertCircle className="w-5 h-5 text-gray-500" />}
        variant="info"
        onClick={() => onTabChange('rejected')}
        isActive={activeTab === 'rejected'}
      />
      <WorkloadCard
        label="Doublons"
        count={duplicatesCount}
        icon={<Copy className="w-5 h-5 text-blue-500" />}
        variant="info"
        onClick={() => onTabChange('doublons')}
        isActive={activeTab === 'doublons'}
      />
      <WorkloadCard
        label="Lieux"
        count={venuesCount}
        icon={<MapPin className="w-5 h-5 text-blue-500" />}
        variant="info"
        onClick={() => onTabChange('lieux')}
        isActive={activeTab === 'lieux'}
      />
      <WorkloadCard
        label="Tous"
        count={totalCount}
        icon={<List className="w-5 h-5 text-blue-500" />}
        variant="info"
        onClick={() => onTabChange('all')}
        isActive={activeTab === 'all'}
      />
    </div>
  );
};

export default ValidationWorkload;
