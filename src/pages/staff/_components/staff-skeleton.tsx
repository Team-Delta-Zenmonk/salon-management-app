export function StaffCardSkeleton() {
  return (
    <div className="relative overflow-hidden bg-card/60 backdrop-blur-md border border-border/50 rounded-3xl p-5 shadow-sm flex flex-col justify-between min-h-[240px] animate-pulse">
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
      
      <div className="relative z-10 space-y-4">
        {/* Header section skeleton */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-14 h-14 rounded-full bg-foreground/10 shrink-0" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-5 bg-foreground/10 rounded w-2/3" />
              <div className="h-3 bg-foreground/10 rounded w-1/2" />
            </div>
          </div>
          <div className="w-16 h-6 bg-foreground/5 rounded-full" />
        </div>

        {/* Info summary skeletons */}
        <div className="space-y-2 pt-2 border-t border-border/10">
          <div className="h-4 bg-foreground/5 rounded w-3/4" />
          <div className="h-4 bg-foreground/5 rounded w-1/2" />
        </div>
      </div>

      {/* Footer buttons skeleton */}
      <div className="flex justify-between items-center pt-4 border-t border-border/10 relative z-10">
        <div className="h-4 bg-foreground/5 rounded w-24" />
        <div className="flex gap-2">
          <div className="w-8 h-8 rounded-full bg-foreground/10" />
          <div className="w-8 h-8 rounded-full bg-foreground/10" />
          <div className="w-8 h-8 rounded-full bg-foreground/10" />
        </div>
      </div>
    </div>
  );
}

export function StaffListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 pb-20">
      {Array.from({ length: 8 }).map((_, i) => (
        <StaffCardSkeleton key={`staff-skeleton-${i}`} />
      ))}
    </div>
  );
}
