import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Skeleton loading cho 1 card sản phẩm.
 * Mô phỏng layout thật của ProductCard: ảnh + info + badges + actions.
 */
export function ProductCardSkeleton({ variant = 'default' }) {
  const cols = {
    default: 'grid-cols-2 md:grid-cols-3',
    wide: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    five: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
  };

  const count = variant === 'wide' ? 8 : variant === 'five' ? 10 : 6;

  return (
    <div className={`grid gap-4 md:gap-6 ${cols[variant] || cols.default}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="group relative bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-neutral-800"
        >
          {/* Image skeleton */}
          <div className="relative aspect-square bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-neutral-800 dark:via-neutral-700 dark:to-neutral-800 overflow-hidden">
            <Skeleton className="absolute inset-0 rounded-none" />
            {/* Floating badges (mô phỏng vị trí) */}
            <div className="absolute top-3 left-3">
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <div className="absolute top-3 right-3">
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>

          {/* Info skeleton */}
          <div className="p-3 md:p-4 space-y-2.5">
            {/* Brand */}
            <Skeleton className="h-3 w-12" />
            {/* Name */}
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-3/4" />
            </div>
            {/* Rating */}
            <div className="flex items-center gap-1">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-3 w-8" />
            </div>
            {/* Price */}
            <div className="flex items-center gap-2 pt-1">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-3.5 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton riêng cho 1 card (dùng khi cần 1 cái).
 */
export function SingleProductCardSkeleton() {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-neutral-800">
      <div className="relative aspect-square bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-neutral-800 dark:via-neutral-700 dark:to-neutral-800">
        <Skeleton className="absolute inset-0 rounded-none" />
      </div>
      <div className="p-3 md:p-4 space-y-2.5">
        <Skeleton className="h-3 w-12" />
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-3/4" />
        </div>
        <div className="flex items-center gap-1">
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-3 w-8" />
        </div>
        <div className="flex items-center gap-2 pt-1">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-3.5 w-16" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton cho List View (hàng ngang trong admin)
 */
export function ProductListSkeleton({ rows = 6 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-3 bg-white dark:bg-neutral-900 rounded-lg border border-gray-100 dark:border-neutral-800"
        >
          <Skeleton className="w-16 h-16 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton cho PDP detail page
 */
export function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery */}
          <div className="space-y-4">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          </div>
          {/* Info */}
          <div className="space-y-5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-9 w-3/4" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-4" />
            </div>
            <Skeleton className="h-8 w-40" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-12 rounded-md" />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <div className="flex gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-10 rounded-full" />
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Skeleton className="h-12 flex-1 rounded-lg" />
              <Skeleton className="h-12 flex-1 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
