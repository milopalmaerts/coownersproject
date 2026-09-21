export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`tl-skeleton rounded-md ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-tl-border bg-tl-bg-card p-4 space-y-3">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
    </div>
  );
}

export function SkeletonList({ rows = 4 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-tl-border bg-tl-bg-card p-4 space-y-4">
      <Skeleton className="h-4 w-32" />
      <div className="divide-y divide-tl-border">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="py-3 space-y-2">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
