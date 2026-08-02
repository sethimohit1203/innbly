import React from 'react'

export function PropertyCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-card">
      {/* Image Block */}
      <div className="relative aspect-[4/3] w-full animate-pulse bg-slate-100" />

      {/* Info Block */}
      <div className="flex flex-1 flex-col p-6">
        {/* Title & Rating */}
        <div className="flex items-start justify-between gap-4">
          <div className="h-5 w-2/3 animate-pulse rounded-lg bg-slate-150" />
          <div className="h-5 w-12 animate-pulse rounded-lg bg-slate-150" />
        </div>

        {/* Neighborhood / Region */}
        <div className="mt-2 h-4 w-1/3 animate-pulse rounded-lg bg-slate-100" />

        {/* Badges / Metrics Row */}
        <div className="mt-4 flex items-center gap-3">
          <div className="h-6 w-16 animate-pulse rounded-full bg-slate-100" />
          <div className="h-6 w-20 animate-pulse rounded-full bg-slate-100" />
        </div>

        {/* Divider */}
        <div className="my-5 border-t border-slate-100" />

        {/* Details List */}
        <div className="space-y-2">
          <div className="h-4 w-4/5 animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
        </div>

        {/* Footer Row (Price & Action) */}
        <div className="mt-auto pt-6 flex items-center justify-between">
          <div className="h-6 w-24 animate-pulse rounded-lg bg-slate-150" />
          <div className="h-9 w-20 animate-pulse rounded-xl bg-slate-150" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonLoader({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  )
}
