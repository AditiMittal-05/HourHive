import { motion } from "framer-motion";
import { Hexagon } from "lucide-react";

export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          {/* Spinning ring */}
          <div className="w-12 h-12 rounded-full border-[3px] border-primary-100 border-t-primary animate-spin" />
          {/* Logo center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #2563EB, #10B981)" }}>
              <Hexagon className="h-3.5 w-3.5 text-white" strokeWidth={1.5} />
            </div>
          </div>
        </div>
        <p className="text-sm text-text-secondary font-medium animate-pulse">Loading...</p>
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border-color bg-white p-5 overflow-hidden relative">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2.5 flex-1">
          <div className="h-3 w-20 skeleton" />
          <div className="h-8 w-14 skeleton" />
          <div className="h-3 w-28 skeleton" />
        </div>
        <div className="w-12 h-12 rounded-xl skeleton" />
      </div>
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.8s infinite",
        }} />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="rounded-2xl border border-border-color bg-white overflow-hidden">
      <div className="p-4 border-b border-border-color bg-light-bg">
        <div className="h-4 w-1/3 skeleton" />
      </div>
      <div className="divide-y divide-border-color">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-3.5" style={{ opacity: 1 - i * 0.1 }}>
            <div className="w-8 h-8 rounded-full skeleton flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 skeleton" style={{ width: `${60 + Math.random() * 25}%` }} />
              <div className="h-2.5 skeleton" style={{ width: `${40 + Math.random() * 20}%` }} />
            </div>
            <div className="h-6 w-16 skeleton rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-5 py-3.5">
      <div className="w-8 h-8 rounded-full skeleton flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 w-2/5 skeleton" />
        <div className="h-2.5 w-1/4 skeleton" />
      </div>
    </div>
  );
}
