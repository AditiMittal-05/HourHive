export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <p className="text-sm text-text-secondary">Loading...</p>
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border-color bg-white p-5 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-4 w-24 bg-slate-200 rounded" />
          <div className="h-8 w-16 bg-slate-200 rounded" />
          <div className="h-3 w-32 bg-slate-100 rounded" />
        </div>
        <div className="w-12 h-12 rounded-xl bg-slate-200" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
      ))}
    </div>
  );
}
