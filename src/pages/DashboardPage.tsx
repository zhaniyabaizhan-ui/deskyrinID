import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { ProgramId, ReviewTier } from '@/types/application'
import { useApplications } from '@/context/ApplicationsContext'
import { Card } from '@/components/ui/Card'
import { TierBadge } from '@/components/ui/Badge'
import { PROGRAM_LABELS, PROGRAM_IDS } from '@/data/programs'
import { BUILTIN_AIDYN_ID } from '@/builtin/aidyn'

const tierOptions: (ReviewTier | '')[] = [
  '',
  'incomplete',
  'ineligible',
  'priority_review',
  'standard_review',
  'manual_review',
]

export default function DashboardPage() {
  const { applications } = useApplications()
  const [search, setSearch] = useState('')
  const [programFilter, setProgramFilter] = useState<ProgramId | ''>('')
  const [tierFilter, setTierFilter] = useState<ReviewTier | ''>('')
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return applications.filter((a) => {
      if (q) {
        const name = a.form.personal.fullName.toLowerCase()
        const id = a.id.toLowerCase()
        if (!name.includes(q) && !id.includes(q)) return false
      }
      if (programFilter && a.form.programId !== programFilter) return false
      if (tierFilter && a.evaluation.recommendation !== tierFilter) return false
      return true
    })
  }, [applications, search, programFilter, tierFilter])

  const priorityCount = applications.filter(
    (a) => a.evaluation.recommendation === 'priority_review'
  ).length
  const shortlistCount = applications.filter((a) => a.committeeShortlisted).length

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Committee dashboard
          </h1>
          <p className="mt-2 max-w-xl text-slate-600">
            Filter and search the queue. Click a candidate to open the full committee review
            workspace — scores support review; they do not finalize admission.
          </p>
        </div>
        <Link
          to="/apply"
          className="inline-flex items-center justify-center rounded-xl bg-lime-500 px-4 py-2.5 text-sm font-bold text-lime-950 shadow-sm hover:bg-lime-400"
        >
          New application
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            In system
          </p>
          <p className="mt-1 text-3xl font-bold text-slate-900">
            {applications.length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Auto priority queue
          </p>
          <p className="mt-1 text-3xl font-bold text-lime-700">{priorityCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Committee shortlist
          </p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{shortlistCount}</p>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <label className="flex-1 text-sm text-slate-700">
            Search name or ID
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="e.g. Demo or IVU-..."
            />
          </label>
          <label className="text-sm text-slate-700">
            Program
            <select
              value={programFilter}
              onChange={(e) => setProgramFilter(e.target.value as ProgramId | '')}
              className="mt-1 block w-full min-w-[200px] rounded-lg border border-slate-200 px-3 py-2 text-sm lg:w-56"
            >
              <option value="">All programs</option>
              {PROGRAM_IDS.map((id) => (
                <option key={id} value={id}>
                  {PROGRAM_LABELS[id]}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-slate-700">
            Recommendation
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value as ReviewTier | '')}
              className="mt-1 block w-full min-w-[180px] rounded-lg border border-slate-200 px-3 py-2 text-sm lg:w-48"
            >
              <option value="">All statuses</option>
              {tierOptions.slice(1).map((t) => (
                <option key={t} value={t}>
                  {t.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Card>

      {applications.length === 0 ? (
        <Card className="py-16 text-center">
          <p className="text-lg font-medium text-slate-800">No applications yet</p>
          <p className="mt-2 text-sm text-slate-500">
            Use the applicant portal to submit a demo or manual package.
          </p>
          <Link
            to="/apply"
            className="mt-6 inline-block rounded-xl bg-lime-500 px-5 py-2.5 text-sm font-bold text-lime-950"
          >
            Go to /apply
          </Link>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="py-12 text-center text-slate-500">
          No candidates match filters.
        </Card>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Candidates ({filtered.length})
          </div>
          <ul className="divide-y divide-slate-100">
            {filtered.map((a) => (
              <li key={a.id}>
                <Link
                  to={`/dashboard/candidate/${encodeURIComponent(a.id)}`}
                  className="flex flex-col gap-2 px-4 py-4 transition hover:bg-lime-50/50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-900">
                        {a.form.personal.fullName}
                      </span>
                      {a.id === BUILTIN_AIDYN_ID ? (
                        <span className="rounded-full bg-lime-200/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-lime-950">
                          Built-in demo
                        </span>
                      ) : null}
                    </div>
                    <span className="mt-0.5 block font-mono text-xs text-slate-500">
                      {a.id}
                    </span>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <TierBadge tier={a.evaluation.recommendation} />
                      {a.form.programId ? (
                        <span className="truncate text-xs text-slate-500">
                          {PROGRAM_LABELS[a.form.programId]}
                        </span>
                      ) : null}
                      {a.evaluation.overallScore !== null ? (
                        <span className="text-xs font-semibold text-slate-600">
                          Score {a.evaluation.overallScore}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-lime-800">
                    Open review →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
