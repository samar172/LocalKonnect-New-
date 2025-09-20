import React from 'react';

// Generic skeleton block
export const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-100/80 dark:bg-gray-600/50 ${className}`} />
);

// Skeleton for an Event Card (matches EventCard aspect and layout)
export const SkeletonEventCard = () => (
  <div className="w-full">
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border h-full flex flex-col">
      {/* Image placeholder */}
      <div className="relative overflow-hidden flex-grow" style={{ aspectRatio: '2/3' }}>
        <Skeleton className="w-full h-full" />
      </div>

      {/* Content placeholder */}
      <div className="p-3 lg:p-4 space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  </div>
);

// Skeleton for the Hero section
export const SkeletonHero = () => (
  <section className="relative w-full h-[670px] bg-gray-900 text-white overflow-hidden">
    <div className="absolute inset-0">
      <Skeleton className="w-full h-full opacity-20" />
    </div>
    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />

    <div className="relative z-10 h-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="w-full h-full flex items-center">
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left text skeletons */}
          <div className="md:max-w-md space-y-4">
            <Skeleton className="h-4 w-32 bg-white/30" />
            <Skeleton className="h-10 w-3/4 bg-white/30" />
            <Skeleton className="h-5 w-1/2 bg-white/30" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-6 w-24 bg-white/30" />
              <Skeleton className="h-9 w-32 bg-white/30 rounded-lg" />
            </div>
          </div>

          {/* Right image skeleton */}
          <div className="hidden md:flex justify-center">
            <div className="w-[280px] h-[420px] rounded-xl overflow-hidden shadow-2xl">
              <Skeleton className="w-full h-full bg-white/20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default Skeleton;

// Simple text line skeleton helper
export const SkeletonText = ({ lines = 3 }) => (
  <div className="space-y-2">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} className={`h-3 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
    ))}
  </div>
);

// Event Details header (image banner) skeleton
export const SkeletonDetailHeader = () => (
  <div className="relative overflow-hidden mb-6 rounded-none lg:rounded-xl">
    <Skeleton className="w-full h-64 md:h-96" />
  </div>
);

// Event info card skeleton
export const SkeletonDetailInfo = () => (
  <div className="bg-white rounded-xl p-6 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-5 w-32" />
    </div>
    <Skeleton className="h-8 w-2/3 mb-4" />
    <SkeletonText lines={2} />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3">
          <Skeleton className="w-5 h-5 rounded" />
          <div className="flex-1">
            <Skeleton className="h-4 w-32 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
    <Skeleton className="h-5 w-40 mb-3" />
    <SkeletonText lines={3} />
  </div>
);

// Booking sidebar skeleton (price summary)
export const SkeletonOrderSummary = () => (
  <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
    <Skeleton className="h-7 w-40 mb-6" />
    <div className="border-b pb-4 mb-4">
      <Skeleton className="h-5 w-2/3 mb-2" />
      <SkeletonText lines={3} />
    </div>
    <div className="space-y-3 border-t pt-4">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
      <div className="border-t pt-3">
        <Skeleton className="h-6 w-1/2" />
      </div>
    </div>
    <Skeleton className="h-10 w-full mt-6 rounded-lg" />
  </div>
);

// Ticket tiers skeleton list
export const SkeletonTicketTiers = ({ count = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="border rounded-lg p-4 flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-56" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
    ))}
  </div>
);
