import type { ReviewTier } from '@/types/application'

const tierClass: Record<ReviewTier, string> = {
  incomplete: 'bg-slate-100 text-slate-700 ring-slate-200',
  ineligible: 'bg-red-50 text-red-800 ring-red-200',
  priority_review: 'bg-lime-100 text-lime-900 ring-lime-300',
  standard_review: 'bg-emerald-50 text-emerald-900 ring-emerald-200',
  manual_review: 'bg-amber-50 text-amber-900 ring-amber-200',
}

const tierLabel: Record<ReviewTier, string> = {
  incomplete: 'Incomplete',
  ineligible: 'Ineligible',
  priority_review: 'Priority review',
  standard_review: 'Standard review',
  manual_review: 'Manual review',
}

export function TierBadge({ tier }: { tier: ReviewTier }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${tierClass[tier]}`}
    >
      {tierLabel[tier]}
    </span>
  )
}

export function RiskBadge({
  level,
  label,
}: {
  level: 'low' | 'medium' | 'high'
  label?: string
}) {
  const c =
    level === 'low'
      ? 'bg-slate-100 text-slate-700 ring-slate-200'
      : level === 'medium'
        ? 'bg-amber-50 text-amber-900 ring-amber-200'
        : 'bg-red-50 text-red-800 ring-red-200'
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${c}`}
    >
      {label ? <span className="normal-case text-slate-600">{label}</span> : null}
      <span>{level} risk</span>
    </span>
  )
}
