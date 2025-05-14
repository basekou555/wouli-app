
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const ProfileSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    {/* Header skeleton */}
    <div className="space-y-4">
      <div className="h-24 md:h-36 w-full bg-gray-200 rounded-lg"></div>
      <div className="flex flex-col md:flex-row md:items-end md:gap-6">
        <div className="-mt-12 md:-mt-16 mx-auto md:mx-0">
          <div className="h-24 w-24 md:h-32 md:w-32 rounded-full bg-gray-300"></div>
        </div>
        <div className="flex-1 mt-3 md:mt-0 space-y-3">
          <div className="h-6 w-1/3 bg-gray-300 rounded"></div>
          <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
          <div className="h-4 w-2/3 bg-gray-200 rounded mt-3"></div>
        </div>
      </div>
    </div>
    
    {/* Stats cards skeleton */}
    <div className="grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg border p-2 md:p-3">
          <div className="h-5 w-1/2 bg-gray-200 rounded mx-auto mb-1"></div>
          <div className="h-3 w-1/3 bg-gray-100 rounded mx-auto"></div>
        </div>
      ))}
    </div>
    
    {/* Content skeleton */}
    <div className="space-y-4 mt-4">
      <div className="h-8 w-40 bg-gray-200 rounded"></div>
      <div className="space-y-3">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border p-4">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/3 h-40 bg-gray-200 rounded-lg"></div>
              <div className="p-4 flex-1">
                <div className="h-6 w-1/2 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 w-2/3 bg-gray-100 rounded"></div>
                  <div className="h-4 w-1/2 bg-gray-100 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default ProfileSkeleton;
