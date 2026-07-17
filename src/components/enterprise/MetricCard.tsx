import type { ComponentType } from 'react'

interface MetricCardProps {
  icon: ComponentType<{ className?: string }>
  label: string
  value: string
  tone: 'primary' | 'accent' | 'amber'
  sub?: string
}

const TONES = {
  primary: 'bg-primary-600 text-white',
  accent: 'bg-accent-600 text-white',
  amber: 'bg-amber-500 text-white',
}

const TINTS = {
  primary: 'bg-primary-50 border-primary-100',
  accent: 'bg-accent-50 border-accent-100',
  amber: 'bg-amber-50 border-amber-100',
}

export function MetricCard({ icon: Icon, label, value, tone, sub }: MetricCardProps) {
  return (
    <div className={`rounded-2xl border p-5 ${TINTS[tone]}`}>
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${TONES[tone]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-3xl font-extrabold text-slate-900">{value}</p>
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      {sub && <p className="mt-0.5 text-xs font-medium text-slate-400">{sub}</p>}
    </div>
  )
}
