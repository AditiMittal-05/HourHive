export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-9 h-9 rounded-full border-[3px] border-primary-100 border-t-primary animate-spin" />
        <p className="text-sm text-text-secondary font-medium">Loading...</p>
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border-color bg-white p-5 overflow-hidden relative">
      <div className="flex items-start justify-between">
        <div className="space-y-2.5">
          <div className="h-3 w-20 bg-slate-100 rounded-full" />
          <div className="h-8 w-14 bg-slate-100 rounded-lg" />
          <div className="h-3 w-28 bg-slate-50 rounded-full" />
        </div>
        <div className="w-12 h-12 rounded-xl bg-slate-100" />
      </div>
      <div className="absolute inset-0 -translate-x-full animate-shimmer"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.8s infinite",
        }} />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2.5">
      <div className="h-4 w-1/3 bg-slate-100 rounded-full mb-4" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="h-9 flex-1 bg-slate-100 rounded-lg"
            style={{ opacity: 1 - i * 0.12 }} />
        </div>
      ))}
    </div>
  );
}
