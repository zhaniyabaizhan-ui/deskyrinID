import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { ProgramId, ReviewTier, SubmittedApplication } from '@/types/application'
import { useApplications } from '@/context/ApplicationsContext'
import { Card, CardHeader } from '@/components/ui/Card'
import { TierBadge, RiskBadge } from '@/components/ui/Badge'
import {
  PROGRAM_LABELS,
  PROGRAM_IDS,
  SUBJECT_COMBO_LABELS,
} from '@/data/programs'

const tierOptions: (ReviewTier | '')[] = [
  '',
  'incomplete',
  'ineligible',
  'priority_review',
  'standard_review',
  'manual_review',
]

export default function DashboardPage() {
  const { applications, updateApplication } = useApplications()
  const [search, setSearch] = useState('')
  const [programFilter, setProgramFilter] = useState<ProgramId | ''>('')
  const [tierFilter, setTierFilter] = useState<ReviewTier | ''>('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

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

  const selected = useMemo(() => {
    if (filtered.length === 0) return null
    const byId = selectedId
      ? filtered.find((a) => a.id === selectedId)
      : null
    return byId ?? filtered[0]
  }, [filtered, selectedId])

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
            Filter, search, and open candidate packages. Scores support review —
            they do not finalize admission.
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
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Candidates ({filtered.length})
              </div>
              <ul className="max-h-[560px] divide-y divide-slate-100 overflow-y-auto">
                {filtered.map((a) => {
                  const active = selected !== null && a.id === selected.id
                  return (
                    <li key={a.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(a.id)}
                        className={`flex w-full flex-col gap-1 px-4 py-3 text-left transition hover:bg-slate-50 ${
                          active ? 'bg-lime-50/80' : ''
                        }`}
                      >
                        <span className="font-medium text-slate-900">
                          {a.form.personal.fullName}
                        </span>
                        <span className="font-mono text-xs text-slate-500">
                          {a.id}
                        </span>
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <TierBadge tier={a.evaluation.recommendation} />
                          {a.form.programId ? (
                            <span className="truncate text-xs text-slate-500">
                              {PROGRAM_LABELS[a.form.programId]}
                            </span>
                          ) : null}
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
          <div className="lg:col-span-3">
            {selected ? (
              <CandidateDetail
                app={selected}
                onUpdate={updateApplication}
              />
            ) : (
              <Card className="py-12 text-center text-slate-500">
                No candidates match filters.
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function CandidateDetail({
  app,
  onUpdate,
}: {
  app: SubmittedApplication
  onUpdate: (
    id: string,
    patch: Partial<
      Pick<SubmittedApplication, 'committeeShortlisted' | 'committeeNote'>
    >
  ) => void
}) {
  const f = app.form
  const ev = app.evaluation

  const files: { label: string; name?: string }[] = [
    { label: 'Passport / ID', name: f.uploads.passportOrId.fileName },
    { label: 'ENT certificate', name: f.uploads.entCertificate.fileName },
    { label: 'English certificate', name: f.uploads.englishCertificate.fileName },
    ...f.uploads.portfolio.map((p, i) => ({
      label: `Portfolio ${i + 1}`,
      name: p.fileName,
    })),
  ]

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title={f.personal.fullName}
          subtitle="Identification & contact — not scoring inputs."
          action={<TierBadge tier={ev.recommendation} />}
        />
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Application ID</dt>
            <dd className="font-mono text-slate-900">{app.id}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Submitted</dt>
            <dd className="text-slate-900">
              {new Date(app.submittedAt).toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Email / phone</dt>
            <dd className="text-slate-900">
              {f.personal.email} · {f.personal.phone}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Location</dt>
            <dd className="text-slate-900">
              {f.personal.city}, {f.personal.country}
            </dd>
          </div>
        </dl>
      </Card>

      <Card>
        <CardHeader title="Program & academics" />
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="text-slate-500">Program</dt>
            <dd className="font-medium text-slate-900">
              {f.programId ? PROGRAM_LABELS[f.programId] : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Subject combination</dt>
            <dd className="text-slate-900">
              {f.subjectCombination
                ? SUBJECT_COMBO_LABELS[f.subjectCombination]
                : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">ENT / English</dt>
            <dd className="text-slate-900">
              ENT {f.entScore === '' ? '—' : f.entScore} · {f.englishExamType}{' '}
              {f.englishScore === '' ? '' : f.englishScore}
            </dd>
          </div>
        </dl>
      </Card>

      <Card>
        <CardHeader title="Uploaded files (simulated)" />
        <ul className="space-y-2 text-sm">
          {files.map((x) => (
            <li
              key={x.label + (x.name ?? '')}
              className="flex justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
            >
              <span className="text-slate-600">{x.label}</span>
              <span className="font-mono text-xs text-slate-800">
                {x.name ?? '—'}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 text-sm text-slate-600">
          <span className="font-medium text-slate-800">Video: </span>
          {f.videoUrl ? (
            <a
              href={f.videoUrl}
              className="text-lime-800 underline"
              target="_blank"
              rel="noreferrer"
            >
              {f.videoUrl}
            </a>
          ) : f.videoFile.attached ? (
            'File flagged as attached (simulated)'
          ) : (
            '—'
          )}
        </div>
      </Card>

      <Card>
        <CardHeader title="Hard rules & pipeline" />
        <ul className="space-y-1 text-sm text-slate-700">
          {ev.hardRuleSummary.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </Card>

      <Card>
        <CardHeader
          title="Video transcript / summary"
          subtitle="MVP text stand-in for multimodal review."
        />
        <p className="whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm text-slate-800">
          {f.videoTranscript || '—'}
        </p>
      </Card>

      <Card>
        <CardHeader title="Authenticity risk (advisory only)" />
        <div className="flex flex-wrap gap-2">
          <RiskBadge label="Transcript" level={ev.textAuthenticityRisk} />
          <RiskBadge label="Video" level={ev.videoAuthenticityRisk} />
        </div>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
          {ev.authenticityNotes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </Card>

      {ev.subscores ? (
        <Card>
          <CardHeader
            title="Score breakdown"
            action={
              ev.overallScore !== null ? (
                <span className="text-2xl font-bold text-lime-800">
                  {ev.overallScore}
                  <span className="text-sm font-normal text-slate-500">/100</span>
                </span>
              ) : null
            }
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                ['Motivation', ev.subscores.motivation],
                ['Leadership', ev.subscores.leadership],
                ['Resilience / growth', ev.subscores.resilienceGrowth],
                ['Teamwork / problem-solving', ev.subscores.teamworkProblemSolving],
                ['Communication', ev.subscores.communication],
                ['Program alignment', ev.subscores.programAlignment],
                ['Portfolio / evidence', ev.subscores.portfolioEvidence],
              ] as const
            ).map(([k, v]) => (
              <div key={k}>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>{k}</span>
                  <span>{v}</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-lime-400"
                    style={{ width: `${v}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          {ev.explanationTags.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {ev.explanationTags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-800"
                >
                  {t}
                </span>
              ))}
            </div>
          ) : null}
        </Card>
      ) : null}

      <Card>
        <CardHeader title="Rationale (explainability)" />
        <ul className="space-y-3">
          {ev.explainFactors.map((x) => (
            <li key={x.dimension} className="flex gap-3 text-sm">
              <span
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                  x.impact === 'positive'
                    ? 'bg-lime-500'
                    : x.impact === 'negative'
                      ? 'bg-red-400'
                      : 'bg-slate-300'
                }`}
              />
              <div>
                <p className="font-medium text-slate-900">{x.dimension}</p>
                <p className="text-slate-600">{x.rationale}</p>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <CardHeader title="Committee workspace (demo)" />
        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-800">
          <input
            type="checkbox"
            checked={app.committeeShortlisted}
            onChange={(e) =>
              onUpdate(app.id, { committeeShortlisted: e.target.checked })
            }
          />
          Shortlist for next committee round
        </label>
        <label className="mt-4 block text-sm text-slate-700">
          Internal note
          <textarea
            value={app.committeeNote}
            onChange={(e) => onUpdate(app.id, { committeeNote: e.target.value })}
            rows={3}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Private note — not shown to applicant."
          />
        </label>
      </Card>
    </div>
  )
}
