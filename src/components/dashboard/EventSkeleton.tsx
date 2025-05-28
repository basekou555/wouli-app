
import React from 'react';
import { Card } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';

const EventSkeleton: React.FC = () => (
  <Card className="overflow-hidden border-gray-100">
    <div className="px-4 py-3 flex items-center justify-between border-b border-gray-50 bg-gray-50">
      <div className="flex items-center space-x-3">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16 mt-1" />
        </div>
      </div>
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>

    <Skeleton className="aspect-[16/9] w-full" />

    <div className="p-4">
      <div className="space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
    
    <div className="px-4 py-3 border-t border-gray-50 flex justify-between">
      <div className="flex space-x-2">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>
      <Skeleton className="h-4 w-20" />
    </div>
  </Card>
);

export default EventSkeleton;
