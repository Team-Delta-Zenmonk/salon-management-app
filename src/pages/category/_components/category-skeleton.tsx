export function CategoryCardSkeleton() {
  return (
    <div className="relative overflow-hidden bg-card/80 backdrop-blur-sm border border-border/50 rounded-3xl p-6 flex flex-col justify-between min-h-[220px] animate-pulse">
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-4 w-full">
            <div className="h-14 w-14 rounded-full bg-muted shrink-0" />
            <div className="h-6 w-32 bg-muted rounded-md" />
          </div>
        </div>
        
        <div className="space-y-2 mb-6">
          <div className="h-4 w-full bg-muted/60 rounded-md" />
          <div className="h-4 w-3/4 bg-muted/60 rounded-md" />
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border/40 relative z-10">
        <div className="h-4 w-24 bg-muted/60 rounded-md" />
        <div className="flex gap-2">
          <div className="h-8 w-8 rounded-full bg-muted/80" />
          <div className="h-8 w-8 rounded-full bg-muted/80" />
        </div>
      </div>
    </div>
  );
}

export function CategoryListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
      {Array.from({ length: 6 }).map((_, i) => (
        <CategoryCardSkeleton key={`category-skeleton-${i}`} />
      ))}
    </div>
  );
}
