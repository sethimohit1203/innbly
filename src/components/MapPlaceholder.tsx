import { MapPin } from 'lucide-react'

export function MapPlaceholder({ className = '', label = 'Interactive map' }: { className?: string; label?: string }) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-accent-50 via-slate-100 to-primary-50 ${className}`}
    >
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      <div className="relative flex flex-col items-center gap-2 text-slate-500">
        <MapPin className="h-9 w-9 text-primary-500" />
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-slate-400">Map integration coming soon</span>
      </div>
    </div>
  )
}
