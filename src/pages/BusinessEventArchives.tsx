
import { BusinessLayout } from '@/components/business/BusinessLayout';
import { EventArchives } from '@/components/business/EventArchives';

export const BusinessEventArchives = () => {
  return (
    <BusinessLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Archives des événements</h1>
            <p className="text-muted-foreground">
              Retrouvez vos événements passés et leurs performances finales
            </p>
          </div>
        </div>

        <EventArchives />
      </div>
    </BusinessLayout>
  );
};
